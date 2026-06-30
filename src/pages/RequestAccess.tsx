import { useState } from 'react'
import { motion } from 'framer-motion'
import { Radio, Loader2, Upload, CheckCircle2, User, ArrowRight, AtSign } from 'lucide-react'
import { submitAccessRequest, supabase } from '@/lib/supabase'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { Link } from 'react-router-dom'
import { ProfilePictureModal } from '@/components/ui/ProfilePictureModal'

export function RequestAccessPage() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [favArtists, setFavArtists] = useState('')
  const [favSongs, setFavSongs] = useState('')
  const [instagramId, setInstagramId] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [isPfpModalOpen, setIsPfpModalOpen] = useState(false)

  const handleUploadPfp = async (file: File) => {
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = () => setAvatarPreview(reader.result as string)
    reader.readAsDataURL(file)
    setIsPfpModalOpen(false)
  }

  const handleDeletePfp = async () => {
    setAvatarFile(null)
    setAvatarPreview(null)
    setIsPfpModalOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!displayName.trim()) { setError('Display name is required'); return }
    if (!email.trim() || !email.includes('@')) { setError('A valid email is required'); return }

    setIsSubmitting(true)
    try {
      const normalizedEmail = email.trim().toLowerCase()
      const { data: checkResult, error: rpcError } = await supabase
        .rpc('check_email_available', { check_email: normalizedEmail })

      if (!rpcError && checkResult && !checkResult.available) {
        if (checkResult.reason === 'already_registered') {
          setError('This email is already registered. Try signing in instead.')
        } else {
          setError('You\'ve already submitted a request with this email. Hang tight!')
        }
        setIsSubmitting(false)
        return
      }

      let uploadedUrl = null
      if (avatarFile) {
        try {
          const uniqueId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
          uploadedUrl = await uploadToCloudinary(avatarFile, {
            folder: 'nullwave_requests',
            public_id: uniqueId,
            overwrite: false,
          })
        } catch (err) {
          console.error('Failed to upload avatar:', err)
        }
      }

      await submitAccessRequest({
        display_name: displayName.trim(),
        email: normalizedEmail,
        avatar_url: uploadedUrl || undefined,
        fav_artists: favArtists.trim() || undefined,
        fav_songs: favSongs.trim() || undefined,
        instagram_id: instagramId.trim() || undefined
      })

      setIsSubmitted(true)
    } catch (err: any) {
      if (err.message?.includes('duplicate') || err.message?.includes('unique')) {
        setError('You\'ve already submitted a request with this email.')
      } else {
        setError(err.message || 'Something went wrong. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-nw-black relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-green-500/[0.06] blur-[120px]" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-nw-accent/[0.04] blur-[100px]" />
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 text-center max-w-md mx-4 px-8 py-12">
          <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', delay: 0.2, damping: 15 }} className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center">
            <CheckCircle2 size={40} className="text-green-400" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-3xl font-display font-bold text-nw-text mb-3">You're on the list!</motion.h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-nw-text-secondary text-sm leading-relaxed mb-2">Thanks for your interest in <span className="text-nw-accent font-semibold">Nullwave</span>, {displayName}!</motion.p>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="text-nw-text-tertiary text-xs leading-relaxed mb-8">We'll email <span className="text-nw-text-secondary">{email}</span> when access is granted.</motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
            <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/[0.04] border border-white/[0.1] text-sm text-nw-text hover:bg-white/[0.08] transition-all group">
              Return to Login <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center py-12 px-4 bg-nw-black relative overflow-x-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-nw-accent/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/3" />
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 w-full max-w-lg mt-auto mb-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-nw-accent to-purple-600 p-0.5 mb-6 shadow-2xl shadow-nw-accent/30">
            <div className="w-full h-full bg-nw-black rounded-[22px] flex items-center justify-center">
              <Radio size={28} className="text-transparent bg-clip-text bg-gradient-to-br from-nw-accent to-purple-400" style={{ stroke: 'url(#gradient)' }} />
              <svg width="0" height="0">
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop stopColor="#38bdf8" offset="0%" />
                  <stop stopColor="#a855f7" offset="100%" />
                </linearGradient>
              </svg>
            </div>
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-white mb-2">Join Nullwave</h1>
          <p className="text-sm text-nw-muted text-center max-w-sm">Request early access to the next generation of music streaming.</p>
        </div>

        <div className="p-[1px] rounded-3xl bg-gradient-to-b from-white/[0.12] to-white/[0.02] shadow-2xl shadow-black/50">
          <form onSubmit={handleSubmit} className="bg-nw-surface/60 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 flex flex-col gap-6">
            <div className="flex flex-col items-center mb-2">
              <div className="relative group cursor-pointer" onClick={() => setIsPfpModalOpen(true)}>
                <div className="w-24 h-24 rounded-full overflow-hidden bg-white/[0.04] border-2 border-white/[0.1] group-hover:border-nw-accent/50 transition-all duration-300 relative shadow-inner flex items-center justify-center">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User size={32} className="text-nw-muted group-hover:text-nw-text transition-colors" />
                  )}
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload size={20} className="text-white mb-1" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">Upload</span>
                  </div>
                </div>
                {avatarPreview && (
                  <button type="button" onClick={(e) => { e.stopPropagation(); handleDeletePfp(); }} className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 shadow-lg">
                    <Upload size={14} className="rotate-45" />
                  </button>
                )}
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-sm text-red-400 text-center">
                {error}
              </motion.div>
            )}

            <div className="grid gap-4">
              <div className="relative group">
                <input type="text" required value={displayName} onChange={e => setDisplayName(e.target.value)} id="name" className="peer w-full bg-black/20 border border-white/[0.08] rounded-2xl px-4 pt-6 pb-2 text-white text-sm focus:outline-none focus:border-nw-accent/50 focus:bg-nw-accent/5 transition-all" placeholder=" " />
                <label htmlFor="name" className="absolute left-4 top-4 text-xs text-nw-muted transition-all peer-focus:-translate-y-2 peer-focus:text-[10px] peer-focus:text-nw-accent peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:text-[10px]">Display Name</label>
              </div>

              <div className="relative group">
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} id="email" className="peer w-full bg-black/20 border border-white/[0.08] rounded-2xl px-4 pt-6 pb-2 text-white text-sm focus:outline-none focus:border-nw-accent/50 focus:bg-nw-accent/5 transition-all" placeholder=" " />
                <label htmlFor="email" className="absolute left-4 top-4 text-xs text-nw-muted transition-all peer-focus:-translate-y-2 peer-focus:text-[10px] peer-focus:text-nw-accent peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:text-[10px]">Email Address</label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative group">
                  <input type="text" value={favArtists} onChange={e => setFavArtists(e.target.value)} id="artists" className="peer w-full bg-black/20 border border-white/[0.08] rounded-2xl px-4 pt-6 pb-2 text-white text-sm focus:outline-none focus:border-nw-accent/50 focus:bg-nw-accent/5 transition-all" placeholder=" " />
                  <label htmlFor="artists" className="absolute left-4 top-4 text-xs text-nw-muted transition-all peer-focus:-translate-y-2 peer-focus:text-[10px] peer-focus:text-nw-accent peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:text-[10px]">Favorite Artists</label>
                </div>
                <div className="relative group">
                  <input type="text" value={favSongs} onChange={e => setFavSongs(e.target.value)} id="songs" className="peer w-full bg-black/20 border border-white/[0.08] rounded-2xl px-4 pt-6 pb-2 text-white text-sm focus:outline-none focus:border-nw-accent/50 focus:bg-nw-accent/5 transition-all" placeholder=" " />
                  <label htmlFor="songs" className="absolute left-4 top-4 text-xs text-nw-muted transition-all peer-focus:-translate-y-2 peer-focus:text-[10px] peer-focus:text-nw-accent peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:text-[10px]">Favorite Songs</label>
                </div>
              </div>

              <div className="relative group">
                <input type="text" value={instagramId} onChange={e => setInstagramId(e.target.value)} id="ig" className="peer w-full bg-black/20 border border-white/[0.08] rounded-2xl px-4 pt-6 pb-2 text-white text-sm focus:outline-none focus:border-nw-accent/50 focus:bg-nw-accent/5 transition-all" placeholder=" " />
                <label htmlFor="ig" className="absolute left-4 top-4 text-xs text-nw-muted transition-all peer-focus:-translate-y-2 peer-focus:text-[10px] peer-focus:text-nw-accent peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:text-[10px]">Instagram ID (Optional)</label>
                <AtSign size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-nw-muted/50" />
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full py-4 mt-2 bg-gradient-to-r from-nw-accent to-purple-600 hover:from-nw-accent-hover hover:to-purple-500 text-white font-bold rounded-2xl transition-all shadow-[0_0_30px_rgba(56,189,248,0.3)] hover:shadow-[0_0_40px_rgba(56,189,248,0.5)] flex items-center justify-center gap-2 group">
              {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Submitting...</> : <>Request Access <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
            </button>
          </form>
        </div>

        <div className="text-center mt-8">
          <Link to="/login" className="text-sm text-nw-text-tertiary hover:text-white transition-colors">Already have an account? Sign in</Link>
        </div>
      </motion.div>

      <ProfilePictureModal
        isOpen={isPfpModalOpen}
        onClose={() => setIsPfpModalOpen(false)}
        onUpload={handleUploadPfp}
        onDelete={handleDeletePfp}
        currentAvatar={avatarPreview}
      />
    </div>
  )
}
