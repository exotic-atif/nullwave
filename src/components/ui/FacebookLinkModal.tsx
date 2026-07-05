import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link2, X, Check } from 'lucide-react'
import { FaFacebook } from 'react-icons/fa'
import { useAuthStore } from '@/store'

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
  const [isDone, setIsDone] = useState(false)

  // Use facebook name if available, otherwise just use the NullWave display name
  const fbName = (user as any)?.user_metadata?.facebook_name || (user as any)?.user_metadata?.full_name || user?.displayName || 'your account'
  // Check for the picture field in user_metadata which Supabase maps from FB
  const fbPfp = (user as any)?.user_metadata?.picture || (user as any)?.user_metadata?.avatar_url
  const userEmail = user?.email || ''

  const [message, setMessage] = useState(`Are you sure you want to connect your NullWave account associated with ${userEmail} to your Facebook profile ${fbName}?`)

  useEffect(() => {
    if (isOpen) {
      setIconState('link')
      setMessage(`Are you sure you want to connect your NullWave account associated with ${userEmail} to your Facebook profile ${fbName}?`)
      setIsProcessing(false)
      setIsDone(false)
    }
  }, [isOpen, fbName, userEmail])

  const handleNahBro = async () => {
    setIsProcessing(true)
    setIconState('cross')
    setMessage('Facebook linking cancelled by user.')
    await onCancel()
    setIsDone(true)
    setTimeout(() => {
      onClose()
    }, 2000)
  }

  const handleHellYeah = () => {
    setIsProcessing(true)
    setIconState('check')
    setMessage('Linking successful! Welcome aboard.')
    onConfirm()
    setIsDone(true)
    setTimeout(() => {
      onClose()
    }, 2000)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-[#121212] border border-nw-border-subtle rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Top decorative gradient - matches NullWave premium feel */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#1877F2] to-transparent opacity-50" />

            <div className="p-10">
              <div className="flex flex-col items-center text-center">
                
                {/* Connection Animation Container */}
                <div className="relative flex items-center justify-center w-full h-24 mb-10">
                  
                  {/* NullWave Avatar with Badge */}
                  <motion.div 
                    animate={isDone ? { x: -40, opacity: 0 } : { x: -72, opacity: 1 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    className="absolute z-10"
                  >
                    <div className="relative w-20 h-20 rounded-full border border-white/10 overflow-hidden bg-nw-surface shadow-2xl">
                      {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt="NullWave avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-nw-accent text-white font-black text-2xl">
                          {user?.displayName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    {/* NullWave Badge */}
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#121212] border border-white/10 flex items-center justify-center shadow-lg">
                      <img src="/favicon.svg" alt="NullWave" className="w-4 h-4" />
                    </div>
                  </motion.div>

                  {/* Central Icon */}
                  <motion.div 
                    animate={isDone ? { scale: 1.2 } : { scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="absolute z-20 flex items-center justify-center w-12 h-12 rounded-full bg-[#1A1A1A] border border-white/10 shadow-2xl"
                  >
                    {iconState === 'link' && <Link2 size={20} className="text-nw-text-secondary" />}
                    {iconState === 'check' && <Check size={24} className="text-nw-accent" strokeWidth={3} />}
                    {iconState === 'cross' && <X size={24} className="text-nw-danger" strokeWidth={3} />}
                  </motion.div>

                  {/* Facebook Avatar with Badge */}
                  <motion.div 
                    animate={isDone ? { x: 40, opacity: 0 } : { x: 72, opacity: 1 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    className="absolute z-10"
                  >
                    <div className="relative w-20 h-20 rounded-full border border-white/10 overflow-hidden bg-white shadow-2xl">
                      {fbPfp ? (
                        <img src={fbPfp} alt="Facebook avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#1877F2] text-white">
                          <FaFacebook size={40} />
                        </div>
                      )}
                    </div>
                    {/* Facebook Badge */}
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#1877F2] border border-white/10 flex items-center justify-center shadow-lg text-white">
                      <FaFacebook size={14} />
                    </div>
                  </motion.div>
                  
                </div>

                <motion.h3 
                  key={message}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-base font-medium text-nw-text-secondary leading-relaxed px-4 mb-8"
                >
                  {iconState === 'link' ? (
                    <>
                      Are you sure you want to connect your NullWave account associated with <span className="text-nw-text font-bold">{userEmail}</span> with your Facebook profile <span className="text-[#1877F2] font-bold">{fbName}</span>?
                    </>
                  ) : (
                    <span className={iconState === 'check' ? 'text-nw-accent font-bold text-lg' : 'text-nw-danger font-bold text-lg'}>
                      {message}
                    </span>
                  )}
                </motion.h3>

                <div className="flex w-full gap-4">
                  <button
                    onClick={handleNahBro}
                    disabled={isProcessing}
                    className="flex-1 py-4 px-4 bg-[#121212] hover:bg-nw-danger/10 text-nw-danger font-bold tracking-wide rounded-2xl border border-nw-danger/20 transition-all disabled:opacity-50 disabled:scale-95"
                  >
                    Nah Bro!
                  </button>
                  <button
                    onClick={handleHellYeah}
                    disabled={isProcessing}
                    className="flex-1 py-4 px-4 bg-nw-accent/10 hover:bg-nw-accent/20 text-nw-accent font-bold tracking-wide rounded-2xl border border-nw-accent/20 transition-all disabled:opacity-50 disabled:scale-95"
                  >
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
