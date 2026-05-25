import { useState, useEffect } from 'react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { AlbumCard } from '@/components/music/AlbumCard'
import { ArtistCard } from '@/components/music/ArtistCard'
import { TrackRow } from '@/components/ui/TrackRow'
import { TrackRowSkeleton, AlbumCardSkeleton, ArtistCardSkeleton } from '@/components/ui/Skeleton'
import { usePlayerStore, useQueueStore } from '@/store'
import { api } from '@/lib/api'
import type { Track, Album, Artist } from '@/types'
import { motion } from 'framer-motion'
import { Play, Sparkles } from 'lucide-react'

export function HomePage() {
  const setTrack = usePlayerStore((s) => s.setTrack)
  const addMultipleToQueue = useQueueStore((s) => s.addMultipleToQueue)
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const result = await api.trending()
        if (!cancelled) {
          setTracks(result)
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
  }, [])

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
              Welcome back
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-nw-text tracking-tight mb-2">
            Your Private
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-nw-accent to-nw-accent-hover">
              Sound Space
            </span>
          </h1>
          <p className="text-sm text-nw-text-secondary mb-5 max-w-md leading-relaxed">
            Underground frequencies. Curated for you. No algorithms, no noise — just music that matters.
          </p>
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

      {/* Random Mix Tracks */}
      <section>
        <SectionHeader title="Daily Random Mix" subtitle="Fresh picks just for you" />
        <div className="space-y-0.5">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <TrackRowSkeleton key={i} />)
            : tracks.slice(0, 8).map((track, i) => (
                <TrackRow key={track.id} track={track} index={i + 1} showIndex />
              ))}
        </div>
      </section>

      {/* Albums */}
      {!loading && albums.length > 0 && (
        <section>
          <SectionHeader title="Featured Albums" subtitle="Curated selections from the underground" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1">
            {albums.map((album, i) => (
              <AlbumCard key={album.id} album={album} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Albums loading skeleton */}
      {loading && (
        <section>
          <SectionHeader title="Featured Albums" subtitle="Curated selections from the underground" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <AlbumCardSkeleton key={i} />
            ))}
          </div>
        </section>
      )}

      {/* Artists */}
      {!loading && artists.length > 0 && (
        <section>
          <SectionHeader title="Artists" subtitle="Discover voices from the region" />
          <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-none">
            {artists.map((artist, i) => (
              <ArtistCard key={artist.id} artist={artist} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Artists loading skeleton */}
      {loading && (
        <section>
          <SectionHeader title="Artists" subtitle="Discover voices from the region" />
          <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-none">
            {Array.from({ length: 6 }).map((_, i) => (
              <ArtistCardSkeleton key={i} />
            ))}
          </div>
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
