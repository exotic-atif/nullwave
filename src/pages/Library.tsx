import { useState, useEffect } from 'react'
import { Clock, Disc3, Heart, X } from 'lucide-react'
import { ScrollableRow } from '@/components/ui/ScrollableRow'
import { TrackRow } from '@/components/ui/TrackRow'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { TrackRowSkeleton } from '@/components/ui/Skeleton'
import { useAuthStore, useLikedStore, useQueueStore } from '@/store'
import { fetchPlayHistory, clearPlayHistory, getUserPlaylists } from '@/lib/supabase'
import type { Track, Playlist } from '@/types'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { PlaylistCover } from '@/components/ui/PlaylistCover'

type Tab = 'liked' | 'history' | 'playlists'

const tabs: { id: Tab; label: string; icon: any }[] = [
  { id: 'liked', label: 'Liked Songs', icon: Heart },
  { id: 'playlists', label: 'Playlists', icon: Disc3 },
  { id: 'history', label: 'Recently Played', icon: Clock },
]

export function LibraryPage() {
  const [activeTab, setActiveTab] = useState<Tab>('liked')
  const user = useAuthStore((s) => s.user)
  const { likedTracks, isLoaded } = useLikedStore()
  const [history, setHistory] = useState<Track[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [playlistsLoading, setPlaylistsLoading] = useState(false)

  // Fetch play history when tab is selected
  useEffect(() => {
    if (activeTab === 'history' && user?.id) {
      setHistoryLoading(true)
      fetchPlayHistory(user.id, 50).then((tracks) => {
        setHistory(tracks)
        setHistoryLoading(false)
      })
    }
    
    if (activeTab === 'playlists' && user?.id) {
      setPlaylistsLoading(true)
      getUserPlaylists(user.id).then((data) => {
        setPlaylists(data as Playlist[])
        setPlaylistsLoading(false)
      })
    }
  }, [activeTab, user?.id])

  return (
    <div className="px-4 md:px-8 py-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl md:text-3xl font-display font-bold text-nw-text tracking-tight">
          Library
        </h1>
        <p className="text-sm text-nw-text-tertiary mt-1">Your personal collection</p>
      </motion.div>

      {/* Tabs */}
      <ScrollableRow className="mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap transition-all font-medium flex-shrink-0 ${
              activeTab === tab.id
                ? 'bg-nw-text text-nw-black shadow-lg shadow-white/5'
                : 'bg-nw-surface/50 text-nw-text-secondary hover:text-white hover:bg-nw-surface border border-white/5'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </ScrollableRow>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="space-y-8"
      >
        {activeTab === 'liked' && (
          <section>
            <SectionHeader
              title="Liked Songs"
              subtitle={isLoaded ? `${likedTracks.length} songs` : 'Loading...'}
            />
            {!isLoaded ? (
              <div className="space-y-0.5">
                {Array.from({ length: 5 }).map((_, i) => <TrackRowSkeleton key={i} />)}
              </div>
            ) : likedTracks.length > 0 ? (
              <div className="space-y-0.5">
                {likedTracks.map((track, i) => (
                  <TrackRow key={track.id} track={track} index={i + 1} showIndex />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-20 text-center">
                <p className="text-nw-text-secondary text-sm">No liked songs yet</p>
                <p className="text-xs text-nw-text-tertiary mt-1">
                  Like songs to build your collection
                </p>
              </div>
            )}
          </section>
        )}

        {activeTab === 'history' && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <SectionHeader
                title="Recently Played"
                subtitle={`${history.length} tracks`}
              />
              {history.length > 0 && (
                <button
                  onClick={async () => {
                    if (user?.id) {
                      await clearPlayHistory(user.id)
                      setHistory([])
                    }
                  }}
                  className="text-xs text-nw-text-tertiary hover:text-nw-text transition-colors"
                >
                  Clear History
                </button>
              )}
            </div>
            {historyLoading ? (
              <div className="space-y-0.5">
                {Array.from({ length: 5 }).map((_, i) => <TrackRowSkeleton key={i} />)}
              </div>
            ) : history.length > 0 ? (
              <div className="space-y-0.5">
                {history.map((track, i) => (
                  <div key={`hist-${track.id}-${i}`} className="group relative">
                    <TrackRow track={track} index={i + 1} showIndex className="pr-12" />
                    <button
                      onClick={() => {
                        useQueueStore.getState().removeFromHistory(track.id)
                        setHistory(prev => prev.filter(t => t.id !== track.id))
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-nw-text-tertiary hover:text-white hover:bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
                      title="Remove from History"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-20 text-center">
                <p className="text-nw-text-secondary text-sm">No playback history</p>
                <p className="text-xs text-nw-text-tertiary mt-1">
                  Start playing music to see your history
                </p>
              </div>
            )}
          </section>
        )}

        {activeTab === 'playlists' && (
          <section>
            <SectionHeader title="Your Playlists" subtitle={`${playlists.length} playlists`} />
            
            {playlistsLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-nw-surface animate-pulse rounded-xl" />
                ))}
              </div>
            ) : playlists.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {playlists.map((playlist) => {
                  const coverUrls = playlist.cover_url 
                    ? [playlist.cover_url] 
                    : (playlist.playlist_tracks || []).map(t => t.track_data.coverUrl).filter(Boolean)
                  
                  return (
                    <Link
                      key={playlist.id}
                      to={`/playlist/${playlist.id}`}
                      className="group bg-nw-surface/40 hover:bg-white/5 border border-transparent hover:border-nw-border-subtle p-3 rounded-xl transition-all duration-300"
                    >
                      <div className="aspect-square rounded-lg bg-nw-elevated shadow-lg flex items-center justify-center mb-3 overflow-hidden">
                        <PlaylistCover 
                          coverUrls={coverUrls} 
                          className="w-full h-full group-hover:scale-105 transition-transform duration-500" 
                        />
                      </div>
                      <p className="text-sm font-bold text-nw-text truncate group-hover:text-nw-accent transition-colors">{playlist.name}</p>
                      <p className="text-xs text-nw-text-tertiary truncate">Playlist</p>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center py-20 text-center">
                <p className="text-nw-text-secondary text-sm">No playlists yet</p>
                <p className="text-xs text-nw-text-tertiary mt-1">
                  Right click any song to add it to a new playlist
                </p>
              </div>
            )}
          </section>
        )}
      </motion.div>
    </div>
  )
}
