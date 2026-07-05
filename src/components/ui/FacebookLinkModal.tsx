import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link2, X, Check, Music } from 'lucide-react'
import { FaFacebook } from 'react-icons/fa'
import { useAuthStore } from '@/store'
import { supabase } from '@/lib/supabase'

// ─── Types ──────────────────────────────────────────────────────────────────

interface FacebookLinkModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  onCancel: () => void | Promise<void>
}

type IconState = 'link' | 'check' | 'cross'

// ─── Animation Variants ─────────────────────────────────────────────────────

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
} as const

const modalVariants = {
  hidden: { opacity: 0, scale: 0.88, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, damping: 28, stiffness: 340, mass: 0.8 },
  },
  exitSuccess: {
    opacity: 0,
    scale: 1.04,
    y: -20,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
  },
  exitCancel: {
    opacity: 0,
    scale: 0.92,
    y: 24,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
  },
}

const iconMorphVariants = {
  initial: { scale: 0, rotate: -90, opacity: 0 },
  animate: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: { type: 'spring' as const, damping: 14, stiffness: 300, mass: 0.6 },
  },
  exit: {
    scale: 0,
    rotate: 90,
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' as const },
  },
}

const messageVariants = {
  initial: { opacity: 0, y: 14, filter: 'blur(4px)' },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring' as const, damping: 20, stiffness: 200 },
  },
  exit: {
    opacity: 0,
    y: -10,
    filter: 'blur(4px)',
    transition: { duration: 0.2 },
  },
}

// ─── Component ──────────────────────────────────────────────────────────────

