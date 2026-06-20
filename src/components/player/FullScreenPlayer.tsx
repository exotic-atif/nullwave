import type { Track } from '@/types'
import type { SyncedLine } from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, X, Heart, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Loader2 } from 'lucide-react'
import { AlbumArt } from '../ui/AlbumArt'
import { useCallback, useEffect, useRef, useState } from 'react'
import { usePlayerStore, useQueueStore } from '@/store'
import { audioManager } from '@/lib/audio'
import { formatTime } from '@/lib/utils'
import { api } from '@/lib/api'

interface FullScreenPlayerProps {
  isOpen: boolean
  onClose: () => void
  track: Track
  progress: number
  duration: number
  lyricsData: SyncedLine[] | null
  isFetchingLyrics: boolean
}

export function FullScreenPlayer({ isOpen, onClose, track, progress, duration, lyricsData, isFetchingLyrics }: FullScreenPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number>(0)
  const [showLyrics, setShowLyrics] = useState(false)
  
  const {
    isPlaying,
    isShuffled,
    repeatMode,
    togglePlay,
    setProgress,
    toggleShuffle,
    cycleRepeat,
    setTrack,
  } = usePlayerStore()

  const { playNext, playPrevious } = useQueueStore()

  // Find active line index
  const activeIndex = lyricsData
    ? lyricsData.findIndex((line, i) => {
        const nextLine = lyricsData[i + 1]
        return progress >= line.time && (!nextLine || progress < nextLine.time)
      })
    : -1

  // Auto-scroll to active line
  useEffect(() => {
    if (isOpen && showLyrics && containerRef.current) {
      if (activeIndex >= 0) {
        const activeEl = containerRef.current.children[activeIndex] as HTMLElement
        if (activeEl) {
          const container = containerRef.current
          const offsetTop = activeEl.offsetTop - container.offsetTop
          container.scrollTo({
            top: offsetTop - container.clientHeight / 2 + activeEl.clientHeight / 2,
            behavior: 'smooth'
          })
        }
      } else if (activeIndex === -1 && progress < 5 && containerRef.current) {
        containerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }, [activeIndex, isOpen, showLyrics, lyricsData, progress])

  // ===== Audio Visualizer =====
  const drawVisualizer = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || showLyrics || !isOpen) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const analyser = audioManager.getAnalyser()
    if (!analyser) return

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render)
      analyser.getByteFrequencyData(dataArray)

      const w = canvas.width
      const h = canvas.height
      const cx = w / 2
      const cy = h / 2
      const radius = Math.min(cx, cy) * 0.55
      const barCount = 64
      const maxBarHeight = radius * 0.6

      ctx.clearRect(0, 0, w, h)

      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor(i * bufferLength / barCount)
        const value = dataArray[dataIndex] / 255
        const barHeight = value * maxBarHeight + 2
        const angle = (i / barCount) * Math.PI * 2 - Math.PI / 2

        const x1 = cx + Math.cos(angle) * (radius + 4)
        const y1 = cy + Math.sin(angle) * (radius + 4)
        const x2 = cx + Math.cos(angle) * (radius + 4 + barHeight)
        const y2 = cy + Math.sin(angle) * (radius + 4 + barHeight)

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.strokeStyle = `rgba(56, 189, 248, ${0.3 + value * 0.7})`
        ctx.lineWidth = 2.5
        ctx.lineCap = 'round'
        ctx.stroke()
      }
    }

    render()

    return () => cancelAnimationFrame(animFrameRef.current)
  }, [showLyrics, isOpen])

  useEffect(() => {
    if (isOpen && !showLyrics && isPlaying) {
      const cleanup = drawVisualizer()
      return () => {
        cleanup?.()
        cancelAnimationFrame(animFrameRef.current)
      }
    } else {
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [isOpen, showLyrics, isPlaying, drawVisualizer])

  const handleNext = () => {
    const { history, setQueue } = useQueueStore.getState()
    if (track) {
       useQueueStore.getState().addToHistory(track)
    }
    const next = playNext()
    if (next) {
       setTrack(next)
    } else if (track) {
       const historyTitles = history.map(t => t.title)
       api.radio(track.artist, historyTitles).then((tracks) => {
         if (tracks.length > 0) {
           setTrack(tracks[0])
           if (tracks.length > 1) {
             setQueue(tracks.slice(1))
           }
         }
       }).catch(console.error)
    }
  }

  const handlePrevious = () => {
    if (progress > 3) {
      audioManager.seek(0)
      setProgress(0)
      return
    }
    const prev = playPrevious()
    if (prev) setTrack(prev)
  }

  const handleSeek = (value: number) => {
    setProgress(value)
    audioManager.seek(value)
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
            className="fixed inset-0 z-[70] flex flex-col bg-nw-void overflow-hidden"
          >
            {/* Ambient background glow */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-nw-accent/[0.06] blur-[120px]" />
              <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-nw-accent-glow/[0.04] blur-[120px]" />
            </div>

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
            <div className="relative z-10 flex-1 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 px-5 md:px-12 pb-24 overflow-hidden">
              {/* Left: Album art + track info */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className={`flex flex-col items-center flex-shrink-0 transition-all duration-500 ${showLyrics ? 'w-full md:w-auto scale-90' : 'w-full scale-100'}`}
              >
                <div className="relative">
                  {/* Audio Visualizer Canvas */}
                  {!showLyrics && (
                    <canvas
                      ref={canvasRef}
                      width={500}
                      height={500}
                      className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-500 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}
                      style={{ width: '100%', height: '100%' }}
                    />
                  )}
                  <AlbumArt
                    src={track.coverUrl}
                    alt={track.album}
                    size="hero"
                    rounded="2xl"
                    showShadow
                    className={`relative z-10 transition-all duration-500 shadow-2xl shadow-black/50 ${showLyrics ? 'max-w-[40vh] max-h-[40vh]' : 'max-w-[50vh] max-h-[50vh]'} w-full h-auto object-contain aspect-square`}
                  />
                  <div className="absolute -inset-3 rounded-3xl border border-nw-accent/10 animate-[nw-glow-pulse_3s_ease-in-out_infinite] z-10" />
                </div>

                <div className="mt-8 text-center max-w-[320px]">
                  <h2 className={`${showLyrics ? 'text-xl md:text-2xl' : 'text-3xl md:text-4xl'} font-display font-bold text-nw-text truncate transition-all`}>
                    {track.title}
                  </h2>
                  <p className={`${showLyrics ? 'text-sm' : 'text-lg'} text-nw-text-secondary mt-1 truncate transition-all`}>
                    {track.artist}
                  </p>
                  <p className="text-xs text-nw-text-tertiary mt-1 truncate">
                    {track.album} {track.year ? `• ${track.year}` : ''}
                  </p>
                </div>

                {/* Scrubber & Controls (Only show here if NOT in lyrics mode OR on desktop) */}
                <div className={`w-full max-w-md mt-10 transition-all duration-500 ${showLyrics ? 'hidden md:block' : 'block'}`}>
                  {/* Scrubber */}
                  <div className="flex items-center gap-3 w-full mb-6">
                    <span className="text-xs text-nw-text-tertiary tabular-nums">{formatTime(progress)}</span>
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      step={0.1}
                      value={progress}
                      onChange={(e) => handleSeek(Number(e.target.value))}
                      onMouseUp={() => {
                        audioManager.seek(progress)
                      }}
                      className="flex-1 cursor-pointer nw-slider min-w-0"
                      style={{
                        background: `linear-gradient(to right, #38bdf8 ${
                          duration > 0 ? (progress / duration) * 100 : 0
                        }%, #27272a ${duration > 0 ? (progress / duration) * 100 : 0}%)`,
                      }}
                    />
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
                      {isPlaying ? (
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
                  className="flex-1 w-full max-w-2xl h-full flex flex-col items-center justify-center overflow-hidden"
                >
                  <div className="flex-1 w-full flex items-center justify-center h-full relative" ref={containerRef}>
                    {isFetchingLyrics ? (
                      <div className="flex flex-col items-center gap-3 py-20">
                        <Loader2 size={24} className="text-nw-accent animate-spin" />
                        <p className="text-nw-text-secondary text-sm font-medium">Fetching lyrics...</p>
                      </div>
                    ) : !lyricsData || lyricsData.length === 0 ? (
                      <div className="text-center py-20">
                        <p className="text-nw-text-secondary font-medium">No lyrics available</p>
                        <p className="text-nw-text-tertiary text-sm mt-1">
                          Lyrics for "{track.title}" haven't been added yet
                        </p>
                      </div>
                    ) : (
                      <div
                        className="w-full h-full overflow-y-auto no-scrollbar py-[40vh] px-4 space-y-6 select-none mask-image-vertical"
                        style={{
                          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)',
                          maskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)',
                          paddingTop: 'calc(40vh + env(safe-area-inset-top) + 48px)',
                          paddingBottom: 'calc(40vh + env(safe-area-inset-bottom) + 24px)'
                        }}
                      >
                        {lyricsData.map((line, i) => {
                        const isActive = i === activeIndex
                        const isPassed = i < activeIndex
                        return (
                          <div 
                            key={i} 
                            className={`text-2xl md:text-4xl lg:text-5xl font-display font-bold transition-all duration-500 cursor-default ${
                              isActive ? 'text-nw-text scale-100 opacity-100 blur-0' : 
                              isPassed ? 'text-nw-text-secondary/50 scale-95 opacity-40 blur-[2px] hover:text-nw-text-secondary/80 hover:opacity-80' : 
                              'text-nw-text-secondary/30 scale-95 opacity-40 blur-[2px] hover:text-nw-text-secondary/60 hover:opacity-60'
                            }`}
                          >
                            {line.text}
                          </div>
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
            
            {/* Mobile Controls when Lyrics are shown (Fixed at bottom) */}
            {showLyrics && (
               <div className="md:hidden absolute bottom-6 left-0 right-0 px-6 z-50">
                  <div className="flex items-center justify-between bg-black/40 backdrop-blur-xl p-4 rounded-3xl border border-white/10">
                     <button onClick={togglePlay} className="p-3 bg-white text-black rounded-full shadow-lg">
                       {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                     </button>
                     <div className="flex gap-4">
                        <button onClick={handlePrevious} className="p-2 text-white/70 hover:text-white"><SkipBack size={24} fill="currentColor" /></button>
                        <button onClick={handleNext} className="p-2 text-white/70 hover:text-white"><SkipForward size={24} fill="currentColor" /></button>
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
