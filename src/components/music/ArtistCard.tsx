import type { Artist } from '@/types'
import { stringToGradient } from '@/lib/utils'
import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'

interface ArtistCardProps {
  artist: Artist
  index?: number
}

export function ArtistCard({ artist, index = 0 }: ArtistCardProps) {
  const gradient = useMemo(() => stringToGradient(artist.name), [artist.name])

  return (
    <Link to={`/artist/${encodeURIComponent(artist.name)}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.06, duration: 0.35 }}
        className="group flex flex-col items-center gap-3 p-4 cursor-pointer"
      >
        {/* Circular avatar */}
        <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden shadow-xl shadow-black/30 group-hover:shadow-nw-accent-glow/10 transition-shadow duration-500">
          {artist.imageUrl ? (
            <img src={artist.imageUrl} alt={artist.name} className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: gradient }}
            >
              <span className="text-2xl font-display font-bold text-white/60">
                {artist.name.charAt(0)}
              </span>
            </div>
          )}

          {/* Hover glow ring */}
          <div className="absolute inset-0 rounded-full ring-2 ring-transparent group-hover:ring-nw-accent/30 transition-all duration-500" />
        </div>

        <div className="text-center">
          <h3 className="text-sm font-medium text-nw-text group-hover:text-nw-accent transition-colors duration-200 truncate max-w-[120px]">
            {artist.name}
          </h3>
          <p className="text-[11px] text-nw-text-tertiary mt-0.5">Artist</p>
        </div>
      </motion.div>
    </Link>
  )
}
