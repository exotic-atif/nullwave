import type { Track } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Loader2,
  Heart,
  ThumbsDown,
  Music2,
} from 'lucide-react'
import { toast } from 'sonner'
import { useQueueStore, usePlayerStore } from '@/store'
import { AlbumArt } from '../ui/AlbumArt'
import { useEffect, useRef, useState } from 'react'
import { audioManager } from '@/lib/audio'
import { formatTime } from '@/lib/utils'
import { api } from '@/lib/api'
import { preloadLyrics } from '@/lib/lyrics-cache'
import { AmllLyricsView } from './AmllLyricsView'

interface FullScreenPlayerProps {
  isOpen: boolean
  onClose: () => void
  track: Track
  progress: number
  duration: number
  onNext: () => void
  onPrevious: () => void
  isLiked?: boolean
  toggleLike?: () => void
}

export function FullScreenPlayer({
  isOpen,
  onClose,
  track,
  progress,
  duration,
  onNext,
  onPrevious,
  isLiked,
  toggleLike,
}: FullScreenPlayerProps) {
  const [showLyrics, setShowLyrics] = useState(false)
  const scrubberRef = useRef<HTMLInputElement>(null)
  const [hoverTime, setHoverTime] = useState<number | null>(null)
  const [hoverPos, setHoverPos] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragProgress, setDragProgress] = useState<number | null>(null)
  const [lyrics, setLyrics] = useState<{ synced: string | null; plain: string | null } | null>(null)
  const [lyricsLoading, setLyricsLoading] = useState(false)
  const [isDesktop, setIsDesktop] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 768 : true))

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])



  const {
    isPlaying,
    isLoadingStream,
    isShuffled,
    repeatMode,
    togglePlay,
    setProgress,
    toggleShuffle,
    cycleRepeat,
  } = usePlayerStore()

  const nextTrack = useQueueStore((s) => s.queue[0])

  // Fetch / Preload lyrics on track change with safety timeout
  useEffect(() => {
    let active = true
    setLyrics(null)
    setLyricsLoading(true)

    // Safety timeout: Never stay stuck on loading for more than 4.5 seconds
    const safetyTimer = window.setTimeout(() => {
      if (active) setLyricsLoading(false)
    }, 4500)

    preloadLyrics(track.title, track.artist)
      .then((result) => {
        if (!active) return
        if (result && (result.synced || result.plain)) {
          setLyrics(result)
          setLyricsLoading(false)
          window.clearTimeout(safetyTimer)
        } else {
          // Direct fallback fetch via worker / LRCLIB API
          return api.lyrics(track.title, track.artist)
        }
      })
      .then((directResult) => {
        if (!active || !directResult) return
        setLyrics(directResult)
        setLyricsLoading(false)
        window.clearTimeout(safetyTimer)
      })
      .catch(() => {
        if (active) {
          setLyricsLoading(false)
          window.clearTimeout(safetyTimer)
        }
      })

    return () => {
      active = false
      window.clearTimeout(safetyTimer)
    }
  }, [track.id, track.title, track.artist])

  const effectiveProgress = isDragging && dragProgress !== null ? dragProgress : progress

  const commitSeek = (targetValue?: number) => {
    const finalVal = typeof targetValue === 'number' ? targetValue : (dragProgress ?? progress)
    setIsDragging(false)
    setDragProgress(null)
    setProgress(finalVal)
    audioManager.seek(finalVal)
  }

  const handleSeekChange = (value: number) => {
    if (isDragging) {
      setDragProgress(value)
    } else {
      setProgress(value)
      audioManager.seek(value)
    }
  }

  // Common playback controls block
  const renderControls = (large = false) => (
    <div className="flex items-center justify-between w-full max-w-md px-2">
      <button
        onClick={toggleShuffle}
        className={`p-2.5 rounded-full transition-colors ${
          isShuffled ? 'text-nw-accent bg-nw-accent/10' : 'text-nw-text-secondary hover:text-white hover:bg-white/5'
        }`}
        title="Shuffle"
      >
        <Shuffle size={large ? 22 : 18} />
      </button>

      <button
        onClick={onPrevious}
        className="p-3 text-white hover:text-nw-accent transition-colors"
        title="Previous"
      >
        <SkipBack size={large ? 30 : 26} fill="currentColor" />
      </button>

      <button
        onClick={togglePlay}
        className={`rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer shadow-xl ${
          large
            ? 'w-16 h-16 bg-white text-black shadow-nw-accent/25 ring-4 ring-white/10'
            : 'w-14 h-14 bg-white text-black shadow-nw-accent/20'
        }`}
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isLoadingStream ? (
          <Loader2 size={large ? 28 : 24} className="text-black animate-spin" />
        ) : isPlaying ? (
          <Pause size={large ? 28 : 24} className="text-black" fill="currentColor" />
        ) : (
          <Play size={large ? 28 : 24} className="text-black ml-1" fill="currentColor" />
        )}
      </button>

      <button
        onClick={onNext}
        className="p-3 text-white hover:text-nw-accent transition-colors"
        title="Next"
      >
        <SkipForward size={large ? 30 : 26} fill="currentColor" />
      </button>

      <button
        onClick={cycleRepeat}
        className={`p-2.5 rounded-full transition-colors ${
          repeatMode !== 'off'
            ? 'text-nw-accent bg-nw-accent/10'
            : 'text-nw-text-secondary hover:text-white hover:bg-white/5'
        }`}
        title={`Repeat: ${repeatMode}`}
      >
        {repeatMode === 'one' ? <Repeat1 size={large ? 22 : 18} /> : <Repeat size={large ? 22 : 18} />}
      </button>
    </div>
  )

  // Common scrubber block
  const renderScrubber = () => (
    <div className="flex items-center gap-3 w-full">
      <span className="text-xs text-nw-text-tertiary tabular-nums font-mono min-w-[36px]">
        {formatTime(effectiveProgress)}
      </span>
      <div
        className="flex-1 relative group py-3"
        onMouseMove={(e) => {
          if (!scrubberRef.current || !duration) return
          const rect = scrubberRef.current.getBoundingClientRect()
          const pos = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
          setHoverPos(pos)
          setHoverTime((pos / rect.width) * duration)
        }}
        onMouseLeave={() => setHoverTime(null)}
      >
        <input
          ref={scrubberRef}
          type="range"
          min={0}
          max={duration || 100}
          step={0.1}
          value={effectiveProgress}
          onChange={(e) => handleSeekChange(Number(e.target.value))}
          onMouseDown={() => setIsDragging(true)}
          onTouchStart={() => setIsDragging(true)}
          onMouseUp={(e) => commitSeek(Number((e.target as HTMLInputElement).value))}
          onTouchEnd={(e) => commitSeek(Number((e.target as HTMLInputElement).value))}
          className="w-full cursor-pointer nw-slider h-1.5 group-hover:h-2 transition-[height] duration-200"
          style={{
            background: `linear-gradient(to right, #38bdf8 ${
              duration > 0 ? (effectiveProgress / duration) * 100 : 0
            }%, #27272a ${duration > 0 ? (effectiveProgress / duration) * 100 : 0}%)`,
          }}
        />
        {hoverTime !== null && (
          <div
            className="absolute -top-6 -translate-x-1/2 bg-nw-black border border-white/10 text-[11px] font-mono text-white px-2 py-0.5 rounded shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: hoverPos }}
          >
            {formatTime(hoverTime)}
          </div>
        )}
      </div>
      <span className="text-xs text-nw-text-tertiary tabular-nums font-mono min-w-[36px] text-right">
        {formatTime(duration)}
      </span>
    </div>
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-2xl"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 32, stiffness: 300 }}
            className="fixed inset-0 z-[70] flex h-[100dvh] flex-col overflow-hidden bg-nw-void"
          >
            {/* Ambient background glow */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute -top-24 left-1/4 w-[600px] h-[600px] rounded-full bg-nw-accent/[0.07] blur-[140px]" />
              <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-nw-accent-glow/[0.05] blur-[140px]" />
            </div>

            {/* Mobile Lyrics Blurred Ambient Backdrop (Static GPU-optimized glow - Zero Lag) */}
            {showLyrics && (
              <div className="absolute inset-0 md:hidden z-0 overflow-hidden bg-nw-black pointer-events-none">
                <img
                  src={track.coverUrl}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-20 scale-125"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-nw-black/50 via-nw-black/80 to-nw-black" />
              </div>
            )}

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between px-5 md:px-8 pt-5 pb-3 flex-shrink-0">
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 text-nw-text-secondary hover:text-nw-text transition-colors text-sm"
              >
                <ChevronDown size={20} />
                <span className="hidden sm:inline">Close</span>
              </button>

              <div className="text-center">
                <div className="bg-white/5 p-1 rounded-full flex items-center backdrop-blur-md border border-white/10">
                  <button
                    onClick={() => setShowLyrics(false)}
                    className={`px-5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${
                      !showLyrics
                        ? 'bg-nw-accent text-nw-black shadow-md shadow-nw-accent/20'
                        : 'text-nw-text-secondary hover:text-white'
                    }`}
                  >
                    Cover
                  </button>
                  <button
                    onClick={() => setShowLyrics(true)}
                    className={`px-5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${
                      showLyrics
                        ? 'bg-nw-accent text-nw-black shadow-md shadow-nw-accent/20'
                        : 'text-nw-text-secondary hover:text-white'
                    }`}
                  >
                    Lyrics
                  </button>
                </div>
              </div>

              <button
                onClick={onClose}
                className="text-nw-text-secondary hover:text-nw-text transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Main Stage Content */}
            <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden px-4 md:px-8 lg:px-12 pb-4">
              {/* DESKTOP VIEW (md and up): Side-by-side layout, NEVER cut off or distorted */}
              <div className="hidden md:flex flex-1 min-h-0 items-center justify-center gap-10 lg:gap-16 max-w-7xl mx-auto w-full">
                {/* Desktop Left Column: Album Art + Controls (when in lyrics mode) */}
                <div
                  className={`flex flex-col items-center justify-center transition-all duration-300 ease-out ${
                    showLyrics
                      ? 'w-72 lg:w-80 shrink-0 space-y-5 text-left'
                      : 'flex-1 max-w-[min(44vw,440px,48vh)] items-center justify-center'
                  }`}
                >
                  {/* Square Cover Art Box - strictly locked to aspect-square */}
                  <div
                    className={`relative aspect-square shrink-0 overflow-hidden rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.85)] border border-white/10 transition-all duration-300 ease-out ${
                      showLyrics
                        ? 'w-48 h-48 lg:w-56 lg:h-56'
                        : 'w-full max-w-[min(42vw,440px,46vh)] ring-1 ring-white/10'
                    }`}
                  >
                    <AlbumArt
                      src={track.coverUrl}
                      alt={track.album}
                      size={showLyrics ? 'xl' : 'hero'}
                      className="w-full h-full object-cover aspect-square block pointer-events-none"
                      rounded="2xl"
                      showShadow
                    />
                  </div>

                  {/* Left Column Controls (smoothly fades in when lyrics are open on desktop) */}
                  <AnimatePresence>
                    {showLyrics && (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 12 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="w-full space-y-4"
                      >
                        <div>
                          <h2 className="text-xl font-display font-bold text-white truncate">
                            {track.title}
                          </h2>
                          <p className="text-sm text-nw-accent font-medium truncate mt-0.5">
                            {track.artist}
                          </p>
                        </div>
                        <div className="w-full">{renderScrubber()}</div>
                        <div className="w-full flex justify-center">{renderControls(false)}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Desktop Right Column: Song Details + Controls (when Cover mode) OR Lyrics (when Lyrics mode) */}
                <div className="flex-1 h-full min-h-0 relative flex items-center justify-center overflow-hidden">
                  {/* Song Details + Controls (Cover mode) */}
                  <div
                    className={`transition-opacity duration-300 ease-out w-full max-w-xl flex flex-col justify-center space-y-6 text-left ${
                      !showLyrics ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none absolute inset-0'
                    }`}
                  >
                    {/* Track Header */}
                    <div>
                      {track.suggestionReason && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 mb-3 text-xs font-medium text-nw-accent bg-nw-accent/10 border border-nw-accent/20 rounded-full">
                          <Music2 size={12} /> {track.suggestionReason}
                        </span>
                      )}
                      <h1 className="text-3xl lg:text-4xl xl:text-5xl font-display font-extrabold text-white tracking-tight leading-tight line-clamp-2">
                        {track.title}
                      </h1>
                      <p className="text-lg lg:text-xl text-nw-accent font-medium mt-2">
                        {track.artist}
                      </p>
                      <p className="text-sm text-nw-text-tertiary mt-1">
                        {track.album} {track.year ? `• ${track.year}` : ''}
                      </p>
                    </div>

                    {/* Action buttons (Like & Dislike) */}
                    <div className="flex items-center gap-2">
                      {toggleLike && (
                        <button
                          onClick={toggleLike}
                          className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-colors"
                          title={isLiked ? 'Unlike' : 'Like'}
                        >
                          <Heart
                            size={18}
                            fill={isLiked ? '#ec4899' : 'none'}
                            color={isLiked ? '#ec4899' : 'currentColor'}
                          />
                          <span className="text-xs font-medium">{isLiked ? 'Liked' : 'Like'}</span>
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          useQueueStore.getState().addDislikedTrack(track)
                          onNext()
                          toast.success("We won't suggest this song again")
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-nw-danger/20 hover:border-nw-danger/40 text-nw-text-secondary hover:text-nw-danger transition-colors"
                        title="Dislike"
                      >
                        <ThumbsDown size={18} />
                        <span className="text-xs font-medium">Not for me</span>
                      </button>
                    </div>

                    {/* Scrubber */}
                    <div className="pt-2">{renderScrubber()}</div>

                    {/* Large Playback Controls */}
                    <div className="pt-1">{renderControls(true)}</div>

                    {/* Up Next Mini Preview */}
                    {nextTrack && (
                      <div className="mt-4 p-3.5 rounded-2xl bg-white/[0.04] border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0 pr-4">
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                            <AlbumArt src={nextTrack.coverUrl} alt={nextTrack.album} size="sm" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] uppercase font-bold tracking-wider text-nw-text-tertiary">
                              Up Next
                            </p>
                            <p className="text-sm font-semibold text-white truncate">{nextTrack.title}</p>
                            <p className="text-xs text-nw-text-secondary truncate">{nextTrack.artist}</p>
                          </div>
                        </div>
                        <button
                          onClick={onNext}
                          className="px-3 py-1.5 text-xs font-semibold rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                          Play Now
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Desktop Lyrics Column */}
                  <div
                    className={`transition-opacity duration-300 ease-out w-full h-full max-w-4xl lg:max-w-5xl flex flex-col items-center justify-center overflow-hidden ${
                      showLyrics ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none absolute inset-0'
                    }`}
                  >
                    {isDesktop && (
                      <AmllLyricsView
                        track={track}
                        lyrics={lyrics}
                        lyricsLoading={lyricsLoading}
                        currentTime={effectiveProgress}
                        isPlaying={isPlaying}
                        onSeek={(time) => {
                          audioManager.seek(time)
                          setProgress(time)
                        }}
                        trackId={track.id}
                        isMobile={false}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* MOBILE VIEW (< md): Optimized vertical layout */}
              <div className="flex md:hidden flex-1 min-h-0 flex-col items-center justify-center overflow-hidden h-full w-full relative">
                {/* Mobile Cover Art & Info */}
                <div
                  className={`w-full h-full flex flex-col items-center justify-center py-4 space-y-6 overflow-y-auto transition-opacity duration-300 ease-out ${
                    !showLyrics ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none absolute inset-0'
                  }`}
                >
                  {/* Mobile Cover Art */}
                  <div className="relative aspect-square w-full max-w-[min(300px,38vh)] shrink-0 overflow-hidden rounded-3xl shadow-2xl border border-white/10">
                    <AlbumArt
                      src={track.coverUrl}
                      alt={track.album}
                      size="xl"
                      className="w-full h-full object-cover aspect-square block pointer-events-none"
                      rounded="2xl"
                      showShadow
                    />
                  </div>

                  {/* Mobile Track Info */}
                  <div className="w-full max-w-[320px] flex items-center justify-between">
                    <div className="min-w-0 pr-4">
                      <h2 className="text-2xl font-display font-bold text-white truncate">
                        {track.title}
                      </h2>
                      <p className="text-base text-nw-accent font-medium truncate mt-0.5">
                        {track.artist}
                      </p>
                      <p className="text-xs text-nw-text-tertiary truncate mt-0.5">
                        {track.album} {track.year ? `• ${track.year}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      {toggleLike && (
                        <button
                          onClick={toggleLike}
                          className="p-3 text-nw-text-tertiary hover:text-white transition-colors"
                        >
                          <Heart
                            size={24}
                            fill={isLiked ? '#ec4899' : 'none'}
                            color={isLiked ? '#ec4899' : 'currentColor'}
                          />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          useQueueStore.getState().addDislikedTrack(track)
                          onNext()
                          toast.success("We won't suggest this song again")
                        }}
                        className="p-3 text-nw-text-tertiary hover:text-nw-danger transition-colors"
                      >
                        <ThumbsDown size={22} />
                      </button>
                    </div>
                  </div>

                  {/* Mobile Scrubber & Controls */}
                  <div className="w-full max-w-sm space-y-4">
                    {renderScrubber()}
                    <div className="flex justify-center">{renderControls(false)}</div>
                  </div>
                </div>

                {/* Mobile Lyrics Screen */}
                <div
                  className={`w-full h-full flex-1 min-h-0 flex flex-col items-center justify-center overflow-hidden relative transition-opacity duration-300 ease-out ${
                    showLyrics ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none absolute inset-0'
                  }`}
                >
                  {!isDesktop && (
                    <AmllLyricsView
                      track={track}
                      lyrics={lyrics}
                      lyricsLoading={lyricsLoading}
                      currentTime={effectiveProgress}
                      isPlaying={isPlaying}
                      onSeek={(time) => {
                        audioManager.seek(time)
                        setProgress(time)
                      }}
                      trackId={track.id}
                      isMobile={true}
                    />
                  )}

                  {/* Floating Mobile Controller Bar */}
                  <div className="absolute bottom-6 left-4 right-4 z-50 pb-[env(safe-area-inset-bottom)] pointer-events-auto">
                    <div className="bg-black/75 backdrop-blur-2xl p-4 rounded-3xl border border-white/10 shadow-2xl flex items-center justify-between">
                      <div className="min-w-0 pr-3">
                        <p className="font-bold text-white text-sm truncate">{track.title}</p>
                        <p className="text-xs text-white/70 truncate">{track.artist}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={onPrevious}
                          className="p-2 text-white/70 hover:text-white"
                        >
                          <SkipBack size={22} fill="currentColor" />
                        </button>
                        <button
                          onClick={togglePlay}
                          className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center"
                        >
                          {isPlaying ? (
                            <Pause size={18} fill="currentColor" />
                          ) : (
                            <Play size={18} fill="currentColor" className="ml-0.5" />
                          )}
                        </button>
                        <button
                          onClick={onNext}
                          className="p-2 text-white/70 hover:text-white"
                        >
                          <SkipForward size={22} fill="currentColor" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
