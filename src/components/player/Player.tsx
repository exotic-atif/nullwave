import { usePlayerStore, useQueueStore, useAuthStore, useLikedStore } from '@/store'
import { AlbumArt } from '../ui/AlbumArt'
import { IconButton } from '../ui/IconButton'
import { formatTime } from '@/lib/utils'
import { audioManager } from '@/lib/audio'
import { recordPlayHistory } from '@/lib/supabase'
import { api, parseLRC } from '@/lib/api'
import { toast } from 'sonner'
import type { SyncedLine } from '@/lib/api'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  Repeat1,
  ListMusic,
  ThumbsDown,
  Mic2,
  Heart,
  Loader2,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FullScreenPlayer } from './FullScreenPlayer'

export function Player() {
  const navigate = useNavigate()
  const {
    currentTrack,
    isPlaying,
    isLoadingStream,
    volume,
    progress,
    duration,
    isMuted,
    isShuffled,
    repeatMode,
    togglePlay,
    setVolume,
    toggleMute,
    setProgress,
    toggleShuffle,
    cycleRepeat,
    setTrack,
  } = usePlayerStore()

  const { playPrevious, addToHistory } = useQueueStore()
  const user = useAuthStore((s) => s.user)
  const { isLiked, toggle: toggleLike } = useLikedStore()

  const [isDragging, setIsDragging] = useState(false)
  const [showFullScreen, setShowFullScreen] = useState(false)
  const [lyricsData, setLyricsData] = useState<SyncedLine[] | null>(null)
  const [isFetchingLyrics, setIsFetchingLyrics] = useState(false)
  const [streamStatus, setStreamStatus] = useState<string | null>(null)
  const lastRecordedTrack = useRef<string | null>(null)
  
  const [hoverTime, setHoverTime] = useState<number | null>(null)
  const [hoverPos, setHoverPos] = useState<number>(0)
  const scrubberRef = useRef<HTMLInputElement>(null)

  // ===== AUDIO ENGINE BINDINGS =====

  // Wire audio events to player store
  useEffect(() => {
    audioManager.onTimeUpdate((currentTime, dur) => {
      if (!isDragging) {
        usePlayerStore.setState({ progress: currentTime, duration: dur || 0 })
      }
    })

    audioManager.onEnded(() => {
      // Auto-advance to next track
      const { repeatMode } = usePlayerStore.getState()
      if (repeatMode === 'one') {
        audioManager.seek(0)
        audioManager.play()
      } else {
        performNextTrack()
      }
    })

    audioManager.onError((msg) => {
      console.warn('Audio error:', msg)
      setStreamStatus('Playback failed. Trying preview if available.')
    })

    audioManager.onLoaded(() => {
      setStreamStatus(null)
      usePlayerStore.getState().setIsLoadingStream(false)
    })
  }, [isDragging])

  // When current track changes, load audio stream + fetch lyrics
  useEffect(() => {
    if (!currentTrack) return

    const track = currentTrack
    let cancelled = false
    const healthPendingTimer = window.setTimeout(() => {
      if (!cancelled) {
        setStreamStatus('Waiting for the stream server to respond...')
      }
    }, 5000)
    const longHealthPendingTimer = window.setTimeout(() => {
      if (!cancelled) {
        setStreamStatus('The stream server has not responded yet.')
      }
    }, 25000)
    
    // Stop and clear audio source immediately to prevent old track from resuming
    audioManager.stop()
    // Clear lyrics immediately so old lyrics don't show for the new song
    setLyricsData(null)
    setStreamStatus('Checking stream server...')

    async function loadStream() {
      try {
        await api.streamHealth()
        if (cancelled) return
        window.clearTimeout(healthPendingTimer)
        window.clearTimeout(longHealthPendingTimer)
        setStreamStatus('Stream server online. Finding audio...')

        const result = await api.stream(track.title, track.artist)
        if (cancelled) return

        if (result.streamUrl) {
          setStreamStatus('Buffering audio...')
          audioManager.playUrl(result.streamUrl).then(() => {
            if (!usePlayerStore.getState().isPlaying) {
              audioManager.pause()
            }
          })
        } else if (track.audioUrl) {
          setStreamStatus(result.error ? `${result.error}. Playing preview.` : 'Full stream unavailable. Playing preview.')
          audioManager.playUrl(track.audioUrl).then(() => {
            if (!usePlayerStore.getState().isPlaying) {
              audioManager.pause()
            }
          })
        } else {
          setStreamStatus(result.error || 'No audio stream available for this track.')
          usePlayerStore.getState().setIsLoadingStream(false)
        }
      } catch {
        window.clearTimeout(healthPendingTimer)
        window.clearTimeout(longHealthPendingTimer)
        if (cancelled) return

        if (track.audioUrl) {
          setStreamStatus('Stream server unavailable. Playing preview.')
          audioManager.playUrl(track.audioUrl).then(() => {
            if (!usePlayerStore.getState().isPlaying) {
              audioManager.pause()
            }
          })
        } else {
          setStreamStatus('Stream server unavailable.')
          usePlayerStore.getState().setIsLoadingStream(false)
        }
      }
    }

    loadStream()

    setIsFetchingLyrics(true)
    api.lyrics(track.title, track.artist).then((result) => {
      if (cancelled) return
      if (result.synced) {
        setLyricsData(parseLRC(result.synced))
      } else {
        setLyricsData(null)
      }
    }).catch(() => {
      if (cancelled) return
      setLyricsData(null)
    }).finally(() => {
      if (!cancelled) setIsFetchingLyrics(false)
    })

    // Record play history
    if (user?.id && lastRecordedTrack.current !== track.id) {
      lastRecordedTrack.current = track.id
      recordPlayHistory(user.id, track)
    }

    return () => {
      cancelled = true
      window.clearTimeout(healthPendingTimer)
      window.clearTimeout(longHealthPendingTimer)
    }
  }, [currentTrack?.id])

  // Sync play/pause state
  useEffect(() => {
    if (!audioManager.hasSource) return
    if (isPlaying && audioManager.paused) {
      audioManager.play()
    } else if (!isPlaying && !audioManager.paused) {
      audioManager.pause()
    }
  }, [isPlaying])

  // Sync volume
  useEffect(() => {
    audioManager.setVolume(volume)
  }, [volume])

  // Sync mute
  useEffect(() => {
    audioManager.setMuted(isMuted)
  }, [isMuted])

  // ===== MEDIA SESSION API (Notification Controls) =====
  useEffect(() => {
    if ('mediaSession' in navigator && currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: currentTrack.album,
        artwork: [
          { src: currentTrack.coverUrl, sizes: '512x512', type: 'image/jpeg' },
        ],
      })
    }
  }, [currentTrack])

  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => {
        usePlayerStore.getState().togglePlay()
      })
      navigator.mediaSession.setActionHandler('pause', () => {
        usePlayerStore.getState().togglePlay()
      })
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        // Find handlePrevious in scope or use queueStore directly
        const { progress } = usePlayerStore.getState()
        if (progress > 3) {
          audioManager.seek(0)
          usePlayerStore.getState().setProgress(0)
        } else {
          const prev = useQueueStore.getState().playPrevious()
          if (prev) usePlayerStore.getState().setTrack(prev)
        }
      })
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        performNextTrack()
      })
    }
    
    return () => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', null)
        navigator.mediaSession.setActionHandler('pause', null)
        navigator.mediaSession.setActionHandler('previoustrack', null)
        navigator.mediaSession.setActionHandler('nexttrack', null)
      }
    }
  }, [])

  // ===== HANDLERS =====

  const performNextTrack = useCallback(() => {
    const next = useQueueStore.getState().playNext()
    const current = usePlayerStore.getState().currentTrack
    if (current) addToHistory(current)

    if (next) {
      usePlayerStore.getState().setTrack(next)
    } else if (current) {
      // Infinite Autoplay fallback using improved supercool API radio
      const historyTitles = useQueueStore.getState().history.map(t => t.title)
      const dislikedTracks = useQueueStore.getState().dislikedTracks
      const { user } = useAuthStore.getState()
      const likedTracks = useLikedStore.getState().likedTracks.map(t => t.title)
      
      // If we are at the end of a queue/playlist, seed the radio
      api.radio({
        artist: current.artist,
        historyTitles,
        favArtists: user?.favArtists || '',
        favSongs: user?.favSongs || '',
        excludeIds: dislikedTracks,
        likedTracks
      }).then((tracks) => {
        if (tracks.length > 0) {
          // Just play the first one, don't populate the queue to keep it 1 song per session
          usePlayerStore.getState().setTrack(tracks[0])
        } else {
          usePlayerStore.setState({ isPlaying: false, progress: 0 })
        }
      }).catch((err) => {
        console.error('Radio fallback failed:', err)
        usePlayerStore.setState({ isPlaying: false, progress: 0 })
      })
    }
  }, [addToHistory])

  const handleNext = useCallback(() => {
    performNextTrack()
  }, [performNextTrack])

  const handlePrevious = useCallback(() => {
    if (progress > 3) {
      audioManager.seek(0)
      setProgress(0)
      return
    }
    const prev = playPrevious()
    if (prev) {
      setTrack(prev)
    }
  }, [progress, setProgress, playPrevious, setTrack])

  const handleSeek = (value: number) => {
    setProgress(value)
    audioManager.seek(value)
  }

  const handleLike = () => {
    if (user && currentTrack) {
      const isCurrentlyLiked = isLiked(currentTrack.id)
      toggleLike(user.id, currentTrack)
      
      if (!isCurrentlyLiked) {
        toast.success('Added to Liked Songs', {
          description: currentTrack.title
        })
      } else {
        toast('Removed from Liked Songs')
      }
    } else {
      toast.error('Sign in to like songs')
    }
  }

  if (!currentTrack) return null

  const liked = isLiked(currentTrack.id)

  return (
    <>
      {/* Full Screen Player Overlay */}
      <FullScreenPlayer
        isOpen={showFullScreen}
        onClose={() => setShowFullScreen(false)}
        track={currentTrack}
        progress={progress}
        duration={duration}
        lyricsData={lyricsData}
        isFetchingLyrics={isFetchingLyrics}
        onNext={performNextTrack}
        onPrevious={handlePrevious}
        isLiked={isLiked(currentTrack.id)}
        toggleLike={() => {
          if (user) {
            toggleLike(user.id, currentTrack)
            toast.success(isLiked(currentTrack.id) ? 'Removed from liked songs' : 'Added to liked songs')
          } else {
            toast.error('Please log in to like songs')
          }
        }}
      />

      <AnimatePresence>
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed max-md:bottom-[calc(56px+env(safe-area-inset-bottom))] md:bottom-0 left-0 md:left-[240px] right-0 z-40 bg-nw-surface/80 backdrop-blur-3xl border-t border-nw-border-subtle"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")`,
          }}
        >
          {/* Mobile top progress bar - Removed in favor of proper scrubber */}

          <div className="flex flex-col md:flex-row items-center justify-between h-auto md:h-[80px] py-1.5 md:py-0 px-3 md:px-5 gap-1.5 md:gap-5">
            {/* Top Row on mobile: Track Info + Play Controls */}
            <div className="flex items-center justify-between w-full md:w-[30%] md:flex-none">
              <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                <motion.div
                  key={currentTrack.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <AlbumArt
                    src={currentTrack.coverUrl}
                    alt={currentTrack.album}
                    size="lg"
                    rounded="lg"
                    showShadow
                    className="!w-12 !h-12 md:!w-14 md:!h-14"
                  />
                </motion.div>
                <div className="min-w-0 flex-1">
                  <motion.p
                    key={currentTrack.title}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[13px] md:text-sm font-medium text-nw-text truncate cursor-pointer hover:text-nw-accent hover:underline underline-offset-2 transition-colors duration-200"
                    onClick={() => setShowFullScreen(true)}
                    title="Open Player"
                  >
                    {currentTrack.title}
                  </motion.p>
                  <p className="text-[11px] md:text-xs text-nw-text-tertiary truncate">
                    {currentTrack.artist}
                  </p>
                  {streamStatus && (
                    <p className="mt-0.5 flex items-center gap-1 text-[10px] md:text-[11px] text-nw-accent truncate">
                      <Loader2 size={11} className="shrink-0 animate-spin" />
                      <span className="truncate">{streamStatus}</span>
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-0.5">
                  <IconButton
                    size="sm"
                    active={liked}
                    onClick={handleLike}
                    className="flex"
                  >
                    <motion.div
                      whileTap={{ scale: 0.8 }}
                      animate={liked ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
                    </motion.div>
                  </IconButton>
                  <IconButton
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      useQueueStore.getState().addDislikedTrack(currentTrack.id)
                      performNextTrack()
                      toast.success("We won't suggest this song again")
                    }}
                    className="flex hover:!text-nw-danger"
                    title="Not for me"
                  >
                    <ThumbsDown size={14} />
                  </IconButton>
                </div>
              </div>
              
              {/* Mobile Play Controls */}
              <div className="flex md:hidden items-center gap-1">
                <IconButton size="sm" onClick={handlePrevious}>
                  <SkipBack size={17} fill="currentColor" />
                </IconButton>
                <button
                  onClick={togglePlay}
                  className="w-9 h-9 bg-nw-text rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform duration-150 cursor-pointer"
                >
                  {isLoadingStream ? (
                    <Loader2 size={18} className="text-nw-black animate-spin" />
                  ) : isPlaying ? (
                    <Pause size={18} className="text-nw-black" fill="currentColor" />
                  ) : (
                    <Play size={18} className="text-nw-black ml-0.5" fill="currentColor" />
                  )}
                </button>
                <IconButton size="sm" onClick={handleNext}>
                  <SkipForward size={17} fill="currentColor" />
                </IconButton>
              </div>
            </div>

            {/* Center Controls (Buttons on PC, Scrubber + Extra controls on Mobile) */}
            <div className="flex flex-col items-center justify-center w-full md:w-auto md:flex-[2] md:max-w-[500px]">
              {/* PC Buttons */}
              <div className="hidden md:flex items-center gap-4 mb-1">
                <IconButton size="sm" active={isShuffled} onClick={toggleShuffle}>
                  <Shuffle size={15} />
                </IconButton>

                <IconButton size="sm" onClick={handlePrevious}>
                  <SkipBack size={17} fill="currentColor" />
                </IconButton>

                <button
                  onClick={togglePlay}
                  className="w-10 h-10 bg-nw-text rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform duration-150 cursor-pointer"
                >
                  {isLoadingStream ? (
                    <Loader2 size={18} className="text-nw-black animate-spin" />
                  ) : isPlaying ? (
                    <Pause size={18} className="text-nw-black" fill="currentColor" />
                  ) : (
                    <Play size={18} className="text-nw-black ml-0.5" fill="currentColor" />
                  )}
                </button>

                <IconButton size="sm" onClick={handleNext}>
                  <SkipForward size={17} fill="currentColor" />
                </IconButton>

                <IconButton
                  size="sm"
                  active={repeatMode !== 'off'}
                  onClick={cycleRepeat}
                >
                  {repeatMode === 'one' ? <Repeat1 size={15} /> : <Repeat size={15} />}
                </IconButton>
              </div>

              {/* Seek bar + Mobile extra buttons */}
              <div className="flex w-full items-center gap-2 px-1 md:px-0">
                {/* Mobile Shuffle */}
                <IconButton size="sm" active={isShuffled} onClick={toggleShuffle} className="flex md:hidden mr-1">
                  <Shuffle size={14} />
                </IconButton>

                <span className="text-[10px] tabular-nums text-nw-text-tertiary w-8 text-right hidden md:block">
                  {formatTime(progress)}
                </span>
                
                {/* Scrubber Container */}
                <div 
                  className="flex-1 relative group py-2"
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
                    value={progress}
                    onChange={(e) => handleSeek(Number(e.target.value))}
                    onMouseDown={() => setIsDragging(true)}
                    onMouseUp={() => {
                      setIsDragging(false)
                      audioManager.seek(progress)
                    }}
                    className="w-full cursor-pointer nw-slider h-1 group-hover:h-1.5 transition-[height] duration-200"
                    style={{
                      background: `linear-gradient(to right, #38bdf8 ${
                        duration > 0 ? (progress / duration) * 100 : 0
                      }%, #27272a ${duration > 0 ? (progress / duration) * 100 : 0}%)`,
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

                <span className="text-[10px] tabular-nums text-nw-text-tertiary w-8 hidden md:block">
                  {formatTime(duration)}
                </span>

                {/* Mobile Extra Controls */}
                <div className="flex md:hidden items-center gap-1 ml-1">
                  <IconButton size="sm" active={repeatMode !== 'off'} onClick={cycleRepeat}>
                    {repeatMode === 'one' ? <Repeat1 size={14} /> : <Repeat size={14} />}
                  </IconButton>
                  <IconButton size="sm" onClick={() => setShowFullScreen(true)}>
                    <Mic2 size={14} />
                  </IconButton>
                  <IconButton size="sm" onClick={() => navigate('/queue')}>
                    <ListMusic size={14} />
                  </IconButton>
                </div>
              </div>
            </div>

            {/* Right Controls (Hidden on mobile) */}
            <div className="hidden md:flex items-center gap-2 w-[30%] justify-end">
              <IconButton size="sm" onClick={() => setShowFullScreen(true)} title="Full Screen Player">
                <Mic2 size={15} />
              </IconButton>
              <IconButton size="sm" onClick={() => navigate('/queue')}>
                <ListMusic size={15} />
              </IconButton>

              {/* Volume */}
              <div className="flex items-center gap-1 ml-1 group">
                <IconButton size="sm" onClick={toggleMute}>
                  {isMuted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </IconButton>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-20 cursor-pointer nw-slider"
                  style={{
                    background: `linear-gradient(to right, #38bdf8 ${
                      (isMuted ? 0 : volume) * 100
                    }%, #27272a ${(isMuted ? 0 : volume) * 100}%)`,
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  )
}
