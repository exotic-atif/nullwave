import React, { Component, useEffect, useRef, type ReactNode } from 'react'
import type { Track } from '@/types'

/**
 * Clean track title and artist name for 100% match rate on LyricsPlus & Apple Music catalogs
 */
export function cleanTrackTitle(title: string): string {
  return (title || '')
    .replace(/\s*[\(\[](feat|ft|official|audio|video|lyrics?|remaster(?:ed)?|from\s+"[^"]+").*?[\)\]]/gi, '')
    .replace(/\s*-\s*(feat|ft|official|audio|video|remaster(?:ed)?).*$/gi, '')
    .trim()
}

export function cleanArtistName(artist: string): string {
  return (artist || '')
    .split(/[,&/]/)[0]
    .replace(/\s*(feat|ft)\.?.*$/gi, '')
    .trim()
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
  onSeek,
  isMobile = false,
}: AmllLyricsViewProps) {
  const amLyricsRef = useRef<HTMLElement>(null)

  // Sync am-lyrics time with audio progress (am-lyrics expects milliseconds)
  useEffect(() => {
    const el = amLyricsRef.current as any
    if (el) {
      el.currentTime = Math.round(currentTime * 1000)
    }
  }, [currentTime])

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
  const durationMs = track.duration ? Math.round(track.duration * 1000) : undefined

  return (
    <LyricsErrorBoundary resetKey={track.id} fallback={null}>
      <div
        className="w-full h-full relative flex flex-col items-stretch justify-start overflow-hidden"
        style={{
          // Apple Music Custom Variables for NullWave (NullWave Neon Sky Glow + SF Typography)
          ['--highlight-color' as any]: '#ffffff',
          ['--lyplus-text-primary' as any]: '#ffffff',
          ['--lyplus-text-secondary' as any]: 'rgba(255, 255, 255, 0.45)',
          ['--lyplus-lyrics-palette' as any]: '#38bdf8', // NullWave signature sky blue glow
          ['--am-lyrics-font-size' as any]: isMobile ? 'clamp(1.35rem, 4.5vw, 1.75rem)' : 'clamp(2.1rem, 2.9vw, 3rem)',
          ['--am-lyrics-padding-line' as any]: isMobile ? '8px 12px' : '14px 20px',
          ['--am-lyrics-scroll-top' as any]: isMobile ? '30%' : '34%',
          ['--am-lyrics-container-padding-top' as any]: isMobile ? '20vh' : '28vh',
          ['--am-lyrics-container-padding-bottom' as any]: isMobile ? '35vh' : '44vh',
        }}
      >
        {/* @ts-expect-error am-lyrics is a custom element registered in main.tsx from @uimaxbai/am-lyrics */}
        <am-lyrics
          key={track.id}
          ref={amLyricsRef}
          song-title={cleanTitle}
          song-artist={cleanArtist}
          song-album={track.album || ''}
          song-duration={durationMs}
          query={cleanQuery}
          highlight-color="#ffffff"
          hover-background-color="rgba(255, 255, 255, 0.12)"
          autoscroll="true"
          interpolate="true"
          class="w-full h-full block"
          style={{
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 8%, black 90%, transparent 100%)',
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 8%, black 90%, transparent 100%)',
          }}
        />
      </div>
    </LyricsErrorBoundary>
  )
}
