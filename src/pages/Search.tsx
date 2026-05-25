import { useState, useEffect, useCallback } from 'react'
import { Search as SearchIcon, TrendingUp, Clock, X } from 'lucide-react'
import { TrackRow } from '@/components/ui/TrackRow'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { TrackRowSkeleton } from '@/components/ui/Skeleton'
import { AlbumCard } from '@/components/music/AlbumCard'
import { ArtistCard } from '@/components/music/ArtistCard'
import { api } from '@/lib/api'
import { debounce } from '@/lib/utils'
import type { Track, Album, Artist } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'

const TRENDING_TERMS = [
  'Coke Studio Bangla',
  'Artcell',
  'Shironamhin',
  'Bengali indie',
  'Fossils',
  'Anupam Roy',
  'Arijit Singh Bengali',
  'Tahsan',
]

export function SearchPage() {
  const [query, setQuery] = useState('')
  const [tracks, setTracks] = useState<Track[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [artists, setArtists] = useState<Artist[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('nw-recent-searches') || '[]')
    } catch {
      return []
    }
  })

  const performSearch = useCallback(
    debounce(async (q: string) => {
      if (!q.trim()) {
        setTracks([])
        setAlbums([])
        setArtists([])
        setHasSearched(false)
        setIsSearching(false)
        return
      }

      setIsSearching(true)
      try {
        const results = await api.search(q)
        setTracks(results.tracks || [])
        setAlbums(results.albums || [])
        setArtists(results.artists || [])
        setHasSearched(true)

        // Save to recent
        setRecentSearches((prev) => {
          const updated = [q, ...prev.filter((s) => s !== q)].slice(0, 5)
          localStorage.setItem('nw-recent-searches', JSON.stringify(updated))
          return updated
        })
      } catch (err) {
        console.error('Search failed:', err)
      } finally {
        setIsSearching(false)
      }
    }, 400),
    []
  )

  useEffect(() => {
    if (query.trim()) {
      setIsSearching(true)
      performSearch(query)
    } else {
      setTracks([])
      setAlbums([])
      setArtists([])
      setHasSearched(false)
    }
  }, [query, performSearch])

  const handleTrendingClick = (term: string) => {
    setQuery(term)
  }

  const removeRecent = (term: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((s) => s !== term)
      localStorage.setItem('nw-recent-searches', JSON.stringify(updated))
      return updated
    })
  }

  const hasResults = tracks.length > 0 || albums.length > 0 || artists.length > 0

  return (
    <div className="px-4 md:px-8 py-6 space-y-8">
      {/* Search Input */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="relative max-w-2xl">
          <SearchIcon
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-nw-text-tertiary"
          />
          <input
            id="search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search songs, albums, artists..."
            className="w-full pl-11 pr-10 py-3.5 bg-nw-surface/60 border border-nw-border-subtle rounded-2xl text-sm text-nw-text placeholder:text-nw-muted focus:outline-none focus:border-nw-accent/40 focus:bg-nw-surface/80 focus:ring-1 focus:ring-nw-accent-ring transition-all duration-300"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-nw-text-tertiary hover:text-nw-text transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {query.trim() ? (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {isSearching ? (
              <section>
                <SectionHeader title="Searching..." />
                <div className="space-y-0.5">
                  {Array.from({ length: 5 }).map((_, i) => <TrackRowSkeleton key={i} />)}
                </div>
              </section>
            ) : hasResults ? (
              <>
                {tracks.length > 0 && (
                  <section>
                    <SectionHeader title="Tracks" subtitle={`${tracks.length} results`} />
                    <div className="space-y-0.5">
                      {tracks.map((track, i) => (
                        <TrackRow key={track.id} track={track} index={i} />
                      ))}
                    </div>
                  </section>
                )}
                {artists.length > 0 && (
                  <section>
                    <SectionHeader title="Artists" subtitle={`${artists.length} results`} />
                    <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-none">
                      {artists.map((artist, i) => (
                        <ArtistCard key={artist.id} artist={artist} index={i} />
                      ))}
                    </div>
                  </section>
                )}
                {albums.length > 0 && (
                  <section>
                    <SectionHeader title="Albums" subtitle={`${albums.length} results`} />
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1">
                      {albums.map((album, i) => (
                        <AlbumCard key={album.id} album={album as Album} index={i} />
                      ))}
                    </div>
                  </section>
                )}
              </>
            ) : hasSearched ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <SearchIcon size={40} className="text-nw-muted mb-4" />
                <p className="text-nw-text-secondary text-sm">
                  No results for "<span className="text-nw-text">{query}</span>"
                </p>
                <p className="text-xs text-nw-text-tertiary mt-1">
                  Try a different search term
                </p>
              </motion.div>
            ) : null}
          </motion.div>
        ) : (
          <motion.div
            key="browse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <section>
                <SectionHeader title="Recent Searches" />
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term) => (
                    <motion.button
                      key={term}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => handleTrendingClick(term)}
                      className="group flex items-center gap-2 px-3.5 py-2 bg-nw-surface/50 border border-nw-border-subtle rounded-full text-sm text-nw-text-secondary hover:text-nw-text hover:border-nw-accent/20 transition-all duration-200"
                    >
                      <Clock size={13} className="text-nw-muted" />
                      {term}
                      <span
                        onClick={(e) => {
                          e.stopPropagation()
                          removeRecent(term)
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-nw-muted hover:text-nw-text ml-0.5"
                      >
                        <X size={12} />
                      </span>
                    </motion.button>
                  ))}
                </div>
              </section>
            )}

            {/* Trending */}
            <section>
              <SectionHeader title="Trending" subtitle="What people are listening to" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {TRENDING_TERMS.map((term, i) => (
                  <motion.button
                    key={term}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => handleTrendingClick(term)}
                    className="flex items-center gap-3 px-4 py-3 bg-nw-surface/30 border border-nw-border-subtle rounded-xl text-left hover:bg-white/[0.04] hover:border-nw-accent/10 transition-all duration-200"
                  >
                    <TrendingUp size={14} className="text-nw-accent flex-shrink-0" />
                    <span className="text-sm text-nw-text-secondary">{term}</span>
                  </motion.button>
                ))}
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
