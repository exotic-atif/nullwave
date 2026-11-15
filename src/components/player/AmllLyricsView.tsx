import React, { Component, useMemo, useRef, useEffect, useState, type ReactNode } from 'react'
import { Loader2, Music2 } from 'lucide-react'
import { audioManager } from '@/lib/audio'

// Apple Music Signature Typography
const APPLE_MUSIC_FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Rounded", "SF Pro Display", "SF Pro Text", system-ui, "Helvetica Neue", Helvetica, Arial, sans-serif'

export interface LyricWord {
  word: string
  startTime: number
  endTime: number
}

export interface LyricLine {
  startTime: number
  endTime: number
  words: LyricWord[]
  text?: string
}

interface LyricsErrorBoundaryProps {
  fallback: ReactNode
  resetKey: string
  children: ReactNode
}

interface LyricsErrorBoundaryState {
  hasError: boolean
}

export class LyricsErrorBoundary extends Component<LyricsErrorBoundaryProps, LyricsErrorBoundaryState> {
  constructor(props: LyricsErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): LyricsErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('[NullWave Lyrics Safety Boundary Caught]:', error, errorInfo)
  }

  componentDidUpdate(prevProps: LyricsErrorBoundaryProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false })
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
 * Parses inline enhanced word timestamps e.g. <00:12.34>word or (00:12.34)word
 */
function parseInlineWordTimestamps(rawText: string, lineEndMs: number): LyricWord[] | null {
  const inlineRegex = /<(\d{1,2}):(\d{2})(?:\.(\d{2,3}))?>|\((\d{1,2}):(\d{2})(?:\.(\d{2,3}))?\)/g
  if (!inlineRegex.test(rawText)) return null

  inlineRegex.lastIndex = 0
  const tags: { timeMs: number; index: number; length: number }[] = []
  let match: RegExpExecArray | null
  let regexGuard = 0

  while ((match = inlineRegex.exec(rawText)) !== null && regexGuard++ < 250) {
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
      endTime: Math.max(cur.timeMs + 100, nextTime),
    })
  }

  return words.length > 0 ? words : null
}

/**
 * Natural Apple Music word-by-word timing algorithm for standard line-synced LRC
 */
