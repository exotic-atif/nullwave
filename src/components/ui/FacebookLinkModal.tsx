import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Loader2, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/store'

interface FacebookLinkModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  onCancel: () => void
}

export function FacebookLinkModal({ isOpen, onClose, onConfirm, onCancel }: FacebookLinkModalProps) {
  const { user } = useAuthStore()
  const [isAnimating, setIsAnimating] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isUnlinking, setIsUnlinking] = useState(false)

  // Use facebook name if available, otherwise just use the NullWave display name
  const fbName = (user as any)?.user_metadata?.facebook_name || (user as any)?.user_metadata?.full_name || user?.displayName
  const fbPfp = (user as any)?.user_metadata?.facebook_pfp || (user as any)?.user_metadata?.avatar_url

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
      // Simulate connection delay for UI effect
      const timer = setTimeout(() => {
        setIsAnimating(false)
        setShowSuccess(true)
      }, 1500)
      return () => clearTimeout(timer)
    } else {
      setShowSuccess(false)
      setIsAnimating(false)
      setIsUnlinking(false)
    }
  }, [isOpen])

  const handleUnlink = async () => {
    setIsUnlinking(true)
    await onCancel()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm overflow-hidden bg-nw-surface border border-nw-border rounded-3xl shadow-2xl"
          >
            {/* Top decorative gradient - Facebook Blue */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#1877F2] to-transparent opacity-50" />

            <button
              onClick={onClose}
              disabled={isAnimating || isUnlinking}
              className="absolute top-4 right-4 p-2 text-nw-text-tertiary hover:text-white rounded-full hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              <X size={18} />
            </button>

            <div className="p-8">
              <div className="flex flex-col items-center text-center">
                
                {/* Connection Animation Container */}
                <div className="relative flex items-center justify-center w-full h-24 mb-6">
                  {/* NullWave Avatar */}
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: isAnimating ? -30 : -40, opacity: 1 }}
                    className="absolute z-10 w-16 h-16 rounded-full border-2 border-nw-surface overflow-hidden bg-nw-elevated flex items-center justify-center"
                  >
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="Your NullWave avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-bold text-nw-text-secondary">
                        {user?.displayName?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </motion.div>

                  {/* Connecting Line */}
                  <div className="absolute w-24 h-[2px] bg-nw-border overflow-hidden">
                    {isAnimating && (
                      <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-full h-full bg-gradient-to-r from-transparent via-[#1877F2] to-transparent"
                      />
                    )}
                  </div>

                  {/* Facebook Avatar */}
                  <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: isAnimating ? 30 : 40, opacity: 1 }}
                    className="absolute z-10 w-16 h-16 rounded-full border-2 border-nw-surface overflow-hidden bg-white flex items-center justify-center shadow-lg"
                  >
                    {fbPfp ? (
                      <img src={fbPfp} alt="Facebook avatar" className="w-full h-full object-cover" />
                    ) : (
                      <svg viewBox="0 0 36 36" className="w-8 h-8 text-[#1877F2]" fill="currentColor">
                        <path d="M15 35.8C6.5 34.3 0 26.9 0 18 0 8.1 8.1 0 18 0s18 8.1 18 18c0 8.9-6.5 16.3-15 17.8l-1-8h3l1-4h-4v-2c0-1.2.6-2 2-2h2V9.8c-1-.2-2-.3-3-.3-3.6 0-6 2.2-6 6.3v2.2h-3v4h3v8h-3z" />
                      </svg>
                    )}
                  </motion.div>

                  {/* Success Checkmark */}
                  <AnimatePresence>
                    {showSuccess && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute z-20 w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center shadow-lg border-2 border-nw-surface"
                      >
                        <Check size={16} className="text-white" strokeWidth={3} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <h3 className="text-xl font-bold text-nw-text mb-2">
                  {isAnimating ? 'Connecting Facebook...' : 'Facebook Linked!'}
                </h3>
                
                <p className="text-sm text-nw-text-secondary mb-8">
                  {isAnimating 
                    ? 'Securely linking your Facebook identity...'
                    : `Your NullWave account is now connected to ${fbName}. You can use Facebook to log in faster next time.`}
                </p>

                <div className="flex flex-col w-full gap-3">
                  <button
                    onClick={onConfirm}
                    disabled={isAnimating}
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                  >
                    {isAnimating ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        Done
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                  
                  {!isAnimating && (
                    <button
                      onClick={handleUnlink}
                      disabled={isUnlinking}
                      className="text-sm font-medium text-nw-text-tertiary hover:text-nw-danger transition-colors py-2"
                    >
                      {isUnlinking ? 'Unlinking...' : 'Undo'}
                    </button>
                  )}
                </div>

              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
