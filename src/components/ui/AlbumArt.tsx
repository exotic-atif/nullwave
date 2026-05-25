import { useMemo } from 'react'
import { stringToGradient } from '@/lib/utils'

interface AlbumArtProps {
  src?: string
  alt: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero'
  className?: string
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  showShadow?: boolean
}

const sizeMap = {
  xs: 'w-8 h-8',
  sm: 'w-10 h-10',
  md: 'w-12 h-12',
  lg: 'w-14 h-14',
  xl: 'w-40 h-40',
  hero: 'w-64 h-64',
}

const roundedMap = {
  sm: 'rounded-md',
  md: 'rounded-lg',
  lg: 'rounded-xl',
  xl: 'rounded-2xl',
  '2xl': 'rounded-3xl',
  full: 'rounded-full',
}

export function AlbumArt({
  src,
  alt,
  size = 'md',
  className = '',
  rounded = 'lg',
  showShadow = false,
}: AlbumArtProps) {
  const gradient = useMemo(() => stringToGradient(alt), [alt])

  const initial = alt.charAt(0).toUpperCase()

  return (
    <div
      className={`relative flex-shrink-0 overflow-hidden ${sizeMap[size]} ${roundedMap[rounded]} ${className} ${
        showShadow ? 'shadow-2xl shadow-black/40' : ''
      }`}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ background: gradient }}
        >
          <span
            className={`font-display font-bold text-white/70 ${
              size === 'hero'
                ? 'text-5xl'
                : size === 'xl'
                  ? 'text-3xl'
                  : size === 'lg'
                    ? 'text-lg'
                    : size === 'md'
                      ? 'text-sm'
                      : 'text-xs'
            }`}
          >
            {initial}
          </span>
        </div>
      )}

      {/* Subtle inner glow */}
      <div className="absolute inset-0 ring-1 ring-inset ring-white/5 pointer-events-none" style={{ borderRadius: 'inherit' }} />
    </div>
  )
}
