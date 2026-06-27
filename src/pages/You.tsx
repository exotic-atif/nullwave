import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Camera, KeyRound, Loader2, Palette, Moon, Sun, Volume2, Info, Laptop, Smartphone, LogOut, Heart } from 'lucide-react'
import { updateProfileName, updateProfileAvatar, updateProfileFavs } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import { RoleBadge } from '@/components/ui/RoleBadge'
import { ProfilePictureModal } from '@/components/ui/ProfilePictureModal'
import { useAuthStore, useThemeStore } from '@/store'
import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'

export function YouPage() {
  const { user, setUser, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [isSavingName, setIsSavingName] = useState(false)
  const [nameSuccess, setNameSuccess] = useState(false)

  const [favSongs, setFavSongs] = useState(user?.favSongs || '')
  const [favArtists, setFavArtists] = useState(user?.favArtists || '')
  const [isSavingTaste, setIsSavingTaste] = useState(false)
  const [tasteSuccess, setTasteSuccess] = useState(false)

  const [isUploadingPfp, setIsUploadingPfp] = useState(false)
  const [isPfpModalOpen, setIsPfpModalOpen] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' })

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-nw-text-tertiary">Please log in to view your profile.</p>
      </div>
    )
  }

  const handleUploadPfp = async (file: File) => {
    setIsUploadingPfp(true)
    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'mian-storage'
      const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY
      
      if (!apiKey) {
        throw new Error('Missing VITE_CLOUDINARY_API_KEY in .env')
      }

      // 1. Get Signature from our Cloudflare Worker Backend
      const folder = 'nullwave_pfps'
      const public_id = user.id
      const workerUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787'

      const signRes = await fetch(`${workerUrl}/sign-upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder, public_id, overwrite: 'true', invalidate: 'true' }) 
      })

      if (!signRes.ok) throw new Error('Failed to get signature from backend')
      const { signature, timestamp: backendTimestamp } = await signRes.json()

      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', apiKey)
      formData.append('timestamp', backendTimestamp)
      formData.append('signature', signature)
      formData.append('folder', folder)
      formData.append('public_id', public_id)
      formData.append('overwrite', 'true')
      formData.append('invalidate', 'true')

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      })

      if (!uploadRes.ok) throw new Error('Failed to upload to Cloudinary')
      const uploadData = await uploadRes.json()
      
      const imageUrl = uploadData.secure_url

      // 3. Save URL to Supabase auth metadata
      const { error } = await supabase.auth.updateUser({
        data: { avatar_url: imageUrl }
      })

      if (error) throw error

      // 4. Save URL to Supabase 'users' table so it persists on reload
      await updateProfileAvatar(user.id, imageUrl)

      setUser({ ...user, avatarUrl: imageUrl })

    } catch (err: any) {
      console.error('PFP Upload error:', err)
      alert(err.message || 'Failed to upload profile picture')
    } finally {
      setIsUploadingPfp(false)
    }
  }

  const handleDeletePfp = async () => {
    setIsUploadingPfp(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: { avatar_url: null }
      })
      if (error) throw error

      await updateProfileAvatar(user.id, '')
      setUser({ ...user, avatarUrl: undefined })
    } catch (err: any) {
      console.error('Delete PFP error:', err)
      alert(err.message || 'Failed to remove profile picture')
    } finally {
      setIsUploadingPfp(false)
    }
  }

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!displayName.trim() || displayName === user.displayName) return

    setIsSavingName(true)
    setNameSuccess(false)
    try {
      await updateProfileName(user.id, displayName.trim())
      setUser({ ...user, displayName: displayName.trim() })
      setNameSuccess(true)
      setTimeout(() => setNameSuccess(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSavingName(false)
    }
  }

  const handleUpdateTaste = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingTaste(true)
    setTasteSuccess(false)
    try {
      await updateProfileFavs(user.id, favSongs.trim(), favArtists.trim())
      setUser({ ...user, favSongs: favSongs.trim(), favArtists: favArtists.trim() })
      setTasteSuccess(true)
      setTimeout(() => setTasteSuccess(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSavingTaste(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Please fill out all password fields.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' })
      return
    }

    setIsSavingPassword(true)
    setPasswordMessage({ type: '', text: '' })

    try {
      // Re-authenticate to verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      })

      if (signInError) {
        throw new Error('Incorrect current password.')
      }

      // Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) {
        throw updateError
      }

      setPasswordMessage({ type: 'success', text: 'Password updated successfully!' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordMessage({ type: '', text: '' }), 4000)
    } catch (err: any) {
      setPasswordMessage({ type: 'error', text: err.message || 'Failed to update password.' })
    } finally {
      setIsSavingPassword(false)
    }
  }

  return (
    <div className="px-4 md:px-8 py-6 max-w-2xl mx-auto space-y-8 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl md:text-3xl font-display font-bold text-nw-text tracking-tight">
          You
        </h1>
        <p className="text-sm text-nw-text-tertiary mt-1">Manage your NullWave profile</p>
      </motion.div>

      {/* Profile Header */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="p-6 rounded-3xl bg-nw-surface/40 border border-nw-border-subtle flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left"
      >
        <div className="relative group rounded-full overflow-hidden w-28 h-28 sm:w-32 sm:h-32 shadow-2xl bg-nw-surface flex-shrink-0 border-4 border-nw-surface/50">
          {isUploadingPfp ? (
            <div className="w-full h-full flex items-center justify-center">
              <Loader2 size={32} className="text-nw-accent animate-spin" />
            </div>
          ) : user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User size={48} className="text-nw-text-tertiary" />
            </div>
          )}

          <button 
            onClick={() => !isUploadingPfp && setIsPfpModalOpen(true)}
            disabled={isUploadingPfp}
            className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer focus:outline-none"
          >
            <Camera size={24} className="text-white mb-1" />
            <span className="text-[10px] font-bold tracking-wider text-white uppercase bg-black/40 px-2 py-0.5 rounded-full">
              Edit
            </span>
          </button>
        </div>

        <ProfilePictureModal
          isOpen={isPfpModalOpen}
          onClose={() => setIsPfpModalOpen(false)}
          currentAvatar={user.avatarUrl || null}
          onUpload={handleUploadPfp}
          onDelete={handleDeletePfp}
        />

        <div className="flex-1 mt-2">
          <h2 className="text-xl font-bold text-nw-text">{user.displayName}</h2>
          <p className="text-sm text-nw-text-tertiary">{user.email}</p>
          <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-3">
            <RoleBadge role={user.role} />
            <div className="flex items-center justify-center p-1 rounded-md bg-white/5 text-nw-text-tertiary">
              <span className="hidden md:block"><Laptop size={14} /></span>
              <span className="block md:hidden"><Smartphone size={14} /></span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Display Name Settings */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <h3 className="text-sm font-semibold text-nw-text uppercase tracking-wider flex items-center gap-2">
          <User size={16} className="text-nw-text-tertiary" />
          Profile Details
        </h3>
        <form onSubmit={handleUpdateName} className="p-5 rounded-3xl bg-nw-surface/40 border border-nw-border-subtle space-y-4">
          <div>
            <label className="block text-xs font-medium text-nw-text-secondary mb-1.5 ml-1">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2.5 bg-nw-elevated/50 border border-nw-border-subtle rounded-xl text-sm text-nw-text focus:outline-none focus:border-nw-accent/50 transition-colors"
            />
          </div>
          <div className="flex items-center justify-end gap-3">
            {nameSuccess && <span className="text-xs text-nw-success">Updated successfully!</span>}
            <button
              type="submit"
              disabled={isSavingName || displayName === user.displayName || !displayName.trim()}
              className="px-5 py-2 bg-nw-text text-nw-black text-sm font-semibold rounded-xl hover:bg-nw-text/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSavingName ? 'Saving...' : 'Save Name'}
            </button>
          </div>
        </form>
      </motion.section>

      {/* Music Taste Settings */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="space-y-4"
      >
        <h3 className="text-sm font-semibold text-nw-text uppercase tracking-wider flex items-center gap-2">
          <Heart size={16} className="text-nw-text-tertiary" />
          Music Taste
        </h3>
        <form onSubmit={handleUpdateTaste} className="p-5 rounded-3xl bg-nw-surface/40 border border-nw-border-subtle space-y-4">
          <div>
            <label className="block text-xs font-medium text-nw-text-secondary mb-1.5 ml-1">
              Favorite Artists (Comma Separated)
            </label>
            <input
              type="text"
              value={favArtists}
              onChange={(e) => setFavArtists(e.target.value)}
              placeholder="e.g. The Weeknd, Chase Atlantic, Travis Scott"
              className="w-full px-4 py-2.5 bg-nw-elevated/50 border border-nw-border-subtle rounded-xl text-sm text-nw-text focus:outline-none focus:border-nw-accent/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-nw-text-secondary mb-1.5 ml-1">
              Favorite Songs (Comma Separated)
            </label>
            <input
              type="text"
              value={favSongs}
              onChange={(e) => setFavSongs(e.target.value)}
              placeholder="e.g. Starboy, Swim, goosebumps"
              className="w-full px-4 py-2.5 bg-nw-elevated/50 border border-nw-border-subtle rounded-xl text-sm text-nw-text focus:outline-none focus:border-nw-accent/50 transition-colors"
            />
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs">
              {tasteSuccess && <span className="text-nw-success">Updated successfully!</span>}
            </div>
            <button
              type="submit"
              disabled={isSavingTaste || (favSongs === (user.favSongs || '') && favArtists === (user.favArtists || ''))}
              className="px-5 py-2 bg-nw-text text-nw-black text-sm font-semibold rounded-xl hover:bg-nw-text/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSavingTaste ? 'Saving...' : 'Save Taste'}
            </button>
          </div>
        </form>
      </motion.section>

      {/* Password Settings */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-4"
      >
        <h3 className="text-sm font-semibold text-nw-text uppercase tracking-wider flex items-center gap-2">
          <KeyRound size={16} className="text-nw-text-tertiary" />
          Security
        </h3>
        <form onSubmit={handleUpdatePassword} className="p-5 rounded-3xl bg-nw-surface/40 border border-nw-border-subtle space-y-4">
          <div>
            <label className="block text-xs font-medium text-nw-text-secondary mb-1.5 ml-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full px-4 py-2.5 bg-nw-elevated/50 border border-nw-border-subtle rounded-xl text-sm text-nw-text focus:outline-none focus:border-nw-accent/50 transition-colors"
              placeholder="••••••••"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-nw-text-secondary mb-1.5 ml-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full px-4 py-2.5 bg-nw-elevated/50 border border-nw-border-subtle rounded-xl text-sm text-nw-text focus:outline-none focus:border-nw-accent/50 transition-colors"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-nw-text-secondary mb-1.5 ml-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full px-4 py-2.5 bg-nw-elevated/50 border border-nw-border-subtle rounded-xl text-sm text-nw-text focus:outline-none focus:border-nw-accent/50 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs">
              {passwordMessage.text && (
                <span className={passwordMessage.type === 'error' ? 'text-nw-danger' : 'text-nw-success'}>
                  {passwordMessage.text}
                </span>
              )}
            </div>
            <button
              type="submit"
              disabled={isSavingPassword || !currentPassword || !newPassword || !confirmPassword}
              className="px-5 py-2 bg-nw-accent text-white text-sm font-semibold rounded-xl hover:bg-nw-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSavingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </motion.section>
      {/* Appearance Settings */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h3 className="text-sm font-semibold text-nw-text uppercase tracking-wider flex items-center gap-2">
          <Palette size={16} className="text-nw-text-tertiary" />
          Appearance
        </h3>

        <div className="p-4 rounded-3xl bg-nw-surface/40 border border-nw-border-subtle">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-nw-text">Theme</p>
              <p className="text-xs text-nw-text-tertiary mt-0.5">
                Currently using {theme} mode
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className={cn(
                'relative w-14 h-7 rounded-full transition-colors duration-300 cursor-pointer',
                theme === 'dark' ? 'bg-nw-accent/20' : 'bg-nw-accent'
              )}
            >
              <motion.div
                layout
                className={cn(
                  'absolute top-0.5 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-md',
                  theme === 'dark' ? 'left-0.5' : 'left-[calc(100%-1.625rem)]'
                )}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                {theme === 'dark' ? (
                  <Moon size={13} className="text-nw-accent" />
                ) : (
                  <Sun size={13} className="text-amber-500" />
                )}
              </motion.div>
            </button>
          </div>
        </div>
      </motion.section>

      {/* Playback Settings */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="space-y-4"
      >
        <h3 className="text-sm font-semibold text-nw-text uppercase tracking-wider flex items-center gap-2">
          <Volume2 size={16} className="text-nw-text-tertiary" />
          Playback
        </h3>

        <div className="space-y-2">
          <SettingRow
            label="Crossfade"
            description="Smooth transitions between tracks"
            trailing={
              <span className="text-xs text-nw-text-tertiary bg-nw-surface px-2 py-1 rounded-md">
                Coming soon
              </span>
            }
          />
          <SettingRow
            label="Audio Quality"
            description="Set streaming quality"
            trailing={
              <span className="text-xs text-nw-accent bg-nw-accent-dim px-2 py-1 rounded-md">
                High (320kbps)
              </span>
            }
          />
        </div>
      </motion.section>

      {/* About & Logout */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <h3 className="text-sm font-semibold text-nw-text uppercase tracking-wider flex items-center gap-2">
          <Info size={16} className="text-nw-text-tertiary" />
          About
        </h3>

        <div className="p-4 rounded-3xl bg-nw-surface/40 border border-nw-border-subtle space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-nw-text-secondary text-sm">Version</span>
            <span className="text-nw-text font-medium text-sm">Beta 1.2.7</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <span className="text-nw-text-secondary text-sm">Access</span>
            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-nw-accent/20 text-nw-accent">
              Invite Only
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-nw-text-secondary text-sm">Build</span>
            <span className="text-nw-text tabular-nums text-sm">2026.06.22</span>
          </div>
        </div>
        
        <button
          onClick={async () => {
            await logout()
            navigate('/login')
          }}
          className="flex items-center justify-center gap-2 px-4 py-3 mt-6 text-sm text-nw-danger hover:text-nw-danger hover:bg-nw-danger/10 bg-nw-danger/5 font-semibold rounded-xl transition-all duration-200 w-full border border-nw-danger/20"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </motion.section>
    </div>
  )
}

function SettingRow({
  label,
  description,
  trailing,
}: {
  label: string
  description: string
  trailing: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-3xl bg-nw-surface/40 border border-nw-border-subtle">
      <div>
        <p className="text-sm font-medium text-nw-text">{label}</p>
        <p className="text-xs text-nw-text-tertiary mt-0.5">{description}</p>
      </div>
      {trailing}
    </div>
  )
}
