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
  
  // State for the central icon: 'link' | 'check' | 'cross'
  const [iconState, setIconState] = useState<'link' | 'check' | 'cross'>('link')
  // State for the message
  const [message, setMessage] = useState('Do you want to link this Facebook account?')
  // Loading state
  const [isProcessing, setIsProcessing] = useState(false)

  // Use facebook name if available, otherwise just use the NullWave display name
  const fbName = (user as any)?.user_metadata?.facebook_name || (user as any)?.user_metadata?.full_name || user?.displayName
  const fbPfp = (user as any)?.user_metadata?.facebook_pfp || (user as any)?.user_metadata?.avatar_url

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setIconState('link')
      setMessage(`Connect ${fbName} to NullWave?`)
      setIsProcessing(false)
    }
  }, [isOpen, fbName])

  const handleNahBro = async () => {
    setIsProcessing(true)
    setIconState('cross')
    setMessage('Facebook linking cancelled by user')
    await onCancel()
    // Delay closing so they can see the message and icon
    setTimeout(() => {
      onClose()
    }, 1500)
  }

  const handleHellYeah = () => {
    setIsProcessing(true)
    setIconState('check')
    setMessage('Linking successful')
    onConfirm()
    setTimeout(() => {
      onClose()
    }, 1500)
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
            {/* Top decorative gradient */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#1877F2] to-transparent opacity-50" />

            <div className="p-8">
              <div className="flex flex-col items-center text-center">
                
                {/* Connection Animation Container */}
                <div className="relative flex items-center justify-center w-full h-24 mb-6">
                  
                  {/* NullWave Avatar with Badge */}
                  <div className="absolute left-1/2 -translate-x-[72px] z-10">
                    <div className="relative w-16 h-16 rounded-full border-2 border-nw-surface overflow-hidden bg-nw-elevated shadow-lg">
                      {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt="NullWave avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-nw-accent text-white font-bold text-xl">
                          {user?.displayName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    {/* NullWave Badge */}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-nw-accent border-2 border-nw-surface flex items-center justify-center shadow-sm">
                      <span className="text-[10px] font-black text-white">N</span>
                    </div>
                  </div>

                  {/* Central Icon */}
                  <div className="absolute z-20 flex items-center justify-center w-10 h-10 rounded-full bg-nw-surface border-2 border-nw-border shadow-sm">
                    {iconState === 'link' && <Link2 size={18} className="text-nw-text-secondary" />}
                    {iconState === 'check' && <Check size={18} className="text-green-500" />}
                    {iconState === 'cross' && <X size={18} className="text-red-500" />}
                  </div>

                  {/* Facebook Avatar with Badge */}
                  <div className="absolute right-1/2 translate-x-[72px] z-10">
                    <div className="relative w-16 h-16 rounded-full border-2 border-nw-surface overflow-hidden bg-white shadow-lg">
                      {fbPfp ? (
                        <img src={fbPfp} alt="Facebook avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#1877F2] text-white">
                          <FaFacebook size={32} />
                        </div>
                      )}
                    </div>
                    {/* Facebook Badge */}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#1877F2] border-2 border-nw-surface flex items-center justify-center shadow-sm text-white">
                      <FaFacebook size={12} />
                    </div>
                  </div>
                  
                </div>

                <h3 className="text-lg font-bold text-nw-text mb-2 px-2">
                  {message}
                </h3>

                <div className="flex w-full gap-3 mt-6">
                  <button
                    onClick={handleNahBro}
                    disabled={isProcessing}
                    className="flex-1 py-3 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-xl border border-red-500/20 transition-colors disabled:opacity-50"
                  >
                    Nah Bro!
                  </button>
                  <button
                    onClick={handleHellYeah}
                    disabled={isProcessing}
                    className="flex-1 py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
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
