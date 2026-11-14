import type { Track } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, X, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Loader2, Heart, ThumbsDown } from 'lucide-react'
import { toast } from 'sonner'
import { useQueueStore } from '@/store'
import { AlbumArt } from '../ui/AlbumArt'
import { useEffect, useRef, useState } from 'react'
import { usePlayerStore } from '@/store'
import { audioManager } from '@/lib/audio'
import { formatTime } from '@/lib/utils'
import { parseLRC } from '@/lib/api'
import { preloadLyrics } from '@/lib/lyrics-cache'

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

export function FullScreenPlayer({ isOpen, onClose, track, progress, duration, onNext, onPrevious, isLiked, toggleLike }: FullScreenPlayerProps) {
  const [showLyrics, setShowLyrics] = useState(false)
  const scrubberRef = useRef<HTMLInputElement>(null)
  const [hoverTime, setHoverTime] = useState<number | null>(null)
  const [hoverPos, setHoverPos] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragProgress, setDragProgress] = useState<number | null>(null)
  const [lyrics, setLyrics] = useState<{ synced: string | null; plain: string | null } | null>(null)
  
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

  useEffect(() => {
    let active = true
    setLyrics(null)
    void preloadLyrics(track.title, track.artist).then((result) => {
      if (active) setLyrics(result)
    })
    return () => { active = false }
  }, [track.id, track.title, track.artist])

  const syncedLines = lyrics?.synced ? parseLRC(lyrics.synced) : []
  const activeLyricIndex = syncedLines.reduce((found, line, index) => line.time <= progress ? index : found, -1)

  // Handlers passed from Player.tsx
  const handleNext = () => onNext()
  const handlePrevious = () => onPrevious()

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
            className="fixed inset-0 z-[70] flex h-[100dvh] flex-col overflow-y-auto bg-nw-void"
          >
            {/* Ambient background glow */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-nw-accent/[0.06] blur-[120px]" />
              <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-nw-accent-glow/[0.04] blur-[120px]" />
            </div>

            {/* Mobile Lyrics Blurred Background */}
            {showLyrics && (
              <div className="absolute inset-0 md:hidden z-0 overflow-hidden bg-nw-black pointer-events-none">
                <motion.img 
                  src={track.coverUrl}
                  className="absolute inset-[-50%] w-[200%] h-[200%] object-cover blur-[60px] opacity-30 mix-blend-screen"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute inset-0 bg-nw-black/50" />
              </div>
            )}

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between px-5 md:px-8 pt-5 pb-3">
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 text-nw-text-secondary hover:text-nw-text transition-colors text-sm"
              >
                <ChevronDown size={20} />
                <span className="hidden sm:inline">Close</span>
              </button>

              <div className="text-center">
                <div className="bg-white/5 p-1 rounded-full flex items-center backdrop-blur-md">
                   <button 
                     onClick={() => setShowLyrics(false)} 
                     className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-colors ${!showLyrics ? 'bg-nw-accent text-nw-black' : 'text-nw-text-secondary hover:text-white'}`}
                   >
                     Cover
                   </button>
                   <button 
                     onClick={() => setShowLyrics(true)} 
                     className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-colors ${showLyrics ? 'bg-nw-accent text-nw-black' : 'text-nw-text-secondary hover:text-white'}`}
                   >
                     Lyrics
                   </button>
                </div>
              </div>

              <button
                onClick={onClose}
                className="text-nw-text-secondary hover:text-nw-text transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center gap-8 overflow-y-auto px-5 pb-24 md:flex-row md:gap-12 md:overflow-y-auto md:px-12">
              {/* Left: Album art + track info */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className={`flex flex-shrink-0 flex-col items-center transition-all duration-500 ${showLyrics ? 'hidden w-full scale-90 md:flex md:w-auto' : 'w-full scale-100'}`}
              >
                <div className={`relative aspect-square flex-shrink-0 transition-all duration-500 ${showLyrics ? 'w-full max-w-[200px] md:max-w-[min(300px,34dvh)]' : 'w-full max-w-[300px] md:max-w-[min(380px,42dvh)] lg:max-w-[min(460px,42dvh)]'}`}>
                  <AlbumArt
                    src={track.coverUrl}
                    alt={track.album}
                    size="hero"
                    rounded="2xl"
                    showShadow
                    className="w-full h-full"
                  />
                </div>

                <div className="mt-8 w-full max-w-[320px] flex items-center justify-between">
                  <div className="text-left flex-1 min-w-0 pr-4">
                    <h2 className={`${showLyrics ? 'text-xl md:text-2xl' : 'text-3xl md:text-4xl'} font-display font-bold text-nw-text truncate transition-all`}>
                      {track.title}
                    </h2>
                    <p className={`${showLyrics ? 'text-sm' : 'text-lg'} text-nw-text-secondary mt-1 truncate transition-all`}>
                      {track.artist}
                    </p>
                    <p className="text-xs text-nw-text-tertiary mt-1 truncate">
                      {track.album} {track.year ? `• ${track.year}` : ''}
                    </p>
                    {track.suggestionReason && (
                      <div className="mt-3 px-3 py-1.5 inline-block bg-nw-accent/10 border border-nw-accent/20 rounded-lg">
                        <p className="text-xs text-nw-accent/90 flex items-center gap-1.5">
                          {track.suggestionReason}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {toggleLike && (
                      <button
                        onClick={toggleLike}
                        className="p-3 text-nw-text-tertiary hover:text-white hover:bg-white/5 rounded-full transition-colors group flex-shrink-0"
                        title={isLiked ? "Unlike" : "Like"}
                      >
                        <motion.div
                          whileTap={{ scale: 0.8 }}
                          animate={isLiked ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          <Heart 
                            size={28} 
                            fill={isLiked ? '#ec4899' : 'none'} 
                            color={isLiked ? '#ec4899' : 'currentColor'} 
                            className="transition-transform group-hover:scale-110 group-active:scale-95"
                          />
                        </motion.div>
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        useQueueStore.getState().addDislikedTrack(track)
                        onNext()
                        toast.success("We won't suggest this song again")
                      }}
                      className="p-3 text-nw-text-tertiary hover:text-nw-danger hover:bg-white/5 rounded-full transition-colors group flex-shrink-0"
                      title="Not for me"
                    >
                      <ThumbsDown size={24} className="transition-transform group-hover:scale-110 group-active:scale-95" />
                    </button>
                  </div>
                </div>

                {/* Scrubber & Controls (Only show here if NOT in lyrics mode OR on desktop) */}
                <div className={`w-full max-w-md mt-10 transition-all duration-500 ${showLyrics ? 'hidden md:block' : 'block'}`}>
                  {/* Scrubber */}
                  <div className="flex items-center gap-3 w-full mb-6">
                    <span className="text-xs text-nw-text-tertiary tabular-nums">{formatTime(effectiveProgress)}</span>
                    <div 
                      className="flex-1 relative group py-3"
                      onMouseMove={(e) => {
                        if (!scrubberRef.current || !duration) return
                        const rect = scrubberRef.current.getBoundingClientRect()
                        let pos = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
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
                      {/* Tooltip */}
                      {hoverTime !== null && (
                        <div 
                          className="absolute -top-6 -translate-x-1/2 bg-nw-black border border-white/10 text-xs text-white px-2 py-1 rounded shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ left: hoverPos }}
                        >
                          {formatTime(hoverTime)}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-nw-text-tertiary tabular-nums">{formatTime(duration)}</span>
                  </div>

                  {/* Playback Controls */}
                  <div className="flex items-center justify-between px-4">
                    <button onClick={toggleShuffle} className={`p-2 rounded-full transition-colors ${isShuffled ? 'text-nw-accent bg-nw-accent/10' : 'text-nw-text-secondary hover:text-white hover:bg-white/5'}`}>
                      <Shuffle size={20} />
                    </button>
                    
                    <button onClick={handlePrevious} className="p-3 text-white hover:text-nw-accent transition-colors">
                      <SkipBack size={28} fill="currentColor" />
                    </button>
                    
                    <button
                      onClick={togglePlay}
                      className="w-16 h-16 bg-nw-text rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform duration-150 cursor-pointer shadow-lg shadow-nw-accent/20"
                    >
                      {isLoadingStream ? (
                        <Loader2 size={28} className="text-nw-black animate-spin" />
                      ) : isPlaying ? (
                        <Pause size={28} className="text-nw-black" fill="currentColor" />
                      ) : (
                        <Play size={28} className="text-nw-black ml-1" fill="currentColor" />
                      )}
                    </button>
                    
                    <button onClick={handleNext} className="p-3 text-white hover:text-nw-accent transition-colors">
                      <SkipForward size={28} fill="currentColor" />
                    </button>

                    <button onClick={cycleRepeat} className={`p-2 rounded-full transition-colors ${repeatMode !== 'off' ? 'text-nw-accent bg-nw-accent/10' : 'text-nw-text-secondary hover:text-white hover:bg-white/5'}`}>
                      {repeatMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Right: Lyrics */}
              {showLyrics && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex h-full min-h-0 w-full max-w-2xl flex-1 flex-col items-center justify-center overflow-y-auto pb-32 md:pb-0"
                >
                  <div className="flex min-h-full w-full flex-col items-center justify-center py-8 text-center [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]">
                    {!lyrics ? (
                      <p className="text-nw-text-secondary">Loading lyrics…</p>
                    ) : syncedLines.length ? (
                      syncedLines.map((line, index) => (
                        <button key={`${line.time}-${index}`} onClick={() => { audioManager.seek(line.time); setProgress(line.time) }} className={`max-w-full px-4 py-2 text-left text-2xl font-semibold transition-colors md:text-3xl ${index === activeLyricIndex ? 'text-white' : 'text-white/40 hover:text-white/75'}`}>
                          {line.text}
                        </button>
                      ))
                    ) : lyrics.plain ? (
                      lyrics.plain.split(/\r?\n/).filter(Boolean).map((line, index) => <p key={index} className="px-4 py-2 text-2xl font-semibold text-white/75 md:text-3xl">{line}</p>)
                    ) : (
                      <p className="text-nw-text-secondary">Lyrics aren’t available for this track.</p>
                    )}
                  </div>
                  
                  {/* Mobile Lyrics Controls have been moved outside the flex container to pin them at the bottom */}
                </motion.div>
              )}
            </div>
            
            {/* Mobile Controls & Track Info when Lyrics are shown (Fixed at bottom) */}
            {showLyrics && (
               <div className="md:hidden absolute bottom-6 left-0 right-0 px-6 z-50 pb-[env(safe-area-inset-bottom)]">
                  <div className="flex flex-col gap-4 bg-black/40 backdrop-blur-2xl p-5 rounded-[2rem] border border-white/10 shadow-2xl">
                     <div className="flex items-center justify-between">
                       <div className="min-w-0 pr-4">
                         <h3 className="font-display font-bold text-lg text-white truncate">{track.title}</h3>
                         <p className="text-sm text-white/70 truncate">{track.artist}</p>
                       </div>
                       <div className="flex items-center gap-1">
                         {toggleLike && (
                           <button onClick={toggleLike} className="p-2 text-white/70 hover:text-white transition-colors">
                             <Heart size={22} fill={isLiked ? '#ec4899' : 'none'} color={isLiked ? '#ec4899' : 'currentColor'} />
                           </button>
                         )}
                         <button onClick={(e) => {
                             e.stopPropagation()
                             useQueueStore.getState().addDislikedTrack(track)
                             onNext()
                             toast.success("We won't suggest this song again")
                         }} className="p-2 text-white/70 hover:text-nw-danger transition-colors">
                           <ThumbsDown size={22} />
                         </button>
                       </div>
                     </div>
                     <div className="flex items-center justify-between">
                       <button onClick={togglePlay} className="w-14 h-14 flex items-center justify-center bg-white text-black rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform">
                         {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                       </button>
                       <div className="flex gap-4 items-center">
                          <button onClick={handlePrevious} className="p-3 text-white/70 hover:text-white transition-colors"><SkipBack size={28} fill="currentColor" /></button>
                          <button onClick={handleNext} className="p-3 text-white/70 hover:text-white transition-colors"><SkipForward size={28} fill="currentColor" /></button>
                       </div>
                     </div>
                  </div>
               </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
