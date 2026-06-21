import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { User, Camera, KeyRound, Loader2 } from 'lucide-react'
import { updateProfileName, updateProfileAvatar } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import { RoleBadge } from '@/components/ui/RoleBadge'
import { useAuthStore } from '@/store'

export function YouPage() {
  const { user, setUser } = useAuthStore()

  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [isSavingName, setIsSavingName] = useState(false)
  const [nameSuccess, setNameSuccess] = useState(false)

  const [isUploadingPfp, setIsUploadingPfp] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleUploadPfp = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    setIsUploadingPfp(true)
    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'mian-storage'
      const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY
      
      if (!apiKey) {
        throw new Error('Missing VITE_CLOUDINARY_API_KEY in .env')
      }

      // 1. Get Signature from our Cloudflare Worker Backend
      const folder = 'nullwave_pfps'
      const workerUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787'

      const signRes = await fetch(`${workerUrl}/sign-upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder }) // We only need to sign the folder param
      })

      if (!signRes.ok) throw new Error('Failed to get signature from backend')
      const { signature, timestamp: backendTimestamp } = await signRes.json()

      // 2. Upload directly to Cloudinary
      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', apiKey)
      formData.append('timestamp', backendTimestamp)
      formData.append('signature', signature)
      formData.append('folder', folder)

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
      if (fileInputRef.current) fileInputRef.current.value = ''
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
        <div className="relative group">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleUploadPfp} 
            disabled={isUploadingPfp}
          />
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-nw-accent/30 to-nw-accent-glow/20 flex items-center justify-center ring-4 ring-nw-surface overflow-hidden shadow-xl">
            {isUploadingPfp ? (
              <Loader2 size={32} className="text-nw-accent animate-spin" />
            ) : user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
            ) : (
              <User size={40} className="text-nw-accent" />
            )}
          </div>
          {/* Overlay indicating change feature */}
          <button 
            onClick={() => !isUploadingPfp && fileInputRef.current?.click()}
            disabled={isUploadingPfp}
            className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer focus:outline-none"
          >
            <Camera size={20} className="text-white mb-1" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-white">Change</span>
          </button>
        </div>

        <div className="flex-1 mt-2">
          <h2 className="text-xl font-bold text-nw-text">{user.displayName}</h2>
          <p className="text-sm text-nw-text-tertiary">{user.email}</p>
          <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-3">
            <RoleBadge role={user.role} />
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
    </div>
  )
}
