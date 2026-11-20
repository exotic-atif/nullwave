import React, { Component, useEffect, useRef, type ReactNode } from 'react'
import type { Track } from '@/types'
import { audioManager } from '@/lib/audio'

/**
 * Clean track title and artist name for 100% match rate on LyricsPlus & Apple Music catalogs
 */
export function cleanTrackTitle(title: string): string {
  return (title || '')
    .replace(/\s*[\(\[](feat|ft|official|audio|video|lyrics?|remaster(?:ed)?|radio\s+edit|extended|deluxe|bonus|from\s+"[^"]+").*?[\)\]]/gi, '')
    .replace(/\s*-\s*(feat|ft|official|audio|video|remaster(?:ed)?|radio\s+edit|extended).*$/gi, '')
    .trim()
}

export function cleanArtistName(artist: string): string {
  return (artist || '')
    .split(/[,&/]/)[0]
    .replace(/\s*(feat|ft)\.?.*$/gi, '')
    .trim()
}

export const UNIVERSAL_LYRICS_FONT_FAMILY =
  "Inter, -apple-system, BlinkMacSystemFont, 'SF Pro Rounded', 'SF Pro Display', 'SF Pro Text', 'Noto Sans Devanagari', 'Noto Sans Bengali', 'Noto Sans Arabic', 'Noto Sans Gurmukhi', 'Noto Sans Tamil', 'Noto Sans Telugu', 'Noto Sans Thai', 'Nirmala UI', 'Segoe UI', system-ui, sans-serif"

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
    console.warn('[NullWave am-lyrics Safety Boundary Caught]:', error, errorInfo)
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

interface AmllLyricsViewProps {
  track: Track
  currentTime: number // seconds
  isPlaying?: boolean
  onSeek: (seconds: number) => void
  isMobile?: boolean
  // Backward compatibility props
  lyrics?: { synced: string | null; plain: string | null } | null
  lyricsLoading?: boolean
  trackId?: string
}

export function AmllLyricsView({
  track,
  currentTime,
  isPlaying = false,
  onSeek,
  isMobile = false,
}: AmllLyricsViewProps) {
  const amLyricsRef = useRef<HTMLElement>(null)

  // Direct High-Precision RequestAnimationFrame Loop for Buttery Smooth 60/120FPS Word-by-Word Character Wipe
  useEffect(() => {
    let animId: number
    let lastSetMs = -1

    const syncLoop = () => {
      const el = amLyricsRef.current as any
      if (el && isPlaying) {
        const curMs = Math.round(audioManager.currentTime * 1000)
        if (curMs !== lastSetMs) {
          lastSetMs = curMs
          el.currentTime = curMs
        }
      }
      animId = requestAnimationFrame(syncLoop)
    }

    if (isPlaying) {
      animId = requestAnimationFrame(syncLoop)
    } else {
      const el = amLyricsRef.current as any
      if (el) {
        el.currentTime = Math.round(currentTime * 1000)
      }
    }

    return () => {
      if (animId) cancelAnimationFrame(animId)
    }
  }, [isPlaying, currentTime])

  // Handle line click seek events dispatched by am-lyrics
  useEffect(() => {
    const el = amLyricsRef.current
    if (!el) return

    const handleLineClick = (e: any) => {
      if (e.detail && typeof e.detail.timestamp === 'number') {
        onSeek(e.detail.timestamp / 1000)
      }
    }

    el.addEventListener('line-click', handleLineClick)
    return () => {
      el.removeEventListener('line-click', handleLineClick)
    }
  }, [onSeek])

  const cleanTitle = cleanTrackTitle(track.title)
  const cleanArtist = cleanArtistName(track.artist)
  const cleanQuery = `${cleanTitle} ${cleanArtist}`

  return (
    <LyricsErrorBoundary resetKey={track.id} fallback={null}>
      <div
        className="w-full h-full relative flex flex-col items-stretch justify-start overflow-hidden"
        style={{
          // Apple Music Signature Variables (SF Typography, NullWave Neon Sky Glow & Viewport Centering)
          ['--highlight-color' as any]: '#ffffff',
          ['--lyplus-text-primary' as any]: '#ffffff',
          ['--lyplus-text-secondary' as any]: 'rgba(255, 255, 255, 0.45)',
          ['--lyplus-lyrics-palette' as any]: '#38bdf8', // NullWave signature sky blue glow
          ['--am-lyrics-font-family' as any]: UNIVERSAL_LYRICS_FONT_FAMILY,
          ['--am-lyrics-font-size' as any]: isMobile ? 'clamp(1.75rem, 6vw, 2.35rem)' : 'clamp(2.4rem, 3.6vw, 3.6rem)',
          ['--am-lyrics-line-height' as any]: isMobile ? '1.3' : '1.32',
          ['--am-lyrics-padding-line' as any]: isMobile ? '12px 14px' : '16px 24px',
          ['--am-lyrics-scroll-top' as any]: isMobile ? '38%' : '36%',
          ['--am-lyrics-container-padding-top' as any]: isMobile ? '36vh' : '30vh',
          ['--am-lyrics-container-padding-bottom' as any]: isMobile ? '50vh' : '44vh',
        }}
      >
        {/* @ts-expect-error am-lyrics is a custom element registered in main.tsx from @uimaxbai/am-lyrics */}
        <am-lyrics
          key={track.id}
          ref={amLyricsRef}
          font-family={UNIVERSAL_LYRICS_FONT_FAMILY}
          song-title={cleanTitle}
          song-artist={cleanArtist}
          query={cleanQuery}
          highlight-color="#ffffff"
          hover-background-color="rgba(255, 255, 255, 0.12)"
          autoscroll="true"
          interpolate="true"
          class="w-full h-full block"
          style={{
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 86%, transparent 100%)',
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 86%, transparent 100%)',
          }}
        />
      </div>
    </LyricsErrorBoundary>
  )
}
