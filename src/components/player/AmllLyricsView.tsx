import React, { Component, useMemo, useRef, useEffect, useState, type ReactNode } from 'react'
import { LyricPlayer } from '@applemusic-like-lyrics/react'
import type { LyricLine, LyricWord } from '@applemusic-like-lyrics/core'
import { Loader2, Music2 } from 'lucide-react'
import '@applemusic-like-lyrics/core/style.css'

// Apple Music Typography & Fluid Word Styling
const APPLE_MUSIC_FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Rounded", "SF Pro Display", "SF Pro Text", system-ui, "Helvetica Neue", Helvetica, Arial, sans-serif'

interface LyricsErrorBoundaryProps {
  fallback: ReactNode
  resetKey: string
  children: ReactNode
}

interface LyricsErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class LyricsErrorBoundary extends Component<LyricsErrorBoundaryProps, LyricsErrorBoundaryState> {
  constructor(props: LyricsErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): LyricsErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('[AMLL Lyrics Error Caught & Handled Safely]:', error, errorInfo)
  }

  componentDidUpdate(prevProps: LyricsErrorBoundaryProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: undefined })
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

/**
 * Checks for enhanced inline word timestamps e.g. <00:12.34>word or (00:12.34)word
 */
function parseInlineWordTimestamps(rawText: string, lineEndMs: number): LyricWord[] | null {
  const inlineRegex = /<(\d{1,2}):(\d{2})(?:\.(\d{2,3}))?>|\((\d{1,2}):(\d{2})(?:\.(\d{2,3}))?\)/g
  if (!inlineRegex.test(rawText)) return null

  inlineRegex.lastIndex = 0
  const tags: { timeMs: number; index: number; length: number }[] = []
  let match: RegExpExecArray | null

  while ((match = inlineRegex.exec(rawText)) !== null) {
    const min = parseInt(match[1] || match[4], 10)
    const sec = parseInt(match[2] || match[5], 10)
    const rawMs = match[3] || match[6]
    const ms = rawMs ? (rawMs.length === 2 ? parseInt(rawMs, 10) * 10 : parseInt(rawMs, 10)) : 0
    tags.push({
      timeMs: min * 60000 + sec * 1000 + ms,
      index: match.index,
      length: match[0].length,
    })
  }

  if (tags.length === 0) return null

  const words: LyricWord[] = []
  for (let i = 0; i < tags.length; i++) {
    const cur = tags[i]
    const startPos = cur.index + cur.length
    const endPos = i + 1 < tags.length ? tags[i + 1].index : rawText.length
    const wordStr = rawText.slice(startPos, endPos)
    if (!wordStr) continue

    const nextTime = i + 1 < tags.length ? tags[i + 1].timeMs : lineEndMs
    words.push({
      word: wordStr,
      startTime: cur.timeMs,
      endTime: Math.max(cur.timeMs + 120, nextTime),
    })
  }

  return words.length > 0 ? words : null
}

/**
 * Generates natural Apple Music word-by-word timing for standard line-synced LRC
 */
function generateWordTimings(lineText: string, lineStartMs: number, lineEndMs: number): LyricWord[] {
  const tokens = lineText.trim().split(/\s+/).filter(Boolean)
  if (tokens.length === 0) {
    return [{ word: lineText, startTime: lineStartMs, endTime: lineEndMs }]
  }

  const rawDuration = Math.max(600, lineEndMs - lineStartMs)

  // Long instrumental breaks shouldn't stretch sung words unnaturally
  const activeDuration =
    rawDuration > 6500
      ? Math.max(2200, Math.min(rawDuration * 0.85, 5800))
      : Math.max(700, rawDuration * 0.94)

  // Weight words by length and punctuation sustains (commas, periods, question marks hold notes)
  const weights = tokens.map((token) => {
    const clean = token.replace(/[^\w]/g, '')
    const baseLen = Math.max(1, clean.length)
    const punctuationBonus = /[,\.?!…~]/.test(token) ? 2.2 : 0
    return baseLen + punctuationBonus
  })

  const totalWeight = weights.reduce((sum, w) => sum + w, 0) || 1
  let cursor = lineStartMs

  return tokens.map((token, idx) => {
    const isLast = idx === tokens.length - 1
    const allocated = Math.max(150, Math.round((weights[idx] / totalWeight) * activeDuration))
    const start = cursor
    const end = isLast
      ? Math.max(start + allocated, lineStartMs + Math.round(activeDuration))
      : start + allocated
    cursor = end

    return {
      word: isLast ? token : `${token} `,
      startTime: start,
      endTime: end,
    }
  })
}

