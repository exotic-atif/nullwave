import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Key, User as UserIcon, ListMusic, History, Heart, Trash2, Loader2 } from 'lucide-react'
import { supabase, adminUpdateProfile, adminUpdateAuthCredentials, adminFetchUserLikedSongs, adminDeleteUserLikedSong, adminFetchUserHistory, adminDeleteUserHistoryItem, adminFetchUserPlaylists, adminDeletePlaylist } from '@/lib/supabase'
import { toast } from 'sonner'
import { ProfilePictureModal } from '@/components/ui/ProfilePictureModal'
import { uploadToCloudinary } from '@/lib/cloudinary'

type Tab = 'profile' | 'liked' | 'history' | 'playlists'

export function EditUserModal({ user, onClose, onUpdate }: { user: any, onClose: () => void, onUpdate: (u: any) => void }) {
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState({ ...user })
  const [newPassword, setNewPassword] = useState('')
  
  // States for other tabs
  const [likedSongs, setLikedSongs] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [playlists, setPlaylists] = useState<any[]>([])
  const [tabLoading, setTabLoading] = useState(false)

  const [isPfpModalOpen, setIsPfpModalOpen] = useState(false)

  useEffect(() => {
    if (activeTab === 'liked') loadLikedSongs()
    if (activeTab === 'history') loadHistory()
    if (activeTab === 'playlists') loadPlaylists()
  }, [activeTab])

  const loadLikedSongs = async () => {
    setTabLoading(true)
    try { setLikedSongs(await adminFetchUserLikedSongs(user.id)) } catch (e) {}
    setTabLoading(false)
  }

  const loadHistory = async () => {
    setTabLoading(true)
    try { setHistory(await adminFetchUserHistory(user.id)) } catch (e) {}
    setTabLoading(false)
  }

  const loadPlaylists = async () => {
    setTabLoading(true)
    try { setPlaylists(await adminFetchUserPlaylists(user.id)) } catch (e) {}
    setTabLoading(false)
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      // 1. Update public profile
      await adminUpdateProfile(user.id, {
        username: data.username,
        email: data.email,
        role: data.role,
        avatar_url: data.avatar_url
      })

      // 2. Update auth credentials if needed via worker
      if (newPassword || data.email !== user.email) {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) throw new Error('No admin session')
        await adminUpdateAuthCredentials(
          user.id,
          session.access_token,
          newPassword || undefined,
          data.email !== user.email ? data.email : undefined
        )
      }

      toast.success('User updated securely')
      onUpdate(data)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user')
    } finally {
      setLoading(false)
    }
  }

  const handleUploadPfp = async (file: File) => {
    const toastId = toast.loading('Uploading profile picture...')
    try {
      const url = await uploadToCloudinary(file, { folder: 'nullwave_avatars', public_id: user.id, overwrite: true })
      setData({ ...data, avatar_url: url })
      toast.success('Picture uploaded!', { id: toastId })
    } catch (err) {
      toast.error('Upload failed', { id: toastId })
    }
    setIsPfpModalOpen(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-nw-surface border border-white/[0.06] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
          <h2 className="text-lg font-bold text-nw-text">Manage: {user.username}</h2>
          <button onClick={onClose} className="p-2 text-nw-muted hover:text-nw-text transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-white/[0.06] overflow-x-auto hide-scrollbar">
          {(['profile', 'liked', 'history', 'playlists'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === t ? 'border-nw-accent text-nw-accent' : 'border-transparent text-nw-muted hover:text-nw-text'}`}
            >
              {t === 'profile' && <UserIcon size={16} />}
              {t === 'liked' && <Heart size={16} />}
              {t === 'history' && <History size={16} />}
              {t === 'playlists' && <ListMusic size={16} />}
              <span className="capitalize">{t}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-white/[0.04] border border-white/[0.08] overflow-hidden relative group">
                  {data.avatar_url ? (
                    <img src={data.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-nw-muted text-3xl font-bold">
                      {(data.username || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <button
                    onClick={() => setIsPfpModalOpen(true)}
                    className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-semibold"
                  >
                    Change
                  </button>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-nw-text">Profile Picture</h3>
                  <p className="text-xs text-nw-muted">Click to change avatar</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-nw-text-tertiary mb-1">Username</label>
                  <input
                    type="text"
                    value={data.username}
                    onChange={e => setData({...data, username: e.target.value})}
                    className="w-full px-3 py-2 bg-nw-surface/50 border border-white/[0.06] rounded-xl text-sm text-nw-text focus:outline-none focus:border-nw-accent/40"
                  />
                </div>
                <div>
                  <label className="block text-xs text-nw-text-tertiary mb-1">Email</label>
                  <input
                    type="email"
                    value={data.email}
                    onChange={e => setData({...data, email: e.target.value})}
                    className="w-full px-3 py-2 bg-nw-surface/50 border border-white/[0.06] rounded-xl text-sm text-nw-text focus:outline-none focus:border-nw-accent/40"
                  />
                </div>
                <div>
                  <label className="block text-xs text-nw-text-tertiary mb-1">Role / Badge</label>
                  <select
                    value={data.role || 'member'}
                    onChange={e => setData({...data, role: e.target.value})}
                    className="w-full px-3 py-2 bg-nw-surface/50 border border-white/[0.06] rounded-xl text-sm text-nw-text focus:outline-none focus:border-nw-accent/40"
                  >
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-nw-text-tertiary mb-1">Reset Password (Optional)</label>
                  <div className="relative">
                    <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-nw-muted" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Leave blank to keep current"
                      className="w-full pl-9 pr-3 py-2 bg-nw-surface/50 border border-white/[0.06] rounded-xl text-sm text-nw-text focus:outline-none focus:border-nw-accent/40"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="w-full py-3 bg-nw-accent text-white rounded-xl text-sm font-bold hover:bg-nw-accent-hover transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          )}

          {activeTab === 'liked' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-nw-text">Liked Songs</h3>
              {tabLoading ? <div className="text-center p-4"><Loader2 className="animate-spin mx-auto text-nw-muted" /></div> :
               likedSongs.length === 0 ? <p className="text-sm text-nw-muted">No liked songs.</p> :
               <div className="space-y-2">
                 {likedSongs.map(l => (
                   <div key={l.id} className="flex items-center justify-between p-2 hover:bg-white/[0.02] rounded-lg">
                     <div className="flex items-center gap-3 overflow-hidden">
                       <img src={l.track_data.coverUrl} className="w-10 h-10 rounded-md" />
                       <div className="truncate">
                         <p className="text-sm text-nw-text truncate">{l.track_data.title}</p>
                         <p className="text-xs text-nw-muted truncate">{l.track_data.artist}</p>
                       </div>
                     </div>
                     <button onClick={async () => {
                       if (!window.confirm('Delete this liked song?')) return
                       await adminDeleteUserLikedSong(l.id)
                       setLikedSongs(prev => prev.filter(x => x.id !== l.id))
                     }} className="p-2 text-red-400/60 hover:text-red-400 bg-red-400/5 rounded-lg"><Trash2 size={14}/></button>
                   </div>
                 ))}
               </div>}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-nw-text">Play History (Recent 100)</h3>
              {tabLoading ? <div className="text-center p-4"><Loader2 className="animate-spin mx-auto text-nw-muted" /></div> :
               history.length === 0 ? <p className="text-sm text-nw-muted">No play history.</p> :
               <div className="space-y-2">
                 {history.map(l => (
                   <div key={l.id} className="flex items-center justify-between p-2 hover:bg-white/[0.02] rounded-lg">
                     <div className="flex items-center gap-3 overflow-hidden">
                       <img src={l.track_data.coverUrl} className="w-10 h-10 rounded-md" />
                       <div className="truncate">
                         <p className="text-sm text-nw-text truncate">{l.track_data.title}</p>
                         <p className="text-xs text-nw-muted truncate">{l.track_data.artist}</p>
                       </div>
                     </div>
                     <button onClick={async () => {
                       if (!window.confirm('Delete this history item?')) return
                       await adminDeleteUserHistoryItem(l.id)
                       setHistory(prev => prev.filter(x => x.id !== l.id))
                     }} className="p-2 text-red-400/60 hover:text-red-400 bg-red-400/5 rounded-lg"><Trash2 size={14}/></button>
                   </div>
                 ))}
               </div>}
            </div>
          )}

          {activeTab === 'playlists' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-nw-text">Playlists</h3>
              {tabLoading ? <div className="text-center p-4"><Loader2 className="animate-spin mx-auto text-nw-muted" /></div> :
               playlists.length === 0 ? <p className="text-sm text-nw-muted">No playlists.</p> :
               <div className="grid grid-cols-2 gap-3">
                 {playlists.map(p => (
                   <div key={p.id} className="p-3 border border-white/[0.06] bg-white/[0.02] rounded-xl flex items-center justify-between">
                     <div className="flex items-center gap-3 overflow-hidden">
                       <div className="w-10 h-10 rounded-md bg-white/[0.05] flex items-center justify-center"><ListMusic size={16} className="text-nw-muted"/></div>
                       <p className="text-sm text-nw-text truncate font-bold">{p.name}</p>
                     </div>
                     <button onClick={async () => {
                       if (!window.confirm('Delete this playlist?')) return
                       await adminDeletePlaylist(p.id)
                       setPlaylists(prev => prev.filter(x => x.id !== p.id))
                     }} className="p-2 text-red-400/60 hover:text-red-400 bg-red-400/5 rounded-lg"><Trash2 size={14}/></button>
                   </div>
                 ))}
               </div>}
            </div>
          )}

        </div>
      </motion.div>
      <ProfilePictureModal
        isOpen={isPfpModalOpen}
        onClose={() => setIsPfpModalOpen(false)}
        onUpload={handleUploadPfp}
        onDelete={async () => {
          setData({ ...data, avatar_url: null })
          setIsPfpModalOpen(false)
        }}
        currentAvatar={data.avatar_url}
      />
    </div>
  )
}
