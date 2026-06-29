import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, User, Sparkles, Music, AtSign, Image as ImageIcon } from 'lucide-react'
import type { AccessRequest } from '@/lib/supabase'

interface EditRequestModalProps {
  request: AccessRequest
  isOpen: boolean
  onClose: () => void
  onApprove: (updatedData: Partial<AccessRequest>) => Promise<void>
}

export function EditRequestModal({ request, isOpen, onClose, onApprove }: EditRequestModalProps) {
  const [displayName, setDisplayName] = useState(request.display_name || '')
  const [avatarUrl, setAvatarUrl] = useState(request.avatar_url || '')
  const [favArtists, setFavArtists] = useState(request.fav_artists || '')
  const [favSongs, setFavSongs] = useState(request.fav_songs || '')
  const [instagramId, setInstagramId] = useState(request.instagram_id || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onApprove({
        display_name: displayName,
        avatar_url: avatarUrl,
        fav_artists: favArtists,
        fav_songs: favSongs,
        instagram_id: instagramId
      })
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 bg-nw-surface border border-nw-border-subtle rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-nw-text flex items-center gap-2">
                  <CheckCircle className="text-nw-accent" /> Review & Approve
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 text-nw-muted hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-6 p-4 bg-black/20 rounded-2xl border border-white/5 flex items-center gap-4">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover border border-white/10" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                    <User size={20} className="text-nw-muted" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-nw-text">{request.email}</p>
                  <p className="text-xs text-nw-text-secondary">Ready to join Nullwave</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Display Name */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs text-nw-text-tertiary mb-1.5 ml-1">
                    <User size={12} /> Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black/20 border border-nw-border-subtle rounded-xl text-sm text-nw-text focus:outline-none focus:border-nw-accent/40 focus:ring-1 focus:ring-nw-accent-ring transition-all"
                  />
                </div>

                {/* Avatar URL */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs text-nw-text-tertiary mb-1.5 ml-1">
                    <ImageIcon size={12} /> Profile Picture URL
                  </label>
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black/20 border border-nw-border-subtle rounded-xl text-sm text-nw-text focus:outline-none focus:border-nw-accent/40 focus:ring-1 focus:ring-nw-accent-ring transition-all"
                  />
                </div>

                {/* Fav Artists */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs text-nw-text-tertiary mb-1.5 ml-1">
                    <Sparkles size={12} /> Favorite Artists
                  </label>
                  <input
                    type="text"
                    value={favArtists}
                    onChange={(e) => setFavArtists(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black/20 border border-nw-border-subtle rounded-xl text-sm text-nw-text focus:outline-none focus:border-nw-accent/40 focus:ring-1 focus:ring-nw-accent-ring transition-all"
                  />
                </div>

                {/* Fav Songs */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs text-nw-text-tertiary mb-1.5 ml-1">
                    <Music size={12} /> Favorite Songs
                  </label>
                  <input
                    type="text"
                    value={favSongs}
                    onChange={(e) => setFavSongs(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black/20 border border-nw-border-subtle rounded-xl text-sm text-nw-text focus:outline-none focus:border-nw-accent/40 focus:ring-1 focus:ring-nw-accent-ring transition-all"
                  />
                </div>

                {/* Instagram ID */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs text-nw-text-tertiary mb-1.5 ml-1">
                    <AtSign size={12} /> Instagram ID
                  </label>
                  <input
                    type="text"
                    value={instagramId}
                    onChange={(e) => setInstagramId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black/20 border border-nw-border-subtle rounded-xl text-sm text-nw-text focus:outline-none focus:border-nw-accent/40 focus:ring-1 focus:ring-nw-accent-ring transition-all"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-nw-accent hover:bg-nw-accent-hover text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition-colors glow-accent flex justify-center items-center gap-2"
                  >
                    {isSubmitting ? 'Creating...' : 'Approve & Create'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
