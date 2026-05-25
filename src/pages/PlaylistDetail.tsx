import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ListMusic, Play, Loader2, Edit2, Trash2, Check, X } from 'lucide-react'
import { useAuthStore, usePlayerStore, useQueueStore } from '@/store'
import { getPlaylistDetails, getPlaylistTracks, renamePlaylist, deletePlaylist, removeTrackFromPlaylist } from '@/lib/supabase'
import type { Track, Playlist } from '@/types'
import { TrackRow } from '@/components/ui/TrackRow'
import { TrackRowSkeleton } from '@/components/ui/Skeleton'
import { PlaylistCover } from '@/components/ui/PlaylistCover'

export function PlaylistDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { setTrack, togglePlay, currentTrack, isPlaying } = usePlayerStore()
  const { setQueue } = useQueueStore()
  
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [tracks, setTracks] = useState<Track[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (id && user?.id) {
      loadPlaylist(id)
    }
  }, [id, user?.id])

  const loadPlaylist = async (playlistId: string) => {
    setIsLoading(true)
    const [details, trackList] = await Promise.all([
      getPlaylistDetails(playlistId),
      getPlaylistTracks(playlistId)
    ])
    
    if (details) setPlaylist(details as Playlist)
    if (trackList) setTracks(trackList)
    
    setIsLoading(false)
  }

  const handlePlayAll = () => {
    if (tracks.length === 0) return
    setQueue(tracks)
    setTrack(tracks[0])
    if (!isPlaying) togglePlay()
  }

  const handleRename = async () => {
    if (!playlist || !editName.trim() || editName.trim() === playlist.name) {
      setIsEditing(false)
      return
    }
    const newName = editName.trim()
    setPlaylist({ ...playlist, name: newName })
    setIsEditing(false)
    await renamePlaylist(playlist.id, newName)
  }

  const handleDelete = async () => {
    if (!playlist) return
    if (!confirm('Are you sure you want to delete this playlist?')) return
    
    setIsDeleting(true)
    await deletePlaylist(playlist.id)
    navigate('/library')
  }

  const handleRemoveTrack = async (trackId: string) => {
    if (!playlist) return
    setTracks(tracks.filter(t => t.id !== trackId))
    await removeTrackFromPlaylist(playlist.id, trackId)
  }

  if (isLoading) {
    return (
      <div className="px-4 md:px-8 py-8">
        <div className="flex gap-6 mb-8 items-end">
          <div className="w-40 h-40 rounded-xl bg-nw-surface animate-pulse" />
          <div className="flex-1 space-y-4">
            <div className="h-4 w-20 bg-nw-surface animate-pulse rounded" />
            <div className="h-10 w-64 bg-nw-surface animate-pulse rounded" />
          </div>
        </div>
        <div className="space-y-1">
          {Array.from({ length: 5 }).map((_, i) => <TrackRowSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h2 className="text-xl font-bold text-nw-text mb-2">Playlist Not Found</h2>
        <p className="text-nw-text-tertiary">This playlist doesn't exist or you don't have access to it.</p>
      </div>
    )
  }

  return (
    <div className="px-4 md:px-8 py-8 space-y-8">
      {/* Header Info */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row gap-6 md:items-end"
      >
        <div className="w-32 h-32 md:w-48 md:h-48 rounded-xl bg-nw-elevated shadow-2xl flex items-center justify-center shrink-0 overflow-hidden border border-nw-border">
          <PlaylistCover 
            coverUrls={playlist.cover_url ? [playlist.cover_url] : tracks.map(t => t.coverUrl).filter(Boolean)} 
            className="w-full h-full" 
          />
        </div>
        
        <div className="flex flex-col gap-2 flex-1">
          <span className="text-xs font-bold tracking-widest uppercase text-nw-text-tertiary">Playlist</span>
          
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="bg-black/20 border border-nw-accent rounded px-3 py-1 text-2xl md:text-4xl font-display font-bold text-nw-text focus:outline-none w-full max-w-md"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              />
              <button onClick={handleRename} className="p-2 bg-nw-success/20 text-nw-success rounded hover:bg-nw-success/30">
                <Check size={20} />
              </button>
              <button onClick={() => setIsEditing(false)} className="p-2 bg-nw-danger/20 text-nw-danger rounded hover:bg-nw-danger/30">
                <X size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 group">
              <h1 className="text-3xl md:text-5xl font-display font-bold text-nw-text tracking-tight">
                {playlist.name}
              </h1>
              {user?.id === playlist.user_id && (
                <button
                  onClick={() => {
                    setEditName(playlist.name)
                    setIsEditing(true)
                  }}
                  className="opacity-0 group-hover:opacity-100 p-2 text-nw-text-tertiary hover:text-nw-text transition-all"
                >
                  <Edit2 size={20} />
                </button>
              )}
            </div>
          )}
          <p className="text-sm text-nw-text-secondary mt-1">
            {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'}
          </p>
          
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handlePlayAll}
              disabled={tracks.length === 0}
              className="flex items-center gap-2 bg-nw-accent text-white px-6 py-2.5 rounded-full font-semibold hover:bg-nw-accent-hover hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-nw-accent-glow/20"
            >
              <Play size={18} fill="currentColor" />
              <span>Play All</span>
            </button>
            
            {user?.id === playlist.user_id && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 bg-nw-surface border border-nw-border text-nw-danger px-4 py-2.5 rounded-full font-medium hover:bg-nw-danger/10 hover:border-nw-danger/50 transition-all disabled:opacity-50"
              >
                {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                <span className="hidden sm:inline">Delete Playlist</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Tracks List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-1"
      >
        {tracks.length > 0 ? (
          tracks.map((track, idx) => (
            <TrackRow 
              key={`${track.id}-${idx}`} 
              track={track} 
              index={idx + 1} 
              showIndex 
              playlistId={user?.id === playlist.user_id ? playlist.id : undefined}
              onRemove={user?.id === playlist.user_id ? handleRemoveTrack : undefined}
            />
          ))
        ) : (
          <div className="py-12 text-center border border-dashed border-nw-border rounded-xl">
            <ListMusic size={32} className="mx-auto mb-3 text-nw-text-tertiary" />
            <p className="text-nw-text-secondary font-medium">This playlist is empty</p>
            <p className="text-nw-text-tertiary text-sm mt-1">Add tracks by right-clicking songs.</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
