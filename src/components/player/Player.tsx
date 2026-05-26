import { usePlayerStore, useQueueStore, useAuthStore, useLikedStore } from '@/store'
import { AlbumArt } from '../ui/AlbumArt'
import { IconButton } from '../ui/IconButton'
import { formatTime } from '@/lib/utils'
import { audioManager } from '@/lib/audio'
import { recordPlayHistory } from '@/lib/supabase'
import { api, parseLRC } from '@/lib/api'
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
  Mic2,
  Heart,
  Loader2,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LyricsPanel } from './LyricsPanel'

export function Player() {
  const navigate = useNavigate()
  const {
    currentTrack,
    isPlaying,
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

  const { playNext, playPrevious, addToHistory } = useQueueStore()
  const user = useAuthStore((s) => s.user)
  const { isLiked, toggle: toggleLike } = useLikedStore()

  const [isDragging, setIsDragging] = useState(false)
  const [showLyrics, setShowLyrics] = useState(false)
  const [lyricsData, setLyricsData] = useState<SyncedLine[] | null>(null)
  const [streamStatus, setStreamStatus] = useState<string | null>(null)
  const lastRecordedTrack = useRef<string | null>(null)

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
        const next = useQueueStore.getState().playNext()
        if (next) {
          usePlayerStore.getState().setTrack(next)
        } else {
          // Infinite Autoplay: Fetch related tracks if queue is empty
          const current = usePlayerStore.getState().currentTrack
          if (current) {
            api.search(current.artist).then((res) => {
              const tracks = res.tracks.filter(t => t.id !== current.id)
              if (tracks.length > 0) {
                // Pick a random track from the search results
                const randomTrack = tracks[Math.floor(Math.random() * tracks.length)]
                usePlayerStore.getState().setTrack(randomTrack)
              } else {
                usePlayerStore.setState({ isPlaying: false, progress: 0 })
              }
            }).catch(() => {
              usePlayerStore.setState({ isPlaying: false, progress: 0 })
            })
          } else {
            usePlayerStore.setState({ isPlaying: false, progress: 0 })
          }
        }
      }
    })

    audioManager.onError((msg) => {
      console.warn('Audio error:', msg)
      setStreamStatus('Playback failed. Trying preview if available.')
    })

    audioManager.onLoaded(() => {
      setStreamStatus(null)
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
          audioManager.playUrl(result.streamUrl)
        } else if (track.audioUrl) {
          setStreamStatus('Full stream unavailable. Playing preview.')
          audioManager.playUrl(track.audioUrl)
        } else {
          setStreamStatus('No audio stream available for this track.')
        }
      } catch {
        window.clearTimeout(healthPendingTimer)
        window.clearTimeout(longHealthPendingTimer)
        if (cancelled) return

        if (track.audioUrl) {
          setStreamStatus('Stream server unavailable. Playing preview.')
          audioManager.playUrl(track.audioUrl)
        } else {
          setStreamStatus('Stream server unavailable.')
        }
      }
    }

    loadStream()

    // Fetch lyrics
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
        const next = useQueueStore.getState().playNext()
        const current = usePlayerStore.getState().currentTrack
        if (next) {
          usePlayerStore.getState().setTrack(next)
        } else if (current) {
          // Infinite Autoplay fallback
          api.search(current.artist).then((res) => {
            const tracks = res.tracks.filter(t => t.id !== current.id)
            if (tracks.length > 0) {
              const randomTrack = tracks[Math.floor(Math.random() * tracks.length)]
              usePlayerStore.getState().setTrack(randomTrack)
            }
          })
        }
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

  const handleNext = useCallback(() => {
    if (currentTrack) {
      addToHistory(currentTrack)
    }
    const next = playNext()
    if (next) {
      setTrack(next)
    } else if (currentTrack) {
      // Infinite Autoplay
      api.search(currentTrack.artist).then((res) => {
        const tracks = res.tracks.filter(t => t.id !== currentTrack.id)
        if (tracks.length > 0) {
          const randomTrack = tracks[Math.floor(Math.random() * tracks.length)]
          setTrack(randomTrack)
        }
      })
    }
  }, [currentTrack, addToHistory, playNext, setTrack])

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
      toggleLike(user.id, currentTrack)
    }
  }

  if (!currentTrack) return null

  const liked = isLiked(currentTrack.id)

  return (
    <>
      {/* Lyrics Panel */}
      <LyricsPanel
        isOpen={showLyrics}
        onClose={() => setShowLyrics(false)}
        track={currentTrack}
        progress={progress}
        lyricsData={lyricsData}
      />

      <AnimatePresence>
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 glass-heavy border-t border-nw-border-subtle"
        >
          {/* Mobile top progress bar - Removed in favor of proper scrubber */}

          <div className="flex flex-col md:flex-row items-center justify-between h-auto md:h-[80px] py-2 md:py-0 px-2 md:px-5 gap-2 md:gap-5">
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
                    onClick={() => setShowLyrics(true)}
                    title="View lyrics"
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
                <IconButton
                  size="sm"
                  active={liked}
                  onClick={handleLike}
                  className="hidden sm:flex"
                >
                  <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
                </IconButton>
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
                  {isPlaying ? (
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
                  {isPlaying ? (
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
                
                {/* Scrubber */}
                <input
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
                  className="flex-1 cursor-pointer nw-slider min-w-0"
                  style={{
                    background: `linear-gradient(to right, #38bdf8 ${
                      duration > 0 ? (progress / duration) * 100 : 0
                    }%, #27272a ${duration > 0 ? (progress / duration) * 100 : 0}%)`,
                  }}
                />

                <span className="text-[10px] tabular-nums text-nw-text-tertiary w-8 hidden md:block">
                  {formatTime(duration)}
                </span>

                {/* Mobile Extra Controls */}
                <div className="flex md:hidden items-center gap-1 ml-1">
                  <IconButton size="sm" active={repeatMode !== 'off'} onClick={cycleRepeat}>
                    {repeatMode === 'one' ? <Repeat1 size={14} /> : <Repeat size={14} />}
                  </IconButton>
                  <IconButton size="sm" active={showLyrics} onClick={() => setShowLyrics(!showLyrics)}>
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
              <IconButton size="sm" active={showLyrics} onClick={() => setShowLyrics(!showLyrics)}>
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
