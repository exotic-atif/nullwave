import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'ghost' | 'filled' | 'accent'
}

const sizeStyles = {
  sm: 'w-7 h-7 text-sm',
  md: 'w-9 h-9 text-base',
  lg: 'w-11 h-11 text-lg',
}

export function IconButton({
  children,
  active = false,
  size = 'md',
  variant = 'ghost',
  className,
  ...props
}: IconButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer',
        sizeStyles[size],
        variant === 'ghost' && [
          'text-nw-text-secondary hover:text-nw-text hover:bg-white/5',
          active && 'text-nw-accent hover:text-nw-accent-hover',
        ],
        variant === 'filled' && [
          'bg-white/10 text-nw-text hover:bg-white/15',
          active && 'bg-nw-accent text-white',
        ],
        variant === 'accent' && [
          'bg-nw-accent text-white hover:bg-nw-accent-hover shadow-lg shadow-nw-accent-glow/20',
        ],
        'disabled:opacity-40 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
