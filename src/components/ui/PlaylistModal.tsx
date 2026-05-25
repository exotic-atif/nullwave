import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, ListMusic, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store'
import { getUserPlaylists, createPlaylist, addTrackToPlaylist } from '@/lib/supabase'
import type { Track, Playlist } from '@/types'

interface PlaylistModalProps {
  isOpen: boolean
  onClose: () => void
  trackToAdd?: Track | null
}

export function PlaylistModal({ isOpen, onClose, trackToAdd }: PlaylistModalProps) {
  const user = useAuthStore((s) => s.user)
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isAdding, setIsAdding] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && user?.id) {
      loadPlaylists()
    }
  }, [isOpen, user?.id])

  const loadPlaylists = async () => {
    if (!user) return
    setIsLoading(true)
    const data = await getUserPlaylists(user.id)
    setPlaylists(data as Playlist[])
    setIsLoading(false)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPlaylistName.trim() || !user) return

    setIsCreating(true)
    const newPlaylist = await createPlaylist(user.id, newPlaylistName.trim())
    
    if (newPlaylist) {
      setPlaylists([newPlaylist as Playlist, ...playlists])
      setNewPlaylistName('')
      
      // If we are creating this playlist to add a track right away
      if (trackToAdd) {
        await handleAddToPlaylist(newPlaylist.id)
      }
    }
    setIsCreating(false)
  }

  const handleAddToPlaylist = async (playlistId: string) => {
    if (!trackToAdd) return
    setIsAdding(playlistId)
    await addTrackToPlaylist(playlistId, trackToAdd)
    setIsAdding(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-nw-surface border border-nw-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-nw-border/50">
            <h2 className="text-lg font-bold text-nw-text">
              {trackToAdd ? 'Add to Playlist' : 'Your Playlists'}
            </h2>
            <button
              onClick={onClose}
              className="p-1 text-nw-text-tertiary hover:text-nw-text transition-colors rounded-full hover:bg-white/5"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-4 overflow-y-auto flex-1">
            {/* Create New Form */}
            <form onSubmit={handleCreate} className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New playlist name..."
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="flex-1 bg-black/20 border border-nw-border rounded-lg px-3 py-2 text-sm text-nw-text focus:outline-none focus:border-nw-accent transition-colors placeholder:text-nw-text-tertiary"
                  maxLength={50}
                />
                <button
                  type="submit"
                  disabled={!newPlaylistName.trim() || isCreating}
                  className="px-4 py-2 bg-nw-text text-nw-black rounded-lg text-sm font-medium hover:bg-white active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isCreating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  <span>Create</span>
                </button>
              </div>
            </form>

            {/* Playlists List */}
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 size={24} className="text-nw-accent animate-spin" />
              </div>
            ) : playlists.length === 0 ? (
              <div className="text-center py-8">
                <ListMusic size={32} className="mx-auto mb-3 text-nw-text-tertiary" />
                <p className="text-nw-text-secondary text-sm">No playlists yet</p>
                <p className="text-nw-text-tertiary text-xs mt-1">Create one above to get started</p>
              </div>
            ) : (
              <div className="space-y-1">
                {playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    onClick={() => trackToAdd && handleAddToPlaylist(playlist.id)}
                    disabled={isAdding === playlist.id || !trackToAdd}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors text-left group disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <div className="w-10 h-10 rounded bg-nw-elevated border border-nw-border flex items-center justify-center shrink-0">
                      <ListMusic size={18} className="text-nw-text-tertiary group-hover:text-nw-accent transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-nw-text truncate group-hover:text-nw-accent transition-colors">
                        {playlist.name}
                      </p>
                    </div>
                    {isAdding === playlist.id && (
                      <Loader2 size={16} className="text-nw-accent animate-spin" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
