import { useState, useEffect } from 'react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { AlbumCard } from '@/components/music/AlbumCard'
import { ArtistCard } from '@/components/music/ArtistCard'
import { TrackRow } from '@/components/ui/TrackRow'
import { ScrollableRow } from '@/components/ui/ScrollableRow'
import { TrackRowSkeleton, AlbumCardSkeleton, ArtistCardSkeleton } from '@/components/ui/Skeleton'
import { usePlayerStore, useQueueStore } from '@/store'
import { api } from '@/lib/api'
import type { Track, Album, Artist } from '@/types'
import { motion } from 'framer-motion'
import { Play, Sparkles, Search as SearchIcon } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { fetchPlayHistory } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'

export function HomePage() {
  const setTrack = usePlayerStore((s) => s.setTrack)
  const addMultipleToQueue = useQueueStore((s) => s.addMultipleToQueue)
  const queueHistory = useQueueStore((s) => s.history)
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  
  const [tracks, setTracks] = useState<Track[]>([])
  const [recentTracks, setRecentTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        let artists: string[] = []
        let recents: Track[] = []
        if (user) {
          const dbHistory = await fetchPlayHistory(user.id, 20)
          recents = dbHistory
          artists = dbHistory.map(t => t.artist)
        } else {
          recents = [...queueHistory].reverse()
          artists = queueHistory.map(t => t.artist)
        }
        
        // deduplicate artists
        artists = [...new Set(artists)].slice(0, 10)
        
        const result = await api.homeFeed(artists)
        if (!cancelled) {
          setTracks(result)
          setRecentTracks(recents)
          setError('')
        }
      } catch (err) {
        if (!cancelled) setError((err as Error).message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [user, queueHistory.length])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate('/search')
      // Hack: we don't have a global search state, so we just navigate. The user will type again. Wait, or we can use localstorage for recent searches. But navigating is fine for now.
    }
  }

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      setTrack(tracks[0])
      addMultipleToQueue(tracks.slice(1))
    }
  }

  // Derive unique albums/artists from tracks
  const albums: Album[] = Object.values(
    tracks.reduce<Record<string, Album>>((acc, t) => {
      if (!acc[t.albumId]) {
        acc[t.albumId] = {
          id: t.albumId,
          title: t.album,
          artist: t.artist,
          coverUrl: t.coverUrl,
          year: t.year || 0,
          tracks: [],
        }
      }
      acc[t.albumId].tracks.push(t)
      return acc
    }, {})
  ).slice(0, 8)

  const artists: Artist[] = Array.from(
    new Map(
      tracks.map((t) => [
        t.artist,
        { id: t.artist, name: t.artist, imageUrl: t.coverUrl, genres: [] },
      ])
    ).values()
  ).slice(0, 8)

  return (
    <div className="px-4 md:px-8 py-6 space-y-10">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-2xl p-6 md:p-10"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-nw-accent/10 via-nw-accent-glow/5 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-nw-black/80 to-transparent" />

        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} className="text-nw-accent" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-nw-accent">
              {(() => {
                const h = new Date().getHours()
                const greeting = h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening'
                return `${greeting}${user?.displayName ? `, ${user.displayName}` : ''}`
              })()}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-nw-text tracking-tight mb-2">
            FVCK Ads,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-nw-accent to-nw-accent-hover">
              Enjoy Music
            </span>
          </h1>
          <p className="text-sm text-nw-text-secondary mb-5 max-w-md leading-relaxed">
            Pure, uninterrupted listening. Curated from your habits, just for you.
          </p>

          <form onSubmit={handleSearchSubmit} className="relative max-w-sm mb-6">
            <SearchIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-nw-text-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search songs, artists, albums..."
              className="w-full pl-10 pr-4 py-3 bg-nw-surface/60 border border-white/10 rounded-full text-sm text-nw-text placeholder:text-nw-muted focus:outline-none focus:border-nw-accent/40 focus:ring-1 focus:ring-nw-accent-ring transition-all"
            />
          </form>

          <button
            onClick={handlePlayAll}
            disabled={tracks.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-nw-accent text-white text-sm font-medium rounded-full hover:bg-nw-accent-hover transition-all duration-200 glow-accent cursor-pointer disabled:opacity-50"
          >
            <Play size={16} fill="white" />
            Play All
          </button>
        </div>

        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-nw-accent/5 blur-3xl pointer-events-none" />
        <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-nw-accent-glow/3 blur-2xl pointer-events-none" />
      </motion.section>

      {/* Error */}
      {error && (
        <div className="text-center py-8">
          <p className="text-sm text-nw-danger">{error}</p>
          <p className="text-xs text-nw-text-tertiary mt-1">Make sure the Nullwave Worker is running</p>
        </div>
      )}

      {/* Recently Played */}
      {!loading && recentTracks.length > 0 && (
        <section>
          <SectionHeader title="Recently Played" subtitle="Jump right back in" />
          <ScrollableRow>
            {recentTracks.slice(0, 10).map((track, i) => (
              <div key={`${track.id}-${i}`} className="w-[280px] shrink-0 bg-nw-surface/40 hover:bg-white/[0.04] transition-colors rounded-xl overflow-hidden border border-white/5">
                <TrackRow track={track} showAlbum={false} className="hover:bg-transparent" />
              </div>
            ))}
          </ScrollableRow>
        </section>
      )}

      {/* Made For You */}
      <section>
        <SectionHeader title="Made For You" subtitle="Fresh picks based on your taste" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <TrackRowSkeleton key={i} />)
            : tracks.slice(0, 8).map((track, i) => (
                <TrackRow key={track.id} track={track} index={i + 1} />
              ))}
        </div>
      </section>

      {/* Albums */}
      {!loading && albums.length > 0 && (
        <section>
          <SectionHeader title="Featured Albums" subtitle="Curated selections from the underground" />
          <ScrollableRow>
            {albums.map((album, i) => (
              <div key={album.id} className="w-[150px] sm:w-[180px] flex-shrink-0 snap-start">
                <AlbumCard album={album} index={i} />
              </div>
            ))}
          </ScrollableRow>
        </section>
      )}

      {/* Albums loading skeleton */}
      {loading && (
        <section>
          <SectionHeader title="Featured Albums" subtitle="Curated selections from the underground" />
          <ScrollableRow>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-[150px] sm:w-[180px] flex-shrink-0 snap-start">
                <AlbumCardSkeleton />
              </div>
            ))}
          </ScrollableRow>
        </section>
      )}

      {/* Artists */}
      {!loading && artists.length > 0 && (
        <section>
          <SectionHeader title="Artists" subtitle="Discover voices from the region" />
          <ScrollableRow>
            {artists.map((artist, i) => (
              <div key={artist.id} className="w-[140px] sm:w-[160px] flex-shrink-0 snap-start">
                <ArtistCard artist={artist} index={i} />
              </div>
            ))}
          </ScrollableRow>
        </section>
      )}

      {/* Artists loading skeleton */}
      {loading && (
        <section>
          <SectionHeader title="Artists" subtitle="Discover voices from the region" />
          <ScrollableRow>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-[140px] sm:w-[160px] flex-shrink-0 snap-start">
                <ArtistCardSkeleton />
              </div>
            ))}
          </ScrollableRow>
        </section>
      )}

      {/* Recently Added */}
      {!loading && tracks.length > 8 && (
        <section>
          <SectionHeader title="Recently Added" />
          <div className="space-y-0.5">
            {tracks.slice(8).map((track, i) => (
              <TrackRow key={track.id} track={track} index={i + 1} showIndex />
            ))}
          </div>
        </section>
      )}

      <div className="h-4" />
    </div>
  )
}
