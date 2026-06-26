import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Radio, Loader2, Upload, CheckCircle2, Sparkles, Music, User, Mail, Heart, X } from 'lucide-react'
import { submitAccessRequest, supabase } from '@/lib/supabase'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { Link } from 'react-router-dom'
import { ProfilePictureModal } from '@/components/ui/ProfilePictureModal'

export function RequestAccessPage() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [favArtists, setFavArtists] = useState('')
  const [favSongs, setFavSongs] = useState('')
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
      // Check if email is already registered or already requested
      const normalizedEmail = email.trim().toLowerCase()

      // Secure backend check via RPC (Bypasses RLS safely)
      const { data: checkResult, error: rpcError } = await supabase
        .rpc('check_email_available', { check_email: normalizedEmail })

      if (rpcError) {
        console.warn('Email check RPC failed:', rpcError.message)
        // If RPC is missing, we rely on the unique constraint fallback in the catch block
      } else if (checkResult && !checkResult.available) {
        if (checkResult.reason === 'already_registered') {
          setError('This email is already registered. Try signing in instead.')
        } else {
          setError('You\'ve already submitted a request with this email. Hang tight!')
        }
        setIsSubmitting(false)
        return
      }

      let avatarUrl: string | undefined

      // Upload avatar to Cloudinary if provided
      if (avatarFile) {
        const uniqueId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
        avatarUrl = await uploadToCloudinary(avatarFile, {
          folder: 'nullwave_requests',
          public_id: uniqueId,
          overwrite: false,
        })
      }

      await submitAccessRequest({
        display_name: displayName.trim(),
        email: email.trim().toLowerCase(),
        avatar_url: avatarUrl,
        fav_artists: favArtists.trim() || undefined,
        fav_songs: favSongs.trim() || undefined,
      })

      setIsSubmitted(true)
    } catch (err: any) {
      // Handle unique constraint violation as fallback
      if (err.message?.includes('duplicate') || err.message?.includes('unique')) {
        setError('You\'ve already submitted a request with this email. Hang tight!')
      } else {
        setError(err.message || 'Something went wrong. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // ===== Success Screen =====
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-nw-black relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-green-500/[0.06] blur-[120px]" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-nw-accent/[0.04] blur-[100px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative z-10 text-center max-w-md mx-4 px-8 py-12"
        >
          {/* Animated checkmark */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', delay: 0.2, damping: 15 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center"
          >
            <CheckCircle2 size={40} className="text-green-400" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-display font-bold text-nw-text mb-3"
          >
            You're on the list!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-nw-text-secondary text-sm leading-relaxed mb-2"
          >
            Thanks for your interest in <span className="text-nw-accent font-semibold">Nullwave</span>, {displayName}!
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-nw-text-tertiary text-xs leading-relaxed mb-8"
          >
            We're currently in invite-only mode. You'll receive an email at <span className="text-nw-text-secondary">{email}</span> once your access is approved. Hang tight — it won't be long.
          </motion.p>

          {/* Floating particles */}
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-nw-accent/40"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 1, 0],
                y: [0, -80 - Math.random() * 60],
                x: [0, (Math.random() - 0.5) * 100],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                delay: 0.8 + i * 0.3,
                repeat: Infinity,
                repeatDelay: Math.random() * 3,
              }}
              style={{
                left: `${20 + Math.random() * 60}%`,
                bottom: '30%',
              }}
            />
          ))}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Link
              to="/login"
              className="text-xs text-nw-accent hover:text-nw-accent-hover transition-colors"
            >
              Already have access? Sign in →
            </Link>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  // ===== Form Screen =====
  return (
    <div className="min-h-screen flex items-center justify-center bg-nw-black relative overflow-hidden py-12 px-4">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-nw-accent/[0.04] blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-nw-accent-glow/[0.03] blur-[80px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-nw-accent/[0.02] blur-[120px]" />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(56,189,248,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-lg"
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-nw-accent to-nw-accent-glow flex items-center justify-center shadow-2xl shadow-nw-accent-glow/20 mb-4">
            <Radio size={24} className="text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-nw-text">
            Join Nullwave
          </h1>
          <p className="text-xs text-nw-muted mt-1.5 uppercase tracking-[0.25em]">
            Request Early Access
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center mb-2">
            <button
              type="button"
              onClick={() => setIsPfpModalOpen(true)}
              className="group relative w-24 h-24 rounded-full overflow-hidden bg-nw-surface/50 border-2 border-dashed border-white/10 hover:border-nw-accent/40 transition-all duration-300"
            >
              {avatarPreview ? (
                <>
                  <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Upload size={20} className="text-white" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-nw-text-tertiary group-hover:text-nw-accent transition-colors">
                  <User size={24} className="mb-1" />
                  <span className="text-[10px] uppercase tracking-wider font-semibold">Photo</span>
                </div>
              )}
            </button>
            {avatarFile && (
              <button
                type="button"
                onClick={handleDeletePfp}
                className="mt-2 text-[10px] text-nw-text-tertiary hover:text-nw-danger transition-colors flex items-center gap-1"
              >
                <X size={10} /> Remove
              </button>
            )}
          </div>

          <ProfilePictureModal
            isOpen={isPfpModalOpen}
            onClose={() => setIsPfpModalOpen(false)}
            currentAvatar={avatarPreview}
            onUpload={handleUploadPfp}
            onDelete={handleDeletePfp}
          />

          {/* Display Name */}
          <div>
            <label className="flex items-center gap-1.5 text-xs text-nw-text-tertiary mb-1.5 ml-1">
              <User size={12} /> Display Name <span className="text-nw-danger">*</span>
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="What should we call you?"
              className="w-full px-4 py-3 bg-nw-surface/50 border border-nw-border-subtle rounded-xl text-sm text-nw-text placeholder:text-nw-muted focus:outline-none focus:border-nw-accent/40 focus:ring-1 focus:ring-nw-accent-ring transition-all duration-200"
              disabled={isSubmitting}
              maxLength={50}
            />
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center gap-1.5 text-xs text-nw-text-tertiary mb-1.5 ml-1">
              <Mail size={12} /> Email <span className="text-nw-danger">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-nw-surface/50 border border-nw-border-subtle rounded-xl text-sm text-nw-text placeholder:text-nw-muted focus:outline-none focus:border-nw-accent/40 focus:ring-1 focus:ring-nw-accent-ring transition-all duration-200"
              disabled={isSubmitting}
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
              placeholder="e.g. The Weeknd, Arijit Singh, Dua Lipa"
              className="w-full px-4 py-3 bg-nw-surface/50 border border-nw-border-subtle rounded-xl text-sm text-nw-text placeholder:text-nw-muted focus:outline-none focus:border-nw-accent/40 focus:ring-1 focus:ring-nw-accent-ring transition-all duration-200"
              disabled={isSubmitting}
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
              placeholder="e.g. Blinding Lights, Tum Hi Ho, Levitating"
              className="w-full px-4 py-3 bg-nw-surface/50 border border-nw-border-subtle rounded-xl text-sm text-nw-text placeholder:text-nw-muted focus:outline-none focus:border-nw-accent/40 focus:ring-1 focus:ring-nw-accent-ring transition-all duration-200"
              disabled={isSubmitting}
            />
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-nw-danger pl-1"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-nw-accent text-white text-sm font-semibold rounded-xl hover:bg-nw-accent-hover disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 glow-accent flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Heart size={16} />
                Request Access
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6 space-y-2">
          <Link
            to="/login"
            className="text-xs text-nw-accent hover:text-nw-accent-hover transition-colors"
          >
            Already have access? Sign in →
          </Link>
          <p className="text-[10px] text-nw-muted/40">
            Your data is stored securely and used only for access management.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
