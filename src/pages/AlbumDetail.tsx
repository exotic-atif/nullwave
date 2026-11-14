import { useEffect, useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import type { Track, Album } from '@/types'
import { TrackRow } from '@/components/ui/TrackRow'
import { usePlayerStore, useQueueStore } from '@/store'
import {
  Play,
  Pause,
  Shuffle,
  Disc3,
  ListPlus,
  Share2,
  Clock,
  Search as SearchIcon,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

export function AlbumDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [album, setAlbum] = useState<Album | null>(null)
  const [tracks, setTracks] = useState<Track[]>([])
  const [artistMoreTracks, setArtistMoreTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const currentTrack = usePlayerStore((s) => s.currentTrack)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const setTrack = usePlayerStore((s) => s.setTrack)
  const togglePlay = usePlayerStore((s) => s.togglePlay)
  const { setQueue, addMultipleToQueue } = useQueueStore()

  useEffect(() => {
    if (!id) return
    let active = true
    setLoading(true)
    setError(false)

    api
      .album(id)
      .then((data) => {
        if (!active) return
        setAlbum(data.album)
        setTracks(data.tracks)

        // Fetch more tracks from this artist to populate recommendations below
        if (data.album.artist) {
          api
            .artist(data.album.artist)
            .then((artistData) => {
              if (!active) return
              const filtered = (artistData.tracks || []).filter(
                (t) => !data.tracks.some((at) => at.id === t.id)
              )
              setArtistMoreTracks(filtered.slice(0, 6))
            })
            .catch(() => {})
        }
      })
      .catch((err) => {
        if (!active) return
        console.warn('Failed to load album:', err)
        setError(true)
        setAlbum(null)
        setTracks([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [id])

  // Is this album currently playing?
  const isAlbumPlaying = useMemo(() => {
    if (!currentTrack || !isPlaying || tracks.length === 0) return false
    return tracks.some((t) => t.id === currentTrack.id)
  }, [currentTrack, isPlaying, tracks])

  // Calculate total album duration in seconds
  const totalSeconds = useMemo(() => {
    return tracks.reduce((acc, t) => acc + (t.duration || 0), 0)
  }, [tracks])

  const formattedTotalDuration = useMemo(() => {
    if (!totalSeconds) return ''
    const hrs = Math.floor(totalSeconds / 3600)
    const mins = Math.floor((totalSeconds % 3600) / 60)
    if (hrs > 0) return `${hrs} hr ${mins} min`
    return `${mins} min`
  }, [totalSeconds])

  const handlePlayAll = () => {
    if (tracks.length === 0) return
    if (isAlbumPlaying) {
      togglePlay()
      return
    }
    setTrack(tracks[0])
    setQueue(tracks)
    toast.success(`Playing ${album?.title || 'album'}`)
  }

  const handleShuffle = () => {
    if (tracks.length === 0) return
    const shuffled = [...tracks].sort(() => Math.random() - 0.5)
    setTrack(shuffled[0])
    setQueue(shuffled)
    toast.success(`Shuffling ${album?.title || 'album'}`)
  }

  const handleAddAllToQueue = () => {
    if (tracks.length === 0) return
    addMultipleToQueue(tracks)
    toast.success(`Added ${tracks.length} tracks to queue`)
  }

  const handleShare = () => {
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href)
        toast.success('Album link copied to clipboard!')
      } else {
        toast.info('Share URL: ' + window.location.href)
      }
    } catch {
      toast.info('Share URL: ' + window.location.href)
    }
  }

  // 1. Loading Skeleton
  if (loading) {
    return (
      <div className="px-4 sm:px-8 py-8 max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-8">
          <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl bg-nw-surface/60 border border-white/5" />
          <div className="space-y-3 flex-1 text-center sm:text-left w-full">
            <div className="h-4 w-20 bg-white/10 rounded-full mx-auto sm:mx-0" />
            <div className="h-10 w-3/4 max-w-md bg-white/10 rounded-2xl mx-auto sm:mx-0" />
            <div className="h-5 w-48 bg-white/10 rounded-xl mx-auto sm:mx-0" />
            <div className="h-4 w-32 bg-white/5 rounded-lg mx-auto sm:mx-0" />
          </div>
        </div>
        <div className="space-y-2 pt-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 w-full bg-nw-surface/30 rounded-2xl border border-white/5" />
          ))}
        </div>
      </div>
    )
  }

  // 2. Not Found Fallback (with instant Search suggestion, never a broken dead end)
  if (error || !album) {
    const rawSearch = decodeURIComponent(id || '').replace(/::/g, ' ')
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 max-w-md mx-auto space-y-5">
        <div className="p-4 rounded-3xl bg-nw-surface/50 border border-white/10 text-nw-accent">
          <Disc3 size={44} className="animate-spin-slow" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-display font-bold text-white">Album Not Found</h2>
          <p className="text-sm text-nw-text-secondary leading-relaxed">
            We couldn't locate this exact album ID. Would you like to search for{' '}
            <strong className="text-white font-semibold">"{rawSearch}"</strong> across NullWave?
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate('/search?q=' + encodeURIComponent(rawSearch))}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-nw-accent text-black font-semibold text-sm hover:bg-nw-accent-hover transition-all shadow-lg shadow-nw-accent/20"
          >
            <SearchIcon size={16} />
            Search for "{rawSearch}"
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-nw-text-secondary hover:text-white text-sm font-medium border border-white/10 transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  const isSingle = tracks.length <= 2
  const isEP = tracks.length >= 3 && tracks.length <= 6
  const albumBadge = isSingle ? 'Single' : isEP ? 'EP' : 'Album'

  return (
    <div className="min-h-full pb-20">
      {/* Dynamic Background Glow */}
      {album.coverUrl && (
        <div className="absolute top-0 left-0 right-0 h-[480px] overflow-hidden -z-10 pointer-events-none">
          <img
            src={album.coverUrl}
            alt=""
            className="w-full h-full object-cover blur-[100px] opacity-25 scale-125"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-nw-black/80 to-nw-black" />
        </div>
      )}

      {/* Hero Header */}
      <div className="px-4 sm:px-8 pt-6 sm:pt-10 pb-8 max-w-7xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-nw-muted">
          <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
            <ArrowLeft size={13} />
            Home
          </Link>
          <ChevronRight size={12} className="text-white/20" />
          <Link
            to={`/artist/${encodeURIComponent(album.artist)}`}
            className="hover:text-white transition-colors truncate max-w-[150px]"
          >
            {album.artist}
          </Link>
          <ChevronRight size={12} className="text-white/20" />
          <span className="text-white/70 truncate max-w-[200px] font-medium">{album.title}</span>
        </div>

        {/* Album Artwork & Metadata Card */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-8">
          {/* Cover Art with Vinyl Depth */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative group flex-shrink-0"
          >
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 relative z-10 bg-nw-surface">
              {album.coverUrl ? (
                <img
                  src={album.coverUrl}
                  alt={album.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-nw-surface">
                  <Disc3 size={48} className="text-nw-muted" />
                </div>
              )}
            </div>
            {/* Vinyl record disc peeking on hover */}
            <div className="absolute top-2 right-2 w-44 h-44 rounded-full bg-zinc-950 border border-white/10 shadow-2xl flex items-center justify-center opacity-0 group-hover:translate-x-6 group-hover:opacity-100 transition-all duration-500 -z-0">
              <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center">
                <div className="w-5 h-5 rounded-full bg-nw-accent/40" />
              </div>
            </div>
          </motion.div>

          {/* Info Details */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="flex-1 min-w-0 text-center sm:text-left space-y-2.5"
          >
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-nw-accent/15 text-nw-accent border border-nw-accent/30">
                {albumBadge}
              </span>
              {album.year ? (
                <span className="text-xs text-nw-muted font-medium">{album.year}</span>
              ) : null}
            </div>

            <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight leading-tight">
              {album.title}
            </h1>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-sm text-nw-text-secondary pt-1">
              <Link
                to={`/artist/${encodeURIComponent(album.artist)}`}
                className="font-semibold text-white hover:text-nw-accent transition-colors underline-offset-4 hover:underline"
              >
                {album.artist}
              </Link>
              <span className="text-white/20">•</span>
              <span>{tracks.length} {tracks.length === 1 ? 'song' : 'songs'}</span>
              {formattedTotalDuration && (
                <>
                  <span className="text-white/20">•</span>
                  <span className="text-nw-muted">{formattedTotalDuration}</span>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Action Bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.3 }}
          className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2 border-t border-white/5"
        >
          {/* Play All */}
          <button
            onClick={handlePlayAll}
            className="flex items-center gap-2.5 px-7 py-3 rounded-full bg-nw-accent text-black font-bold text-sm hover:bg-nw-accent-hover transition-all active:scale-95 shadow-xl shadow-nw-accent/25 cursor-pointer"
          >
            {isAlbumPlaying ? (
              <>
                <Pause size={18} fill="currentColor" />
                Pause
              </>
            ) : (
              <>
                <Play size={18} fill="currentColor" />
                Play All
              </>
            )}
          </button>

          {/* Shuffle */}
          <button
            onClick={handleShuffle}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white font-semibold text-sm border border-white/10 transition-all active:scale-95 cursor-pointer"
          >
            <Shuffle size={16} />
            Shuffle
          </button>

          {/* Add All to Queue */}
          <button
            onClick={handleAddAllToQueue}
            className="p-3 rounded-full bg-white/[0.04] hover:bg-white/[0.1] text-nw-text-secondary hover:text-white border border-white/10 transition-all cursor-pointer"
            title="Add all tracks to queue"
          >
            <ListPlus size={18} />
          </button>

          {/* Share Album */}
          <button
            onClick={handleShare}
            className="p-3 rounded-full bg-white/[0.04] hover:bg-white/[0.1] text-nw-text-secondary hover:text-white border border-white/10 transition-all cursor-pointer"
            title="Share album link"
          >
            <Share2 size={18} />
          </button>
        </motion.div>

        {/* Tracklist Table */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between text-xs font-semibold text-nw-muted uppercase tracking-wider px-4 border-b border-white/5 pb-2">
            <div className="flex items-center gap-4">
              <span className="w-6 text-center">#</span>
              <span>Title</span>
            </div>
            <div className="flex items-center gap-6">
              <Clock size={14} className="hidden sm:block" />
              <span className="w-8"></span>
            </div>
          </div>

          <div className="space-y-1">
            {tracks.map((track, idx) => (
              <TrackRow
                key={`${track.id}-${idx}`}
                track={track}
                index={idx + 1}
                showIndex={true}
              />
            ))}
          </div>
        </div>

        {/* "More by {album.artist}" section */}
        {artistMoreTracks.length > 0 && (
          <div className="pt-12 space-y-4 border-t border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-display font-bold text-white">More by {album.artist}</h3>
                <p className="text-xs text-nw-muted mt-0.5">Explore additional top releases and tracks</p>
              </div>
              <Link
                to={`/artist/${encodeURIComponent(album.artist)}`}
                className="text-xs font-semibold text-nw-accent hover:underline flex items-center gap-1"
              >
                View Artist
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
              {artistMoreTracks.map((t, idx) => (
                <TrackRow key={`more-${t.id}-${idx}`} track={t} index={idx + 1} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
