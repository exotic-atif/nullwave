import { Menu, ChevronLeft, ChevronRight, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { IconButton } from '../ui/IconButton'
import { useAuthStore } from '@/store'

interface TopbarProps {
  onMenuClick: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-4 md:px-6 h-14 glass-heavy">
      <div className="flex items-center gap-2">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="lg:hidden text-nw-text-secondary hover:text-nw-text transition-colors p-1"
        >
          <Menu size={22} />
        </button>

        {/* Navigation arrows */}
        <div className="hidden md:flex items-center gap-1">
          <IconButton onClick={() => navigate(-1)} size="sm">
            <ChevronLeft size={18} />
          </IconButton>
          <IconButton onClick={() => navigate(1)} size="sm">
            <ChevronRight size={18} />
          </IconButton>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {isAuthenticated && user ? (
          <div className="flex items-center gap-2.5">
            <span className="text-xs text-nw-text-secondary hidden sm:block">
              {user.displayName}
            </span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-nw-accent/30 to-nw-accent-glow/20 flex items-center justify-center ring-1 ring-nw-accent-ring overflow-hidden">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
              ) : (
                <User size={14} className="text-nw-accent" />
              )}
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="text-xs text-nw-text-secondary hover:text-nw-text px-3 py-1.5 rounded-full border border-nw-border hover:border-nw-accent/30 transition-all duration-200"
          >
            Sign in
          </button>
        )}
      </div>
    </header>
  )
}
