import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ReactNode } from 'react'

export interface MenuItem {
  label: string
  icon?: ReactNode
  onClick: () => void
  danger?: boolean
  disabled?: boolean
}

interface ContextMenuProps {
  isOpen: boolean
  position: { x: number; y: number }
  items: MenuItem[]
  onClose: () => void
}

export function ContextMenu({ isOpen, position, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    // Delay listener to avoid closing immediately from the same click
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClick)
      document.addEventListener('keydown', handleEscape)
    }, 10)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  // Adjust position to keep menu within viewport
  const adjustedPosition = { ...position }
  if (typeof window !== 'undefined') {
    const menuWidth = 200
    const menuHeight = items.length * 40 + 16
    if (position.x + menuWidth > window.innerWidth) {
      adjustedPosition.x = position.x - menuWidth
    }
    if (position.y + menuHeight > window.innerHeight) {
      adjustedPosition.y = position.y - menuHeight
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.92, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: -4 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="fixed z-[100] min-w-[180px] py-1.5 rounded-xl bg-nw-surface/90 backdrop-blur-3xl shadow-2xl shadow-black/50 border border-nw-border-subtle overflow-hidden"
          style={{
            left: adjustedPosition.x,
            top: adjustedPosition.y,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")`,
          }}
        >
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => {
                if (!item.disabled) {
                  item.onClick()
                  onClose()
                }
              }}
              disabled={item.disabled}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-sm transition-colors duration-150
                ${item.danger
                  ? 'text-nw-danger/80 hover:text-nw-danger hover:bg-nw-danger/5'
                  : item.disabled
                    ? 'text-nw-muted cursor-not-allowed'
                    : 'text-nw-text-secondary hover:text-nw-text hover:bg-white/[0.04]'
                }`}
            >
              {item.icon && (
                <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                  {item.icon}
                </span>
              )}
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
