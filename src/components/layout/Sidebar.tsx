import { NavLink, useLocation } from 'react-router-dom'
import { Home, Search, Library, ListMusic, Settings, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/library', icon: Library, label: 'Library' },
  { to: '/queue', icon: ListMusic, label: 'Queue' },
]

const bottomItems = [
  { to: '/settings', icon: Settings, label: 'Settings' },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 pt-6 pb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/favicon.svg" alt="Nullwave" className="w-8 h-8" />
            <span className="font-display text-lg font-bold tracking-tight text-nw-text">
              Nullwave
            </span>
          </div>
          {/* Mobile close */}
          <button
            onClick={onClose}
            className="lg:hidden text-nw-text-secondary hover:text-nw-text transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-nw-muted">
          Navigate
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
              location.pathname === item.to
                ? 'bg-white/[0.06] text-nw-text'
                : 'text-nw-text-secondary hover:text-nw-text hover:bg-white/[0.03]'
            )}
          >
            <item.icon
              size={18}
              className={cn(
                'transition-colors duration-200',
                location.pathname === item.to
                  ? 'text-nw-accent'
                  : 'text-nw-text-tertiary group-hover:text-nw-text-secondary'
              )}
            />
            <span>{item.label}</span>
            {location.pathname === item.to && (
              <motion.div
                layoutId="sidebar-active"
                className="ml-auto w-1 h-1 rounded-full bg-nw-accent"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-24 lg:pb-4 mt-auto border-t border-nw-border-subtle pt-4 space-y-0.5">
        {bottomItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
              location.pathname === item.to
                ? 'bg-white/[0.06] text-nw-text'
                : 'text-nw-text-secondary hover:text-nw-text hover:bg-white/[0.03]'
            )}
          >
            <item.icon
              size={18}
              className={cn(
                'transition-colors duration-200',
                location.pathname === item.to
                  ? 'text-nw-accent'
                  : 'text-nw-text-tertiary group-hover:text-nw-text-secondary'
              )}
            />
            <span>{item.label}</span>
          </NavLink>
        ))}

        {/* Version tag */}
        <div className="px-5 mt-auto pt-4 pb-2 text-center opacity-40 hover:opacity-100 transition-opacity">
          <p className="text-[10px] text-nw-muted">nullwave v1.1.10</p>
          <p className="text-[10px] text-nw-muted/50">invite only</p>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-[240px] h-full bg-nw-void/80 border-r border-nw-border-subtle flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-[260px] bg-nw-void z-50 shadow-2xl"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
