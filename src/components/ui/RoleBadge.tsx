import { ShieldCheck, Code, Bug, Star, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export type RoleType = 'admin' | 'helping_dev' | 'bug_tester' | 'contributor' | 'member'

interface RoleBadgeProps {
  role: RoleType | string
  className?: string
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const roleConfig = {
    admin: {
      label: 'Admin',
      icon: ShieldCheck,
      colorClass: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
    },
    helping_dev: {
      label: 'Helping Dev',
      icon: Code,
      colorClass: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30',
    },
    bug_tester: {
      label: 'Bug Tester',
      icon: Bug,
      colorClass: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30',
    },
    contributor: {
      label: 'Contributor',
      icon: Star,
      colorClass: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30',
    },
    member: {
      label: 'Member',
      icon: User,
      colorClass: 'bg-nw-surface text-nw-text-tertiary border border-nw-border-subtle',
    },
  }

  const config = roleConfig[(role as RoleType)] || roleConfig.member
  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider',
        config.colorClass,
        className
      )}
    >
      <Icon size={12} />
      {config.label}
    </span>
  )
}
