import { NavLink, useLocation } from 'react-router-dom'
import { Home, Search, Library, ListMusic } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const tabs = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/library', icon: Library, label: 'Library' },
  { to: '/queue', icon: ListMusic, label: 'Queue' },
]

export function MobileNavBar() {
  const location = useLocation()

  return (
    <nav
      className={cn(
        'lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-nw-surface/90 backdrop-blur-xl border-t border-nw-border-subtle',
        'transition-all duration-300'
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.to
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className="flex flex-col items-center justify-center gap-0.5 w-16 h-full relative"
            >
              <tab.icon
                size={20}
                className={cn(
                  'transition-colors duration-200',
                  isActive ? 'text-nw-accent' : 'text-nw-text-tertiary'
                )}
              />
              <span
                className={cn(
                  'text-[10px] font-medium transition-colors duration-200',
                  isActive ? 'text-nw-accent' : 'text-nw-text-tertiary'
                )}
              >
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-active"
                  className="absolute -top-0.5 w-8 h-0.5 rounded-full bg-nw-accent"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