export function FacebookLinkModal({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
}: FacebookLinkModalProps) {
  const { user } = useAuthStore()

  const [iconState, setIconState] = useState<IconState>('link')
  const [isProcessing, setIsProcessing] = useState(false)
  const [exitVariant, setExitVariant] = useState<'exitSuccess' | 'exitCancel'>('exitCancel')
  const [shouldRender, setShouldRender] = useState(false)

  // Facebook data
  const [fbName, setFbName] = useState('your account')
  const [fbPfp, setFbPfp] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState('')

  // Reset state and fetch FB data when modal opens
  useEffect(() => {
    if (isOpen) {
      setIconState('link')
      setIsProcessing(false)
      setShouldRender(true)
      setExitVariant('exitCancel')

      supabase.auth.getUser().then(({ data: { user: authUser } }) => {
        if (authUser) {
          const email = authUser.email || user?.email || ''
          setUserEmail(email)

          const fbIdentity = authUser.identities?.find(
            (i) => i.provider === 'facebook'
          )
          let name = 'your account'
          let pfp: string | null = null

          if (fbIdentity) {
            name =
              fbIdentity.identity_data?.full_name ||
              fbIdentity.identity_data?.name ||
              authUser.user_metadata?.full_name ||
              name

            // Use Graph API for a reliable large profile picture
            if (fbIdentity.id) {
              pfp = `https://graph.facebook.com/${fbIdentity.id}/picture?width=800&height=800&redirect=true`
            } else {
              pfp =
                fbIdentity.identity_data?.picture ||
                fbIdentity.identity_data?.avatar_url ||
                authUser.user_metadata?.picture ||
                authUser.user_metadata?.avatar_url ||
                null
            }
          }

          setFbName(name)
          setFbPfp(pfp)
        }
      })
    }
  }, [isOpen, user])

  // Close after exit animation completes
  const handleExitComplete = useCallback(() => {
    if (!shouldRender) return
    setShouldRender(false)
    onClose()
  }, [shouldRender, onClose])

  // ── Cancel handler ──────────────────────────────────────────────────────
  const handleNahBro = async () => {
    if (isProcessing) return
    setIsProcessing(true)
    setIconState('cross')
    setExitVariant('exitCancel')

    // Fire external callback
    await Promise.resolve(onCancel())

    // Wait for confirmation animation (icon + text) to fully display
    setTimeout(() => {
      setShouldRender(false)
    }, 1400)
  }

  // ── Confirm handler ─────────────────────────────────────────────────────
  const handleHellYeah = async () => {
    if (isProcessing) return
    setIsProcessing(true)
    setIconState('check')
    setExitVariant('exitSuccess')

    // Fire external callback
    await Promise.resolve(onConfirm())

    // Wait for confirmation animation to fully display
    setTimeout(() => {
      setShouldRender(false)
    }, 1400)
  }

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {isOpen && shouldRender && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          {/* ── Backdrop ────────────────────────────────────────────────── */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 bg-black/70 backdrop-blur-xl"
          />

          {/* ── Modal Card ──────────────────────────────────────────────── */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit={exitVariant}
            className="relative w-full max-w-lg bg-[#0c0c0c]/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_0_80px_rgba(56,189,248,0.1)] overflow-hidden"
          >
            {/* Top accent line */}
            <motion.div
              className="absolute top-0 left-0 right-0 h-[2px]"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="h-full bg-gradient-to-r from-transparent via-[#1877F2] to-transparent opacity-80" />
            </motion.div>

            {/* Ambient glow orbs */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#1877F2]/8 blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-nw-accent/6 blur-[80px] rounded-full pointer-events-none" />

            <div className="px-8 py-10">
              <div className="flex flex-col items-center text-center">
                {/* ── Title ──────────────────────────────────────────────── */}
                <motion.h2
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, type: 'spring', damping: 20 }}
                  className="text-2xl font-black tracking-tight text-white mb-10"
                >
                  Link your Facebook account?
                </motion.h2>

                {/* ── Profile Connection Visualization ───────────────────── */}
                <div className="relative flex items-center justify-center w-full h-28 mb-10">
                  {/* NullWave Avatar */}
                  <motion.div
                    animate={
                      iconState !== 'link'
                        ? { x: -20, opacity: 0.15, filter: 'blur(6px)', scale: 0.9 }
                        : { x: -80, opacity: 1, filter: 'blur(0px)', scale: 1 }
                    }
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute z-10"
                  >
                    <div className="relative w-[5.5rem] h-[5.5rem] rounded-full border-[3px] border-[#0c0c0c] overflow-hidden bg-nw-surface shadow-2xl ring-1 ring-white/10">
                      {user?.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt="NullWave avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-nw-accent text-white font-black text-3xl">
                          {user?.displayName?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                    {/* NullWave badge */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-8 h-8 rounded-full bg-[#0c0c0c] border border-white/10 flex items-center justify-center shadow-lg">
                      <Music size={14} className="text-nw-accent" />
                    </div>
                  </motion.div>

                  {/* ── Central Animated Icon ──────────────────────────────── */}
                  <div className="absolute z-30 flex items-center justify-center w-14 h-14">
                    {/* Pulsing glow ring behind the icon */}
                    <AnimatePresence>
                      {iconState !== 'link' && (
                        <motion.div
                          initial={{ scale: 0.6, opacity: 0 }}
                          animate={{
                            scale: [1, 1.6, 1],
                            opacity: [0.5, 0, 0.5],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                          exit={{ opacity: 0, scale: 0 }}
                          className={`absolute inset-0 rounded-full ${
                            iconState === 'check'
                              ? 'bg-nw-success/20'
                              : 'bg-nw-danger/20'
                          }`}
                        />
                      )}
                    </AnimatePresence>

                    <motion.div
                      animate={{
                        scale: iconState !== 'link' ? 1.15 : 1,
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className={`relative flex items-center justify-center w-14 h-14 rounded-full border backdrop-blur-md shadow-2xl transition-colors duration-500 ${
                        iconState === 'check'
                          ? 'bg-nw-success/15 border-nw-success/30'
                          : iconState === 'cross'
                            ? 'bg-nw-danger/15 border-nw-danger/30'
                            : 'bg-[#161616] border-white/10'
                      }`}
                    >
                      <AnimatePresence mode="wait">
                        {iconState === 'link' && (
                          <motion.div
                            key="link"
                            variants={iconMorphVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                          >
                            <Link2
                              size={24}
                              className="text-nw-text-secondary"
                            />
                          </motion.div>
                        )}
                        {iconState === 'check' && (
                          <motion.div
                            key="check"
                            variants={iconMorphVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                          >
                            <Check
                              size={28}
                              className="text-nw-success drop-shadow-[0_0_12px_rgba(34,197,94,0.6)]"
                              strokeWidth={3}
                            />
                          </motion.div>
                        )}
                        {iconState === 'cross' && (
                          <motion.div
                            key="cross"
                            variants={iconMorphVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                          >
                            <X
                              size={28}
                              className="text-nw-danger drop-shadow-[0_0_12px_rgba(239,68,68,0.6)]"
                              strokeWidth={3}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>

                  {/* Facebook Avatar */}
                  <motion.div
                    animate={
                      iconState !== 'link'
                        ? { x: 20, opacity: 0.15, filter: 'blur(6px)', scale: 0.9 }
                        : { x: 80, opacity: 1, filter: 'blur(0px)', scale: 1 }
                    }
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute z-10"
                  >
                    <div className="relative w-[5.5rem] h-[5.5rem] rounded-full border-[3px] border-[#0c0c0c] overflow-hidden bg-white shadow-2xl ring-1 ring-white/10">
                      {fbPfp ? (
                        <img
                          src={fbPfp}
                          alt="Facebook avatar"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            console.warn('Failed to load Facebook PFP from URL:', fbPfp)
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#1877F2] text-white">
                          <FaFacebook size={48} />
                        </div>
                      )}
                    </div>
                    {/* Facebook badge */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-8 h-8 rounded-full bg-[#1877F2] border-[2px] border-[#0c0c0c] flex items-center justify-center shadow-lg text-white">
                      <FaFacebook size={15} />
                    </div>
                  </motion.div>
                </div>

                {/* ── Info / Status Message ────────────────────────────────── */}
                <AnimatePresence mode="wait">
                  {iconState === 'link' && (
                    <motion.div
                      key="prompt"
                      variants={messageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="h-20 flex items-center justify-center mb-6"
                    >
                      <p className="text-[15px] font-medium text-nw-text-secondary leading-relaxed px-2">
                        Are you sure you want to connect your NullWave account
                        associated with{' '}
                        <span className="text-white font-bold">{userEmail}</span>{' '}
                        with your Facebook profile{' '}
                        <span className="text-[#1877F2] font-bold">{fbName}</span>?
                      </p>
                    </motion.div>
                  )}
                  {iconState === 'check' && (
                    <motion.div
                      key="success"
                      variants={messageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="h-20 flex items-center justify-center mb-6"
                    >
                      <span className="text-nw-success font-black text-xl tracking-wide drop-shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                        Linking successful!
                      </span>
                    </motion.div>
                  )}
                  {iconState === 'cross' && (
                    <motion.div
                      key="cancelled"
                      variants={messageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="h-20 flex items-center justify-center mb-6"
                    >
                      <span className="text-nw-danger font-black text-xl tracking-wide drop-shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                        Facebook linking cancelled by user
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── Action Buttons ──────────────────────────────────────── */}
                <div className="flex w-full gap-4 mt-2">
                  {/* Cancel button */}
                  <motion.button
                    onClick={handleNahBro}
                    disabled={isProcessing}
                    whileHover={!isProcessing ? { scale: 1.02 } : undefined}
                    whileTap={!isProcessing ? { scale: 0.97 } : undefined}
                    className="relative flex-1 py-4 px-4 bg-[#1a1a1a] hover:bg-nw-danger/15 text-nw-danger font-black uppercase tracking-widest text-sm rounded-2xl border border-nw-danger/20 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed group overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-nw-danger/0 via-nw-danger/10 to-nw-danger/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <span className="relative z-10">NAH BRO!</span>
                  </motion.button>

                  {/* Confirm button */}
                  <motion.button
                    onClick={handleHellYeah}
                    disabled={isProcessing}
                    whileHover={!isProcessing ? { scale: 1.02 } : undefined}
                    whileTap={!isProcessing ? { scale: 0.97 } : undefined}
                    className="relative flex-1 py-4 px-4 bg-nw-accent hover:bg-nw-accent-hover text-[#000] font-black uppercase tracking-widest text-sm rounded-2xl shadow-[0_0_24px_rgba(56,189,248,0.25)] hover:shadow-[0_0_36px_rgba(56,189,248,0.4)] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed group overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <span className="relative z-10">HELL YEAHH!</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
