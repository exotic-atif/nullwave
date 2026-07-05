import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Radio, Link as LinkIcon, Unlink } from 'lucide-react'

interface ThreadsLinkModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  onCancel: () => void
  email: string
}

export function ThreadsLinkModal({ isOpen, onClose, onConfirm, onCancel, email }: ThreadsLinkModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-[#121212] border border-nw-border-subtle rounded-3xl p-6 shadow-2xl relative overflow-hidden pointer-events-auto"
            >
              {/* Decorative Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-nw-accent/10 via-transparent to-transparent opacity-50" />
              
              <div className="relative z-10 flex flex-col items-center">
                
                {/* Visual Connector Graphic */}
                <div className="flex items-center justify-center gap-4 mb-8 mt-4">
                  {/* NullWave Side */}
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-nw-accent to-nw-accent-glow p-0.5 shadow-lg shadow-nw-accent-glow/20">
                      <div className="w-full h-full rounded-full bg-nw-black flex items-center justify-center overflow-hidden">
                        <Radio className="w-10 h-10 text-white" />
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#121212] border-2 border-[#121212] flex items-center justify-center">
                      <Radio size={14} className="text-nw-accent" />
                    </div>
                  </div>

                  {/* Connector */}
                  <div className="flex flex-col items-center justify-center text-nw-muted px-2">
                    <LinkIcon className="w-6 h-6 text-nw-accent animate-pulse" />
                  </div>

                  {/* Threads Side */}
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-neutral-600 to-neutral-400 p-0.5 shadow-lg">
                      <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                        <svg viewBox="0 0 24 24" className="w-12 h-12 text-black" fill="currentColor">
                          <path d="M12.0001 0.499878C5.6486 0.499878 0.500122 5.64835 0.500122 11.9999C0.500122 18.3514 5.6486 23.4999 12.0001 23.4999C15.5414 23.4999 18.7061 21.9 20.8523 19.3175L18.6657 17.2024C17.0694 19.102 14.6738 20.3015 12.0001 20.3015C7.41584 20.3015 3.69854 16.5842 3.69854 11.9999C3.69854 7.4156 7.41584 3.6983 12.0001 3.6983C15.8643 3.6983 19.1124 6.33596 20.0094 9.94827H12.0001V12.7844H20.2505C20.2869 12.5273 20.306 12.2655 20.306 11.9999C20.306 6.36836 16.2917 1.68412 11.0068 0.697416C11.3323 0.567605 11.6631 0.531276 12.0001 0.499878Z" />
                        </svg>
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white border-2 border-[#121212] flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 text-black" fill="currentColor">
                        <path d="M12.0001 0.499878C5.6486 0.499878 0.500122 5.64835 0.500122 11.9999C0.500122 18.3514 5.6486 23.4999 12.0001 23.4999C15.5414 23.4999 18.7061 21.9 20.8523 19.3175L18.6657 17.2024C17.0694 19.102 14.6738 20.3015 12.0001 20.3015C7.41584 20.3015 3.69854 16.5842 3.69854 11.9999C3.69854 7.4156 7.41584 3.6983 12.0001 3.6983C15.8643 3.6983 19.1124 6.33596 20.0094 9.94827H12.0001V12.7844H20.2505C20.2869 12.5273 20.306 12.2655 20.306 11.9999C20.306 6.36836 16.2917 1.68412 11.0068 0.697416C11.3323 0.567605 11.6631 0.531276 12.0001 0.499878Z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Text Content */}
                <h3 className="text-xl font-bold text-white mb-3 text-center">Sync Your Universe</h3>
                <p className="text-sm text-nw-text-secondary text-center mb-8 px-4 leading-relaxed">
                  Are you sure you want to securely connect your NullWave identity (<span className="text-white font-medium">{email}</span>) with your Threads profile?
                </p>

                {/* Actions */}
                <div className="w-full space-y-3">
                  <button
                    onClick={onConfirm}
                    className="w-full py-3.5 bg-nw-accent text-white text-sm font-bold rounded-xl hover:bg-nw-accent-hover transition-all duration-200 glow-accent flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Yessssir!
                  </button>
                  <button
                    onClick={onCancel}
                    className="w-full py-3.5 bg-transparent border border-nw-border text-nw-danger text-sm font-bold rounded-xl hover:bg-nw-danger/10 hover:border-nw-danger/30 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Unlink size={18} />
                    Nah My Bad, Cancel
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