/**
 * Robust LRC Parser -> AMLL LyricLine[] with full Word-by-Word Timing
 */
export function parseLrcToLyricLines(lrcText: string): LyricLine[] {
  if (!lrcText || typeof lrcText !== 'string') return []

  const rawLines = lrcText.split(/\r?\n/)
  const parsed: { timeMs: number; text: string; rawLine: string }[] = []
  const timeRegex = /\[(\d{1,2}):(\d{2})(?:\.(\d{2,3}))?\]/g

  for (const line of rawLines) {
    const cleanText = line.replace(timeRegex, '').trim()
    if (!cleanText) continue

    let match: RegExpExecArray | null
    timeRegex.lastIndex = 0
    while ((match = timeRegex.exec(line)) !== null) {
      const min = parseInt(match[1], 10)
      const sec = parseInt(match[2], 10)
      const ms = match[3]
        ? match[3].length === 2
          ? parseInt(match[3], 10) * 10
          : parseInt(match[3], 10)
        : 0
      const timeMs = min * 60000 + sec * 1000 + ms
      parsed.push({ timeMs, text: cleanText, rawLine: line.replace(timeRegex, '') })
    }
  }

  parsed.sort((a, b) => a.timeMs - b.timeMs)

  return parsed.map((item, index) => {
    const nextItem = parsed[index + 1]
    const endTime = nextItem ? Math.max(item.timeMs + 500, nextItem.timeMs) : item.timeMs + 4500

    // Try parsing enhanced inline word timestamps first; fallback to natural weighted word distribution
    const inlineWords = parseInlineWordTimestamps(item.rawLine, endTime)
    const words = inlineWords && inlineWords.length > 0
      ? inlineWords
      : generateWordTimings(item.text, item.timeMs, endTime)

    return {
      startTime: item.timeMs,
      endTime,
      words,
      translatedLyric: '',
      romanLyric: '',
      isBG: false,
      isDuet: false,
    }
  })
}

interface AmllLyricsViewProps {
  lyrics: { synced: string | null; plain: string | null } | null
  lyricsLoading: boolean
  currentTime: number // seconds
  isPlaying: boolean
  onSeek: (seconds: number) => void
  isMobile?: boolean
  trackId?: string
}

