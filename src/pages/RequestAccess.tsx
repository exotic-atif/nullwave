import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Upload, CheckCircle2, User, ArrowRight, AtSign } from 'lucide-react'
import { submitAccessRequest, cancelAccessRequest, supabase } from '@/lib/supabase'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
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
  const [error, setError] = useState<React.ReactNode>('')
  const [isPfpModalOpen, setIsPfpModalOpen] = useState(false)
  const [isCompleteProfile, setIsCompleteProfile] = useState(false)
  const [googleMsg, setGoogleMsg] = useState('')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    if (searchParams.get('status') === 'pending') {
      setIsSubmitted(true)
    }

    if (searchParams.get('complete_profile') === 'true') {
      setIsCompleteProfile(true)
      const errMsg = searchParams.get('error_msg')
      if (errMsg) setGoogleMsg(errMsg)
      
      // Load session info from Google auth
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setEmail(session.user.email || '')
          setDisplayName(session.user.user_metadata?.full_name || session.user.user_metadata?.name || '')
          if (session.user.user_metadata?.avatar_url) {
            setAvatarPreview(session.user.user_metadata.avatar_url)
          }
        }
      })
    }
  }, [searchParams])

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
          setError(
            <>
              You've already submitted a request! Please be patient or contact the Admin at{' '}
              <a href="mailto:mratif00007@gmail.com" className="text-nw-accent hover:underline font-semibold">mratif00007@gmail.com</a>{' '}
              or Instagram <a href="https://instagram.com/exotic_atif" target="_blank" rel="noopener noreferrer" className="text-nw-accent hover:underline font-semibold">@exotic_atif</a>.
            </>
          )
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
      } else if (isCompleteProfile && avatarPreview) {
        // If they didn't upload a new file but we have a preview from Google
        uploadedUrl = avatarPreview
      }

      await submitAccessRequest({
        display_name: displayName.trim(),
        email: normalizedEmail,
        avatar_url: uploadedUrl || undefined,
        fav_artists: favArtists.trim() || undefined,
        fav_songs: favSongs.trim() || undefined,
        instagram_id: instagramId.trim() || undefined
      })
      
      if (isCompleteProfile) {
        await supabase.auth.signOut()
      }

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
      <div className="min-h-screen flex items-center justify-center bg-nw-black gradient-mesh relative overflow-hidden">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 text-center max-w-md mx-4 px-8 py-12">
          <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', delay: 0.2, damping: 15 }} className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center">
            <CheckCircle2 size={40} className="text-green-400" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-3xl font-display font-bold text-nw-text mb-3">You're on the list!</motion.h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-nw-text-secondary text-sm leading-relaxed mb-2">Thanks for your interest in <span className="text-nw-accent font-semibold">Nullwave</span>{displayName ? `, ${displayName}` : ''}!</motion.p>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="text-nw-text-tertiary text-xs leading-relaxed mb-8">We'll email you when access is granted.</motion.p>
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
    <div className="h-[100dvh] w-full flex flex-col items-center py-12 px-4 bg-nw-black gradient-mesh relative overflow-x-hidden overflow-y-auto">

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 w-full max-w-lg mt-auto mb-auto shrink-0">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-6">
            <img src="/favicon.svg" alt="NullWave Logo" className="w-14 h-14" />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-white mb-2">Join NullWave</h1>
          <p className="text-sm text-nw-muted text-center max-w-sm">Request early access to the next generation of music streaming.</p>
        </div>

        <div className="p-[1px] rounded-3xl bg-gradient-to-b from-white/[0.12] to-white/[0.02] shadow-2xl shadow-black/50">
          <form onSubmit={handleSubmit} className="bg-nw-surface/80 border border-white/[0.04] backdrop-blur-3xl rounded-3xl p-6 sm:p-8 flex flex-col gap-6">
            {!isCompleteProfile && (
              <div className="flex flex-col items-center w-full mb-2">
                <div className="w-full flex flex-col gap-3">
                  <button 
                    type="button" 
                    onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback` } })}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-100 text-black font-semibold rounded-2xl transition-all shadow-sm text-sm"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                  </button>
                  <button 
                    type="button" 
                    onClick={() => supabase.auth.signInWithOAuth({ provider: 'github', options: { redirectTo: `${window.location.origin}/auth/callback` } })}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#24292e] hover:bg-[#2f363d] text-white font-semibold rounded-xl transition-colors shadow-sm"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                    Continue with GitHub
                  </button>
                </div>
                <div className="relative flex items-center w-full mt-6">
                  <div className="flex-grow border-t border-white/[0.08]"></div>
                  <span className="flex-shrink-0 mx-4 text-[10px] text-nw-muted uppercase tracking-widest font-medium">or sign up with email</span>
                  <div className="flex-grow border-t border-white/[0.08]"></div>
                </div>
              </div>
            )}
            
            {googleMsg && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-sm text-amber-400 text-center">
                {googleMsg}
              </motion.div>
            )}

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
              <span className="text-xs text-nw-muted mt-3 group-hover:text-nw-accent transition-colors">
                {avatarPreview ? 'Change Profile Picture' : 'Set Profile Picture'}
              </span>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-sm text-red-400 text-center">
                {error}
              </motion.div>
            )}

            <div className="grid gap-4">
              <div className="relative group">
                <input type="text" required value={displayName} onChange={e => setDisplayName(e.target.value)} id="name" className="peer w-full bg-black/40 border border-white/[0.08] rounded-2xl px-4 pt-6 pb-2 text-white text-sm focus:outline-none focus:border-nw-accent/50 focus:bg-nw-accent/5 transition-all" placeholder=" " />
                <label htmlFor="name" className="absolute left-4 top-4 text-xs text-nw-muted transition-all peer-focus:-translate-y-2 peer-focus:text-[10px] peer-focus:text-nw-accent peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:text-[10px]">Display Name</label>
              </div>

              <div className="relative group">
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} disabled={isCompleteProfile} id="email" className={`peer w-full bg-black/40 border border-white/[0.08] rounded-2xl px-4 pt-6 pb-2 ${isCompleteProfile ? 'text-nw-muted cursor-not-allowed' : 'text-white'} text-sm focus:outline-none focus:border-nw-accent/50 focus:bg-nw-accent/5 transition-all`} placeholder=" " />
                <label htmlFor="email" className="absolute left-4 top-4 text-xs text-nw-muted transition-all peer-focus:-translate-y-2 peer-focus:text-[10px] peer-focus:text-nw-accent peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:text-[10px]">Email Address</label>
                {isCompleteProfile && (
                  <svg viewBox="0 0 24 24" className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-nw-muted/50" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor" />
                  </svg>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative group">
                  <input type="text" value={favArtists} onChange={e => setFavArtists(e.target.value)} id="artists" className="peer w-full bg-black/40 border border-white/[0.08] rounded-2xl px-4 pt-6 pb-2 text-white text-sm focus:outline-none focus:border-nw-accent/50 focus:bg-nw-accent/5 transition-all" placeholder=" " />
                  <label htmlFor="artists" className="absolute left-4 top-4 text-xs text-nw-muted transition-all peer-focus:-translate-y-2 peer-focus:text-[10px] peer-focus:text-nw-accent peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:text-[10px]">Favorite Artists</label>
                </div>
                <div className="relative group">
                  <input type="text" value={favSongs} onChange={e => setFavSongs(e.target.value)} id="songs" className="peer w-full bg-black/40 border border-white/[0.08] rounded-2xl px-4 pt-6 pb-2 text-white text-sm focus:outline-none focus:border-nw-accent/50 focus:bg-nw-accent/5 transition-all" placeholder=" " />
                  <label htmlFor="songs" className="absolute left-4 top-4 text-xs text-nw-muted transition-all peer-focus:-translate-y-2 peer-focus:text-[10px] peer-focus:text-nw-accent peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:text-[10px]">Favorite Songs</label>
                </div>
              </div>

              <div className="relative group">
                <input type="text" value={instagramId} onChange={e => setInstagramId(e.target.value)} id="ig" className="peer w-full bg-black/40 border border-white/[0.08] rounded-2xl px-4 pt-6 pb-2 text-white text-sm focus:outline-none focus:border-nw-accent/50 focus:bg-nw-accent/5 transition-all" placeholder=" " />
                <label htmlFor="ig" className="absolute left-4 top-4 text-xs text-nw-muted transition-all peer-focus:-translate-y-2 peer-focus:text-[10px] peer-focus:text-nw-accent peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:text-[10px]">Instagram ID (Optional)</label>
                <AtSign size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-nw-muted/50" />
              </div>
            </div>

            {isCompleteProfile ? (
              <div className="flex items-center gap-3 mt-2">
                <button type="button" onClick={async () => { 
                  try {
                    await cancelAccessRequest(email)
                  } catch(e) {
                    console.error('Failed to cancel request:', e)
                  }
                  await supabase.auth.signOut()
                  navigate('/login') 
                }} className="flex-1 py-4 bg-white/[0.05] hover:bg-white/[0.1] text-white font-bold rounded-2xl transition-all">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-[2] py-4 bg-gradient-to-r from-nw-accent to-purple-600 hover:from-nw-accent-hover hover:to-purple-500 text-white font-bold rounded-2xl transition-all shadow-[0_0_30px_rgba(56,189,248,0.3)] hover:shadow-[0_0_40px_rgba(56,189,248,0.5)] flex items-center justify-center gap-2 group">
                  {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Submitting...</> : <>Submit Request <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
                </button>
              </div>
            ) : (
              <button type="submit" disabled={isSubmitting} className="w-full py-4 mt-2 bg-gradient-to-r from-nw-accent to-purple-600 hover:from-nw-accent-hover hover:to-purple-500 text-white font-bold rounded-2xl transition-all shadow-[0_0_30px_rgba(56,189,248,0.3)] hover:shadow-[0_0_40px_rgba(56,189,248,0.5)] flex items-center justify-center gap-2 group">
                {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Submitting...</> : <>Request Access <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
              </button>
            )}
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
