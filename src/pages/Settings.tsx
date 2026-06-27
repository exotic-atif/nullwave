import { useThemeStore, useAuthStore } from '@/store'
import { motion } from 'framer-motion'
import { Moon, Sun, LogOut, User, Palette, Volume2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import { RoleBadge } from '@/components/ui/RoleBadge'

export function SettingsPage() {
  const { theme, toggleTheme } = useThemeStore()
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="px-4 md:px-8 py-6 max-w-2xl space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl md:text-3xl font-display font-bold text-nw-text tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-nw-text-tertiary mt-1">Customize your experience</p>
      </motion.div>

      {/* Profile */}
      {isAuthenticated && user && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-5 rounded-2xl bg-nw-surface/40 border border-nw-border-subtle"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-nw-accent/30 to-nw-accent-glow/20 flex items-center justify-center ring-2 ring-nw-accent-ring overflow-hidden">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
              ) : (
                <User size={22} className="text-nw-accent" />
              )}
            </div>
            <div>
              <p className="font-medium text-nw-text">{user.displayName}</p>
              <p className="text-sm text-nw-text-tertiary">{user.email}</p>
              <div className="mt-2">
                <RoleBadge role={user.role} />
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* Appearance */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3"
      >
        <div className="flex items-center gap-2 mb-1">
          <Palette size={16} className="text-nw-text-tertiary" />
          <h2 className="text-sm font-semibold text-nw-text uppercase tracking-wider">
            Appearance
          </h2>
        </div>

        <div className="p-4 rounded-2xl bg-nw-surface/40 border border-nw-border-subtle">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-nw-text">Theme</p>
              <p className="text-xs text-nw-text-tertiary mt-0.5">
                Currently using {theme} mode
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className={cn(
                'relative w-14 h-7 rounded-full transition-colors duration-300 cursor-pointer',
                theme === 'dark' ? 'bg-nw-accent/20' : 'bg-nw-accent'
              )}
            >
              <motion.div
                layout
                className={cn(
                  'absolute top-0.5 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-md',
                  theme === 'dark' ? 'left-0.5' : 'left-[calc(100%-1.625rem)]'
                )}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                {theme === 'dark' ? (
                  <Moon size={13} className="text-nw-accent" />
                ) : (
                  <Sun size={13} className="text-amber-500" />
                )}
              </motion.div>
            </button>
          </div>
        </div>
      </motion.section>

      {/* Playback */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-3"
      >
        <div className="flex items-center gap-2 mb-1">
          <Volume2 size={16} className="text-nw-text-tertiary" />
          <h2 className="text-sm font-semibold text-nw-text uppercase tracking-wider">
            Playback
          </h2>
        </div>

        <div className="space-y-2">
          <SettingRow
            label="Crossfade"
            description="Smooth transitions between tracks"
            trailing={
              <span className="text-xs text-nw-text-tertiary bg-nw-surface px-2 py-1 rounded-md">
                Coming soon
              </span>
            }
          />
          <SettingRow
            label="Audio Quality"
            description="Set streaming quality"
            trailing={
              <span className="text-xs text-nw-accent bg-nw-accent-dim px-2 py-1 rounded-md">
                High (320kbps)
              </span>
            }
          />
          <SettingRow
            label="Normalize Volume"
            description="Keep volume consistent across tracks"
            trailing={
              <span className="text-xs text-nw-text-tertiary bg-nw-surface px-2 py-1 rounded-md">
                Coming soon
              </span>
            }
          />
        </div>
      </motion.section>

      {/* About */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <div className="flex items-center gap-2 mb-1">
          <Info size={16} className="text-nw-text-tertiary" />
          <h2 className="text-sm font-semibold text-nw-text uppercase tracking-wider">
            About
          </h2>
        </div>

        <div className="p-4 rounded-2xl bg-nw-surface/40 border border-nw-border-subtle space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-nw-text-secondary">Version</span>
            <span className="text-nw-text font-medium">Beta 1.2.7</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <span className="text-nw-text-secondary">Access</span>
            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-nw-accent/20 text-nw-accent">
              Invite Only
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-nw-text-secondary">Build</span>
            <span className="text-nw-text tabular-nums">2026.06.17</span>
          </div>
        </div>
      </motion.section>

      {/* Logout */}
      {isAuthenticated && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-nw-danger/70 hover:text-nw-danger hover:bg-nw-danger/5 rounded-xl transition-all duration-200 w-full"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </motion.div>
      )}

      <div className="h-4" />
    </div>
  )
}

// Helper component
function SettingRow({
  label,
  description,
  trailing,
}: {
  label: string
  description: string
  trailing: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-nw-surface/40 border border-nw-border-subtle">
      <div>
        <p className="text-sm font-medium text-nw-text">{label}</p>
        <p className="text-xs text-nw-text-tertiary mt-0.5">{description}</p>
      </div>
      {trailing}
    </div>
  )
}
