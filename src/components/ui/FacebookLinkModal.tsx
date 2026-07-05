import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link2, X, Check } from 'lucide-react'
import { FaFacebook } from 'react-icons/fa'
import { useAuthStore } from '@/store'
import { supabase } from '@/lib/supabase'

interface FacebookLinkModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  onCancel: () => void
}

export function FacebookLinkModal({ isOpen, onClose, onConfirm, onCancel }: FacebookLinkModalProps) {
  const { user } = useAuthStore()

  const [iconState, setIconState] = useState<'link' | 'check' | 'cross'>('link')
  const [isProcessing, setIsProcessing] = useState(false)

  // Exit animation state
  const [isExiting, setIsExiting] = useState(false)

  // FB Data
  const [fbName, setFbName] = useState('your account')
  const [fbPfp, setFbPfp] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState('')
  const [message, setMessage] = useState('Loading...')

  useEffect(() => {
    if (isOpen) {
      setIconState('link')
      setIsProcessing(false)
      setIsExiting(false)

      // Fetch fresh auth user to get the true identities and FB data
      supabase.auth.getUser().then(({ data: { user: authUser } }) => {
        if (authUser) {
          const email = authUser.email || user?.email || ''
          setUserEmail(email)

          const fbIdentity = authUser.identities?.find(i => i.provider === 'facebook')
          let name = 'your account'
          let pfp = null

          if (fbIdentity) {
            name = fbIdentity.identity_data?.full_name || fbIdentity.identity_data?.name || authUser.user_metadata?.full_name || name

            // Use Graph API to reliably fetch the large profile picture using the Facebook user ID
            if (fbIdentity.id) {
              pfp = `https://graph.facebook.com/${fbIdentity.id}/picture?type=large`
            } else {
              pfp = fbIdentity.identity_data?.picture || fbIdentity.identity_data?.avatar_url || authUser.user_metadata?.avatar_url || null
            }
          }

          setFbName(name)
          setFbPfp(pfp)
          setMessage(`Are you sure you want to connect your NullWave account associated with ${email} to your Facebook profile ${name}?`)
        }
      })
    }
  }, [isOpen, user])

  const handleNahBro = async () => {
    setIsProcessing(true)
    setIconState('cross')
    setMessage('Facebook linking cancelled by user!')
    await onCancel()

    // Wait for the animation to play out nicely
    setTimeout(() => {
      setIsExiting(true) // Trigger scale down
      setTimeout(() => {
        onClose()
      }, 400) // Wait for exit animation to finish before unmounting
    }, 1500)
  }

  const handleHellYeah = () => {
    setIsProcessing(true)
    setIconState('check')
    setMessage('Linking successful! Welcome aboard!')
    onConfirm()

    setTimeout(() => {
      setIsExiting(true) // Trigger scale down
      setTimeout(() => {
        onClose()
      }, 400)
    }, 1500)
  }

  return (
    <AnimatePresence>
      {isOpen && !isExiting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-xl"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-[#0c0c0c]/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_0_80px_rgba(24,119,242,0.15)] overflow-hidden"
          >
            {/* Top decorative premium glow */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#1877F2] to-transparent opacity-80" />

            <div className="px-8 py-10">
              <div className="flex flex-col items-center text-center">

                {/* Title */}
                <h2 className="text-2xl font-black tracking-tight text-white mb-10">
                  Link your Facebook account?
                </h2>

                {/* Connection Animation Container */}
                <div className="relative flex items-center justify-center w-full h-28 mb-10">

                  {/* NullWave Avatar */}
                  <motion.div
                    animate={iconState !== 'link' ? { x: -40, opacity: 0.2, filter: 'blur(4px)' } : { x: -80, opacity: 1, filter: 'blur(0px)' }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute z-10"
                  >
                    <div className="relative w-[5.5rem] h-[5.5rem] rounded-full border-[3px] border-[#0c0c0c] overflow-hidden bg-nw-surface shadow-2xl ring-1 ring-white/10">
                      {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt="NullWave avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-nw-accent text-white font-black text-3xl">
                          {user?.displayName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    {/* NullWave Badge */}
                    <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#0c0c0c] border border-white/10 flex items-center justify-center shadow-lg">
                      <img src="/favicon.svg" alt="NullWave" className="w-4 h-4" />
                    </div>
                  </motion.div>

                  {/* Central Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: iconState !== 'link' ? 1.3 : 1, rotate: iconState === 'check' ? [0, -10, 0] : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="absolute z-30 flex items-center justify-center w-14 h-14 rounded-full bg-[#161616] border border-white/10 shadow-2xl backdrop-blur-md"
                  >
                    {iconState === 'link' && <Link2 size={24} className="text-nw-text-secondary" />}
                    {iconState === 'check' && <Check size={28} className="text-nw-accent drop-shadow-[0_0_10px_rgba(29,185,84,0.5)]" strokeWidth={3} />}
                    {iconState === 'cross' && <X size={28} className="text-nw-danger drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" strokeWidth={3} />}
                  </motion.div>

                  {/* Facebook Avatar */}
                  <motion.div
                    animate={iconState !== 'link' ? { x: 40, opacity: 0.2, filter: 'blur(4px)' } : { x: 80, opacity: 1, filter: 'blur(0px)' }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute z-10"
                  >
                    <div className="relative w-[5.5rem] h-[5.5rem] rounded-full border-[3px] border-[#0c0c0c] overflow-hidden bg-white shadow-2xl ring-1 ring-white/10">
                      {fbPfp ? (
                        <img
                          src={fbPfp}
                          alt="Facebook avatar"
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#1877F2] text-white">
                          <FaFacebook size={48} />
                        </div>
                      )}
                    </div>
                    {/* Facebook Badge */}
                    <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#1877F2] border border-[#0c0c0c] flex items-center justify-center shadow-lg text-white">
                      <FaFacebook size={16} />
                    </div>
                  </motion.div>

                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={message}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="h-20 flex items-center justify-center mb-6"
                  >
                    {iconState === 'link' ? (
                      <p className="text-[15px] font-medium text-nw-text-secondary leading-relaxed px-2">
                        Are you sure you want to connect your NullWave account associated with <span className="text-white font-bold">{userEmail}</span> with your Facebook profile <span className="text-[#1877F2] font-bold">{fbName}</span>?
                      </p>
                    ) : (
                      <span className={iconState === 'check' ? 'text-nw-accent font-black text-xl tracking-wide' : 'text-nw-danger font-black text-xl tracking-wide'}>
                        {message}
                      </span>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="flex w-full gap-4 mt-2">
                  <button
                    onClick={handleNahBro}
                    disabled={isProcessing}
                    className="relative flex-1 py-4 px-4 bg-[#1a1a1a] hover:bg-nw-danger/15 text-nw-danger font-black uppercase tracking-widest text-sm rounded-2xl border border-nw-danger/20 transition-all duration-300 disabled:opacity-50 group overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-nw-danger/0 via-nw-danger/10 to-nw-danger/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    Nah Bro!
                  </button>
                  <button
                    onClick={handleHellYeah}
                    disabled={isProcessing}
                    className="relative flex-1 py-4 px-4 bg-[#3b82f6] hover:bg-[#3b82f6]/90 text-[#000] font-black uppercase tracking-widest text-sm rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all duration-300 disabled:opacity-50 group overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    Hell Yeahh!
                  </button>
                </div>

              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
