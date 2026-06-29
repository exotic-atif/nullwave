import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, X, User } from 'lucide-react'
import { api } from '@/lib/api'
import { getProfile } from '@/lib/supabase'
import type { Track } from '@/types'
import { AlbumArt } from './AlbumArt'

interface ShareModalProps {
  playId: string
  byId: string | null
  onPlay: (track: Track) => void
  onClose: () => void
}

export function ShareModal({ playId, byId, onPlay, onClose }: ShareModalProps) {
  const [track, setTrack] = useState<Track | null>(null)
  const [sender, setSender] = useState<{ username: string; avatar_url: string | null } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [fetchedTrack, fetchedSender] = await Promise.all([
          api.track(playId),
          (async () => {
            if (!byId) return null
            try {
              const decoded = atob(byId)
              if (decoded.startsWith('nw_')) {
                const userId = decoded.slice(3)
                const profile = await getProfile(userId)
                return profile ? { username: profile.username || 'Someone', avatar_url: profile.avatar_url } : null
              }
            } catch (err) {
              console.error('Failed to decode share ID', err)
            }
            return null
          })()
        ])

        if (!cancelled) {
          setTrack(fetchedTrack)
          setSender(fetchedSender)
        }
      } catch (err) {
        console.error('Failed to load shared song', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [playId, byId])

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-sm bg-nw-surface/90 backdrop-blur-2xl border border-white/10 rounded-[32px] p-6 shadow-2xl overflow-hidden"
        >
          {/* Decorative glow */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-nw-accent/20 blur-3xl rounded-full" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-nw-accent-glow/20 blur-3xl rounded-full" />

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-nw-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !track ? (
            <div className="text-center py-8">
              <p className="text-nw-text font-medium mb-4">Song not found.</p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-white/10 hover:bg-white/15 rounded-full text-sm font-medium transition-colors text-white"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="relative z-10 flex flex-col items-center">
              {/* Sender Info */}
              <div className="flex items-center gap-3 mb-6 bg-black/20 pr-4 pl-1.5 py-1.5 rounded-full border border-white/5 shadow-inner">
                {sender?.avatar_url ? (
                  <img src={sender.avatar_url} alt="Sender" className="w-8 h-8 rounded-full object-cover border border-white/10" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                    <User size={14} className="text-nw-muted" />
                  </div>
                )}
                <span className="text-xs font-medium text-nw-text-secondary">
                  Shared by <span className="text-nw-text font-semibold">{sender?.username || 'a friend'}</span>
                </span>
              </div>

              {/* Album Art */}
              <div className="w-48 h-48 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 mb-6 border border-white/10 ring-1 ring-white/5">
                <AlbumArt src={track.coverUrl} alt={track.title} className="w-full h-full" />
              </div>

              {/* Track Info */}
              <div className="text-center w-full mb-8">
                <h3 className="text-xl font-bold text-white truncate px-2">{track.title}</h3>
                <p className="text-sm text-nw-text-tertiary mt-1 truncate px-2">{track.artist}</p>
              </div>

              {/* Actions */}
              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={() => onPlay(track)}
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-nw-accent hover:bg-nw-accent-hover text-white rounded-2xl font-semibold shadow-lg shadow-nw-accent/20 transition-all active:scale-[0.98]"
                >
                  <Play size={18} fill="currentColor" />
                  Play Now
                </button>
                <button
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-white/5 hover:bg-white/10 text-nw-text rounded-2xl font-medium transition-all active:scale-[0.98]"
                >
                  <X size={18} />
                  Nah, I'd pass
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
