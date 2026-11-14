import { useState, useEffect, useMemo } from 'react'
import { Disc3, Search as SearchIcon } from 'lucide-react'
import { AlbumCard } from '@/components/music/AlbumCard'
import { AlbumCardSkeleton } from '@/components/ui/Skeleton'
import { api, filterCleanTracks } from '@/lib/api'
import { useAuthStore } from '@/store'
import type { Album, Track } from '@/types'
import { motion } from 'framer-motion'

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'trending', label: 'Trending' },
  { id: 'pop', label: 'Pop & R&B' },
  { id: 'hiphop', label: 'Hip-Hop' },
  { id: 'indie', label: 'Indie & Alt' },
  { id: 'soundtrack', label: 'Soundtracks' },
]

export function AlbumsPage() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    let active = true
    setLoading(true)

    async function loadAlbums() {
      try {
        const user = useAuthStore.getState().user
        // 1. Fetch initial albums from personalized home feed
        const feedTracks = await api.homeFeed({
          recentArtists: [],
          favArtists: user?.favArtists || '',
          favSongs: user?.favSongs || '',
        }).catch(() => [])
        const cleanFeedTracks = filterCleanTracks(feedTracks || [])

        // 2. Query curated collections for rich catalog depth
        const [popRes, hipHopRes, indieRes, soundRes] = await Promise.all([
          api.search('The Weeknd').catch(() => ({ albums: [], tracks: [] })),
          api.search('Kendrick Lamar').catch(() => ({ albums: [], tracks: [] })),
          api.search('Arctic Monkeys').catch(() => ({ albums: [], tracks: [] })),
          api.search('Interstellar').catch(() => ({ albums: [], tracks: [] })),
        ])

        if (!active) return

        // 3. Extract unique albums from tracks & searches
        const albumMap = new Map<string, Album>()

        // From home feed
        for (const t of cleanFeedTracks) {
          if (!t.album) continue
          const key = (t.albumId?.trim() || `${t.album}::${t.artist}`).toLowerCase()
          if (!albumMap.has(key)) {
            albumMap.set(key, {
              id: t.albumId || `${t.album}::${t.artist}`,
              title: t.album,
              artist: t.artist,
              coverUrl: t.coverUrl,
              year: t.year || 0,
              tracks: [t],
            })
          } else {
            albumMap.get(key)!.tracks.push(t)
          }
        }

        // Add explicit search albums
        const allSearchAlbums: Album[] = [
          ...(popRes.albums || []),
          ...(hipHopRes.albums || []),
          ...(indieRes.albums || []),
          ...(soundRes.albums || []),
        ]

        for (const a of allSearchAlbums) {
          if (!a.title) continue
          const key = (a.id || `${a.title}::${a.artist}`).toLowerCase()
          if (!albumMap.has(key)) {
            albumMap.set(key, a)
          }
        }

        // Ensure tracks from search also contribute albums
        const allSearchTracks: Track[] = filterCleanTracks([
          ...(popRes.tracks || []),
          ...(hipHopRes.tracks || []),
          ...(indieRes.tracks || []),
          ...(soundRes.tracks || []),
        ])

        for (const t of allSearchTracks) {
          if (!t.album) continue
          const key = (t.albumId?.trim() || `${t.album}::${t.artist}`).toLowerCase()
          if (!albumMap.has(key)) {
            albumMap.set(key, {
              id: t.albumId || `${t.album}::${t.artist}`,
              title: t.album,
              artist: t.artist,
              coverUrl: t.coverUrl,
              year: t.year || 0,
              tracks: [t],
            })
          }
        }

        const albumList = Array.from(albumMap.values()).filter(
          (a) => a.title && a.coverUrl && !a.title.toLowerCase().includes('bhajan')
        )

        setAlbums(albumList)
      } catch (err) {
        console.warn('Failed to load albums catalog:', err)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadAlbums()
    return () => {
      active = false
    }
  }, [])

  // Filter albums by search query and category
  const filteredAlbums = useMemo(() => {
    return albums.filter((album) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        album.artist.toLowerCase().includes(searchQuery.toLowerCase())

      if (!matchesSearch) return false

      if (selectedCategory === 'all') return true
      if (selectedCategory === 'trending') return true
      if (selectedCategory === 'pop') {
        const text = `${album.title} ${album.artist}`.toLowerCase()
        return text.includes('weeknd') || text.includes('pop') || text.includes('r&b') || text.includes('dua') || text.includes('swift')
      }
      if (selectedCategory === 'hiphop') {
        const text = `${album.title} ${album.artist}`.toLowerCase()
        return text.includes('kendrick') || text.includes('drake') || text.includes('travis') || text.includes('rap')
      }
      if (selectedCategory === 'indie') {
        const text = `${album.title} ${album.artist}`.toLowerCase()
        return text.includes('monkeys') || text.includes('rock') || text.includes('indie') || text.includes('daft')
      }
      if (selectedCategory === 'soundtrack') {
        const text = `${album.title} ${album.artist}`.toLowerCase()
        return text.includes('soundtrack') || text.includes('theme') || text.includes('score') || text.includes('interstellar')
      }

      return true
    })
  }, [albums, searchQuery, selectedCategory])

  return (
    <div className="px-4 md:px-8 py-6 space-y-8 max-w-7xl mx-auto pb-28">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-2 text-xs font-semibold text-nw-accent bg-nw-accent/10 border border-nw-accent/20 rounded-full">
              <Disc3 size={13} /> Albums Catalog
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-extrabold text-white tracking-tight">
              Albums
            </h1>
            <p className="text-sm text-nw-text-secondary mt-1">
              Curated selections, full discographies, and top underground records
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-72">
            <SearchIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-nw-text-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter albums or artists…"
              className="w-full pl-10 pr-4 py-2 bg-nw-surface/60 border border-white/10 rounded-full text-xs text-white placeholder:text-nw-muted focus:outline-none focus:border-nw-accent/50 focus:ring-1 focus:ring-nw-accent/30 transition-all"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-nw-accent text-nw-black shadow-md shadow-nw-accent/20'
                  : 'bg-white/5 hover:bg-white/10 text-nw-text-secondary hover:text-white border border-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="w-full">
              <AlbumCardSkeleton />
            </div>
          ))}
        </div>
      ) : filteredAlbums.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {filteredAlbums.map((album, i) => (
            <div key={`${album.id}-${i}`} className="w-full">
              <AlbumCard album={album} index={i % 12} />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center space-y-3">
          <Disc3 size={40} className="mx-auto text-nw-muted opacity-50" />
          <p className="text-base font-semibold text-white">No albums match your search</p>
          <p className="text-xs text-nw-text-tertiary max-w-sm mx-auto">
            Try checking your spelling or selecting another category to discover more albums.
          </p>
          <button
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('all')
            }}
            className="mt-2 px-4 py-2 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  )
}