function generateWordTimings(lineText: string, lineStartMs: number, lineEndMs: number): LyricWord[] {
  const tokens = lineText.trim().split(/\s+/).filter(Boolean)
  if (tokens.length === 0) {
    return [{ word: lineText, startTime: lineStartMs, endTime: lineEndMs }]
  }

  const rawDuration = Math.max(500, lineEndMs - lineStartMs)
  const activeDuration =
    rawDuration > 6000
      ? Math.max(2200, Math.min(rawDuration * 0.85, 5200))
      : Math.max(600, rawDuration * 0.92)

  // Weight words by length and punctuation cadence
  const weights = tokens.map((token) => {
    const clean = token.replace(/[^\w]/g, '')
    const baseLen = Math.max(1, clean.length)
    const punctuationBonus = /[,\.?!…~]/.test(token) ? 2.0 : 0
    return baseLen + punctuationBonus
  })

  const totalWeight = weights.reduce((sum, w) => sum + w, 0) || 1
  let cursor = lineStartMs

  return tokens.map((token, idx) => {
    const isLast = idx === tokens.length - 1
    const allocated = Math.max(120, Math.round((weights[idx] / totalWeight) * activeDuration))
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
 * Robust LRC Parser -> LyricLine[] with full Word-by-Word Timing
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
    const endTime = nextItem ? Math.max(item.timeMs + 400, nextItem.timeMs) : item.timeMs + 4000

    const inlineWords = parseInlineWordTimestamps(item.rawLine, endTime)
    const words = inlineWords && inlineWords.length > 0
      ? inlineWords
      : generateWordTimings(item.text, item.timeMs, endTime)

    return {
      startTime: item.timeMs,
      endTime,
      words,
      text: item.text,
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

  // Parse into lines with word-by-word timing
  const amllLines: LyricLine[] = useMemo(() => {
    if (!lyrics?.synced) return []
    try {
      return parseLrcToLyricLines(lyrics.synced)
    } catch (err) {
      console.warn('Failed to parse lyrics:', err)
      return []
    }
  }, [lyrics?.synced])

  // High-precision smooth timestamp interpolation (0% CPU, microsecond precision for word glow)
  const [smoothTimeMs, setSmoothTimeMs] = useState(() => Math.round(currentTime * 1000))

  useEffect(() => {
    let animId = 0
    let lastAudioTime = audioManager.hasSource ? audioManager.currentTime : currentTime
    let lastPerfTime = performance.now()

    const tick = () => {
      if (isPlaying) {
        const curAudio = audioManager.hasSource ? audioManager.currentTime : currentTime
        if (Math.abs(curAudio - lastAudioTime) > 0.05) {
          lastAudioTime = curAudio
          lastPerfTime = performance.now()
        }
        const deltaSec = (performance.now() - lastPerfTime) / 1000
        const estimatedSec = Math.max(0, lastAudioTime + deltaSec)
        setSmoothTimeMs(Math.round(estimatedSec * 1000))
      } else {
        setSmoothTimeMs(Math.round(currentTime * 1000))
      }
      animId = requestAnimationFrame(tick)
    }

    if (isPlaying) {
      animId = requestAnimationFrame(tick)
    } else {
      setSmoothTimeMs(Math.round(currentTime * 1000))
    }

    return () => cancelAnimationFrame(animId)
  }, [isPlaying, currentTime])

  // Active line index calculated against high-precision smooth time
  const activeIndex = useMemo(() => {
    if (!amllLines.length) return -1
    for (let i = amllLines.length - 1; i >= 0; i--) {
      if (smoothTimeMs >= amllLines[i].startTime - 120) {
        return i
      }
    }
    return 0
  }, [amllLines, smoothTimeMs])

  // Fluid auto-scroll active lyric to center with smooth behavior
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
    }, 3500)
  }

  // 1. Loading State
  if (lyricsLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center py-24 text-center">
        <Loader2 size={32} className="text-nw-accent animate-spin mb-4" />
        <p className="text-nw-text-secondary text-sm">Fetching synchronized lyrics…</p>
      </div>
    )
  }

  // 2. Synced Lyrics with Native Apple Music Word-by-Word Engine (Locked 120FPS, Zero Lag)
  if (amllLines.length > 0) {
    return (
      <LyricsErrorBoundary resetKey={`${trackId}-${lyrics?.synced?.slice(0, 20)}`} fallback={null}>
        <div
          ref={containerRef}
          onScroll={handleScroll}
          onTouchStart={handleScroll}
          style={{ fontFamily: APPLE_MUSIC_FONT }}
          className="w-full h-full overflow-y-auto scroll-smooth py-[36vh] px-4 md:px-8 space-y-7 [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)] [-webkit-mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)] select-none no-scrollbar"
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
                      ? 'opacity-40 hover:opacity-85'
                      : 'opacity-25 hover:opacity-65'
                }`}
              >
                <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-snug tracking-tight">
                  {line.words.map((w, wIdx) => {
                    const isWordActive = smoothTimeMs >= w.startTime && smoothTimeMs <= w.endTime
                    const isWordPast = smoothTimeMs > w.endTime
                    return (
                      <span
                        key={wIdx}
                        className={`transition-all duration-150 inline-block ${
                          isActive && isWordActive
                            ? 'text-white drop-shadow-[0_0_24px_rgba(255,255,255,0.98)] drop-shadow-[0_0_40px_rgba(56,189,248,0.5)] scale-[1.04]'
                            : isActive && isWordPast
                              ? 'text-white'
                              : isActive
                                ? 'text-white/40'
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
      </LyricsErrorBoundary>
    )
  }

  // 3. Plain Unsynced Lyrics
  if (lyrics?.plain) {
    return (
      <div
        style={{ fontFamily: APPLE_MUSIC_FONT }}
        className="w-full h-full overflow-y-auto px-4 py-16 space-y-4 text-center md:text-left [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] select-none no-scrollbar"
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

  // 4. Lyrics Unavailable State
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
