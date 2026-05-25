import type { Track } from '@/types'
import type { SyncedLine } from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Music2, ChevronDown } from 'lucide-react'
import { AlbumArt } from '../ui/AlbumArt'
import { useEffect, useRef } from 'react'

interface LyricsPanelProps {
  isOpen: boolean
  onClose: () => void
  track: Track
  progress: number
  lyricsData: SyncedLine[] | null
}

export function LyricsPanel({ isOpen, onClose, track, progress, lyricsData }: LyricsPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Find active line index
  const activeIndex = lyricsData
    ? lyricsData.findIndex((line, i) => {
        const nextLine = lyricsData[i + 1]
        return progress >= line.time && (!nextLine || progress < nextLine.time)
      })
    : -1

  // Auto-scroll to active line
  useEffect(() => {
    if (isOpen && activeIndex >= 0 && containerRef.current) {
      const activeEl = containerRef.current.children[activeIndex] as HTMLElement
      if (activeEl) {
        containerRef.current.scrollTo({
          top: activeEl.offsetTop - containerRef.current.clientHeight / 2 + activeEl.clientHeight / 2,
          behavior: 'smooth'
        })
      }
    }
  }, [activeIndex, isOpen])

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
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 32, stiffness: 300 }}
            className="fixed inset-0 z-[70] flex flex-col bg-gradient-to-b from-nw-void via-nw-black to-nw-black overflow-hidden"
          >
            {/* Ambient background glow */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-nw-accent/[0.06] blur-[120px]" />
              <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-nw-accent-glow/[0.04] blur-[100px]" />
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
                <p className="text-[10px] uppercase tracking-[0.2em] text-nw-muted font-semibold">
                  Now Playing
                </p>
              </div>

              <button
                onClick={onClose}
                className="text-nw-text-secondary hover:text-nw-text transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 px-5 md:px-12 pb-8 overflow-hidden">
              {/* Left: Album art + track info */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="flex flex-col items-center flex-shrink-0"
              >
                <div className="relative">
                  <AlbumArt
                    src={track.coverUrl}
                    alt={track.album}
                    size="hero"
                    rounded="2xl"
                    showShadow
                    className="!w-48 !h-48 md:!w-64 md:!h-64 shadow-2xl shadow-black/50"
                  />
                  <div className="absolute -inset-3 rounded-3xl border border-nw-accent/10 animate-[nw-glow-pulse_3s_ease-in-out_infinite]" />
                </div>

                <div className="mt-6 text-center max-w-[280px]">
                  <h2 className="text-xl md:text-2xl font-display font-bold text-nw-text truncate">
                    {track.title}
                  </h2>
                  <p className="text-sm text-nw-text-secondary mt-1 truncate">
                    {track.artist}
                  </p>
                  <p className="text-xs text-nw-text-tertiary mt-0.5 truncate">
                    {track.album} {track.year ? `• ${track.year}` : ''}
                  </p>
                </div>
              </motion.div>

              {/* Right: Lyrics */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="flex-1 w-full max-w-2xl h-full flex flex-col items-center justify-center overflow-hidden"
              >
                {!lyricsData || lyricsData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-20">
                    <div className="w-16 h-16 rounded-2xl bg-nw-surface/50 flex items-center justify-center mb-4">
                      <Music2 size={28} className="text-nw-muted" />
                    </div>
                    <p className="text-nw-text-secondary font-medium">No lyrics available</p>
                    <p className="text-xs text-nw-text-tertiary mt-1 max-w-[240px]">
                      Lyrics for "{track.title}" haven't been added yet
                    </p>
                  </div>
                ) : (
                  <div 
                    ref={containerRef}
                    className="w-full h-full overflow-y-auto no-scrollbar py-[40vh] px-4 space-y-6 select-none mask-image-vertical"
                    style={{
                      WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)',
                      maskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)'
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
                      )
                    })}
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
