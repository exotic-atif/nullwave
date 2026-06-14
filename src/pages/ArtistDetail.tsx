import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '@/lib/api'
import type { Track, Artist } from '@/types'
import { TrackRow } from '@/components/ui/TrackRow'
import { usePlayerStore } from '@/store/playerStore'
import { useQueueStore } from '@/store/queueStore'
import { Play, Shuffle, Music2 } from 'lucide-react'
import { motion } from 'framer-motion'

export function ArtistDetailPage() {
  const { name } = useParams<{ name: string }>()
  const [artist, setArtist] = useState<Artist | null>(null)
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const setCurrentTrack = usePlayerStore((s) => s.setCurrentTrack)
  const { setQueue } = useQueueStore()

  useEffect(() => {
    if (!name) return
    setLoading(true)
    api.artist(decodeURIComponent(name))
      .then((data) => {
        setArtist(data.artist)
        setTracks(data.tracks)
      })
      .catch(() => {
        setArtist(null)
        setTracks([])
      })
      .finally(() => setLoading(false))
  }, [name])

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      setCurrentTrack(tracks[0])
      setQueue(tracks)
    }
  }

  const handleShuffle = () => {
    if (tracks.length > 0) {
      const shuffled = [...tracks].sort(() => Math.random() - 0.5)
      setCurrentTrack(shuffled[0])
      setQueue(shuffled)
    }
  }

  const handleTrackClick = (track: Track) => {
    setCurrentTrack(track)
    setQueue(tracks)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-nw-accent/30 border-t-nw-accent rounded-full animate-spin" />
      </div>
    )
  }

  if (!artist) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4">
        <Music2 size={48} className="text-nw-muted mb-4" />
        <p className="text-nw-text-secondary">Artist not found</p>
      </div>
    )
  }

  return (
    <div className="pb-8">
      {/* Artist Hero */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative px-6 pt-8 pb-10 mb-6"
      >
        {/* Background blur from artist image */}
        {artist.imageUrl && (
          <div className="absolute inset-0 overflow-hidden rounded-2xl -z-10">
            <img
              src={artist.imageUrl}
              alt=""
              className="w-full h-full object-cover blur-[80px] opacity-20 scale-150"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-nw-black/60 to-nw-black" />
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Artist Image */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {artist.imageUrl ? (
              <img
                src={artist.imageUrl}
                alt={artist.name}
                className="w-36 h-36 sm:w-44 sm:h-44 rounded-full object-cover shadow-2xl shadow-black/50 border-2 border-white/10"
              />
            ) : (
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-nw-surface flex items-center justify-center">
                <Music2 size={48} className="text-nw-muted" />
              </div>
            )}
          </motion.div>

          {/* Artist Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center sm:text-left"
          >
            <p className="text-[10px] uppercase tracking-[0.2em] text-nw-accent font-semibold mb-1">
              Artist
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-nw-text mb-3">
              {artist.name}
            </h1>
            {artist.genres && artist.genres.length > 0 && (
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                {artist.genres.map((g) => (
                  <span
                    key={g}
                    className="px-3 py-1 rounded-full text-xs bg-white/[0.06] text-nw-text-secondary border border-white/[0.06]"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}
            {artist.bio && (
              <p className="mt-3 text-sm text-nw-text-tertiary max-w-md line-clamp-2">
                {artist.bio}
              </p>
            )}
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center sm:justify-start gap-3 mt-6"
        >
          <button
            onClick={handlePlayAll}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-nw-accent text-nw-black font-semibold text-sm hover:bg-nw-accent-hover transition-all hover:scale-105 active:scale-95 shadow-lg shadow-nw-accent/20"
          >
            <Play size={18} fill="currentColor" />
            Play All
          </button>
          <button
            onClick={handleShuffle}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/[0.06] text-nw-text font-semibold text-sm hover:bg-white/[0.1] transition-all border border-white/[0.08]"
          >
            <Shuffle size={16} />
            Shuffle
          </button>
        </motion.div>
      </motion.div>

      {/* Songs */}
      <div className="px-4 sm:px-6">
        <h2 className="text-lg font-display font-bold text-nw-text mb-4">
          Top Songs
        </h2>

        {tracks.length === 0 ? (
          <p className="text-nw-text-tertiary text-sm">No songs found for this artist.</p>
        ) : (
          <div className="space-y-0.5">
            {tracks.map((track, index) => (
              <TrackRow
                key={`${track.id}-${index}`}
                track={track}
                index={index + 1}
                onClick={() => handleTrackClick(track)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