export function AmllLyricsView({
  lyrics,
  lyricsLoading,
  currentTime,
  isPlaying,
  onSeek,
  isMobile = false,
  trackId = 'track',
}: AmllLyricsViewProps) {
  const [userScrolled, setUserScrolled] = useState(false)
  const userScrollTimeout = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const lineRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Parse into AMLL format with word-by-word timing
  const amllLines: LyricLine[] = useMemo(() => {
    if (!lyrics?.synced) return []
    try {
      return parseLrcToLyricLines(lyrics.synced)
    } catch (err) {
      console.warn('Failed to parse lyrics for AMLL:', err)
      return []
    }
  }, [lyrics?.synced])

  // Active index for fallback renderer
  const currentTimeMs = Math.round(currentTime * 1000)
  const activeIndex = useMemo(() => {
    if (!amllLines.length) return -1
    for (let i = amllLines.length - 1; i >= 0; i--) {
      if (currentTimeMs >= amllLines[i].startTime - 150) {
        return i
      }
    }
    return 0
  }, [amllLines, currentTimeMs])

  // Auto-scroll for fallback view
  useEffect(() => {
    if (userScrolled || activeIndex < 0) return
    const el = lineRefs.current[activeIndex]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [activeIndex, userScrolled])

  const handleScroll = () => {
    setUserScrolled(true)
    if (userScrollTimeout.current) window.clearTimeout(userScrollTimeout.current)
    userScrollTimeout.current = window.setTimeout(() => {
      setUserScrolled(false)
    }, 4000)
  }

  // 1. Loading State
  if (lyricsLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center py-24 text-center">
        <Loader2 size={32} className="text-nw-accent animate-spin mb-4" />
        <p className="text-nw-text-secondary text-sm">Fetching Apple Music-grade synced lyrics…</p>
      </div>
    )
  }

  // 2. Fallback Render Component with Word-by-Word Highlighting (used if WebGL/AMLL errors out)
  const FallbackSyncedView = (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{ fontFamily: APPLE_MUSIC_FONT }}
      className="w-full h-full overflow-y-auto scroll-smooth py-[38vh] px-4 space-y-6 [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)] [-webkit-mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)] select-none"
    >
      {amllLines.map((line, idx) => {
        const isActive = idx === activeIndex
        const isPast = idx < activeIndex
        return (
          <button
            key={`${line.startTime}-${idx}`}
            ref={(el) => {
              lineRefs.current[idx] = el
            }}
            onClick={() => onSeek(line.startTime / 1000)}
            className={`w-full ${isMobile ? 'text-center' : 'text-left'} transition-all duration-300 rounded-2xl px-4 py-2 cursor-pointer block tracking-tight ${
              isActive
                ? 'scale-[1.03] origin-left'
                : isPast
                  ? 'opacity-40 hover:opacity-80'
                  : 'opacity-20 hover:opacity-60'
            }`}
          >
            <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-snug">
              {line.words.map((w, wIdx) => {
                const isWordActive = currentTimeMs >= w.startTime && currentTimeMs <= w.endTime
                const isWordPast = currentTimeMs > w.endTime
                return (
                  <span
                    key={wIdx}
                    className={`transition-all duration-150 inline-block ${
                      isActive && isWordActive
                        ? 'text-white drop-shadow-[0_0_24px_rgba(255,255,255,0.95)] scale-[1.04]'
                        : isActive && isWordPast
                          ? 'text-white'
                          : isActive
                            ? 'text-white/45'
                            : isPast
                              ? 'text-white/60'
                              : 'text-white/30'
                    }`}
                  >
                    {w.word}
                  </span>
                )
              })}
            </p>
          </button>
        )
      })}
    </div>
  )

  // 3. Synced Lyrics with AMLL Word-by-Word Glowing Engine
  if (amllLines.length > 0) {
    return (
      <LyricsErrorBoundary resetKey={`${trackId}-${lyrics?.synced?.slice(0, 20)}`} fallback={FallbackSyncedView}>
        <div
          style={{ fontFamily: APPLE_MUSIC_FONT }}
          className="w-full h-full overflow-hidden flex flex-col items-center justify-center select-none amll-apple-theme"
        >
          <LyricPlayer
            lyricLines={amllLines}
            currentTime={currentTimeMs}
            playing={isPlaying}
            enableSpring={true}
            enableBlur={true}
            enableScale={true}
            alignAnchor={isMobile ? 'center' : 'top'}
            alignPosition={isMobile ? 0.45 : 0.22}
            wordFadeWidth={0.5}
            onLyricLineClick={(e) => {
              if (typeof e?.lineIndex === 'number' && amllLines[e.lineIndex]) {
                onSeek(amllLines[e.lineIndex].startTime / 1000)
              }
            }}
            className="w-full h-full"
            style={{
              fontFamily: APPLE_MUSIC_FONT,
              fontWeight: 800,
              letterSpacing: '-0.025em',
            }}
          />
        </div>
      </LyricsErrorBoundary>
    )
  }

  // 4. Plain Unsynced Lyrics
  if (lyrics?.plain) {
    return (
      <div
        style={{ fontFamily: APPLE_MUSIC_FONT }}
        className="w-full h-full overflow-y-auto px-4 py-12 space-y-4 text-center md:text-left [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]"
      >
        {lyrics.plain
          .split(/\r?\n/)
          .filter(Boolean)
          .map((line, i) => (
            <p key={i} className="text-xl md:text-2xl font-bold tracking-tight text-white/80">
              {line}
            </p>
          ))}
      </div>
    )
  }

  // 5. Lyrics Unavailable (Never crashes the page!)
  return (
    <div className="w-full h-full flex flex-col items-center justify-center py-24 text-center text-nw-text-secondary select-none">
      <Music2 size={36} className="text-white/20 mb-3" />
      <p className="text-base font-medium text-white/70">Lyrics unavailable</p>
      <p className="text-xs text-white/40 mt-1 max-w-xs">
        No synchronized lyrics found for this track. Playback continues uninterrupted.
      </p>
    </div>
  )
}
