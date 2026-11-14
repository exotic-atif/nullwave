import React, { Component, useMemo, useRef, useEffect, useState, type ReactNode } from 'react'
import { LyricPlayer } from '@applemusic-like-lyrics/react'
import type { LyricLine } from '@applemusic-like-lyrics/core'
import { Loader2, Music2 } from 'lucide-react'
import '@applemusic-like-lyrics/core/style.css'

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
 * Robust LRC Parser -> AMLL LyricLine[] (milliseconds timestamps)
 */
export function parseLrcToLyricLines(lrcText: string): LyricLine[] {
  if (!lrcText || typeof lrcText !== 'string') return []

  const rawLines = lrcText.split(/\r?\n/)
  const parsed: { timeMs: number; text: string }[] = []
  const timeRegex = /\[(\d{1,2}):(\d{2})(?:\.(\d{2,3}))?\]/g

  for (const line of rawLines) {
    const text = line.replace(timeRegex, '').trim()
    if (!text) continue

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
      parsed.push({ timeMs, text })
    }
  }

  parsed.sort((a, b) => a.timeMs - b.timeMs)

  return parsed.map((item, index) => {
    const nextItem = parsed[index + 1]
    const endTime = nextItem ? Math.max(item.timeMs + 500, nextItem.timeMs) : item.timeMs + 4500

    return {
      startTime: item.timeMs,
      endTime,
      words: [
        {
          word: item.text,
          startTime: item.timeMs,
          endTime,
        },
      ],
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

  // Parse into AMLL format
  const amllLines: LyricLine[] = useMemo(() => {
    if (!lyrics?.synced) return []
    try {
      return parseLrcToLyricLines(lyrics.synced)
    } catch (err) {
      console.warn('Failed to parse lyrics for AMLL:', err)
      return []
    }
  }, [lyrics?.synced])

  // Simple active index for fallback renderer
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

  // 2. Fallback Render Component (used if WebGL/AMLL errors out)
  const FallbackSyncedView = (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="w-full h-full overflow-y-auto scroll-smooth py-[38vh] px-4 space-y-6 [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)] [-webkit-mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)]"
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
            className={`w-full ${isMobile ? 'text-center' : 'text-left'} transition-all duration-300 rounded-2xl px-4 py-2 cursor-pointer block ${
              isActive
                ? 'text-white font-extrabold text-3xl lg:text-4xl scale-[1.03] origin-left drop-shadow-[0_4px_24px_rgba(255,255,255,0.4)]'
                : isPast
                  ? 'text-white/40 hover:text-white/80 font-semibold text-2xl lg:text-3xl'
                  : 'text-white/20 hover:text-white/60 font-semibold text-2xl lg:text-3xl'
            }`}
          >
            {line.words.map((w) => w.word).join(' ')}
          </button>
        )
      })}
    </div>
  )

  // 3. Synced Lyrics with AMLL
  if (amllLines.length > 0) {
    return (
      <LyricsErrorBoundary resetKey={`${trackId}-${lyrics?.synced?.slice(0, 20)}`} fallback={FallbackSyncedView}>
        <div className="w-full h-full overflow-hidden flex flex-col items-center justify-center select-none">
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
          />
        </div>
      </LyricsErrorBoundary>
    )
  }

  // 4. Plain Unsynced Lyrics
  if (lyrics?.plain) {
    return (
      <div className="w-full h-full overflow-y-auto px-4 py-12 space-y-4 text-center md:text-left [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]">
        {lyrics.plain
          .split(/\r?\n/)
          .filter(Boolean)
          .map((line, i) => (
            <p key={i} className="text-xl md:text-2xl font-medium text-white/80">
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
