import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Track } from '@/types'
import { AlbumArt } from './AlbumArt'
import { usePlayerStore, useQueueStore, useAuthStore, useLikedStore } from '@/store'
import { Play, MoreHorizontal, ListPlus, Heart, PlayCircle, Plus, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { ContextMenu } from './ContextMenu'
import { useContextMenu } from '@/hooks/useContextMenu'
import { PlaylistModal } from './PlaylistModal'

interface TrackRowProps {
  track: Track
  index?: number
  showIndex?: boolean
  showAlbum?: boolean
  className?: string
  playlistId?: string
  onRemove?: (trackId: string) => void
}

export function TrackRow({ track, index, showIndex = false, showAlbum = true, className, playlistId, onRemove }: TrackRowProps) {
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false)
  const { currentTrack, isPlaying, setTrack, togglePlay } = usePlayerStore()
  const { addToQueue } = useQueueStore()
  const user = useAuthStore((s) => s.user)
  const { toggle, isLiked } = useLikedStore()
  const isActive = currentTrack?.id === track.id
  const liked = isLiked(track.id)
  const { isOpen, position, openContextMenu, openFromButton, close } = useContextMenu()

  const handleClick = () => {
    if (isActive) {
      togglePlay()
    } else {
      setTrack(track)
    }
  }

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const menuItems = [
    {
      label: 'Play now',
      icon: <PlayCircle size={14} />,
      onClick: () => setTrack(track),
    },
    {
      label: 'Add to queue',
      icon: <ListPlus size={14} />,
      onClick: () => addToQueue(track),
    },
    {
      label: liked ? 'Remove from liked' : 'Add to liked songs',
      icon: <Heart size={14} fill={liked ? 'currentColor' : 'none'} />,
      onClick: () => { if (user) toggle(user.id, track) },
    },
    {
      label: 'Add to playlist',
      icon: <Plus size={14} />,
      onClick: () => setIsPlaylistModalOpen(true),
    },
  ]

  if (playlistId && onRemove) {
    menuItems.push({
      label: 'Remove from playlist',
      icon: <Trash2 size={14} className="text-nw-danger" />,
      onClick: () => onRemove(track.id),
    })
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: (index || 0) * 0.03 }}
        onClick={handleClick}
        onContextMenu={openContextMenu}
        className={cn(
          'group flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 select-none',
          'hover:bg-white/[0.04]',
          isActive && 'bg-nw-accent-dim',
          className
        )}
      >
        {/* Index / Play indicator */}
        <div className="w-6 flex items-center justify-center flex-shrink-0">
          {isActive && isPlaying ? (
            <div className="flex items-end gap-[2px] h-3">
              <span className="w-[3px] bg-nw-accent rounded-full animate-[nw-bounce-subtle_0.6s_ease-in-out_infinite]" style={{ height: '60%' }} />
              <span className="w-[3px] bg-nw-accent rounded-full animate-[nw-bounce-subtle_0.6s_ease-in-out_0.2s_infinite]" style={{ height: '100%' }} />
              <span className="w-[3px] bg-nw-accent rounded-full animate-[nw-bounce-subtle_0.6s_ease-in-out_0.4s_infinite]" style={{ height: '40%' }} />
            </div>
          ) : (
            <>
              <span className={cn(
                'text-xs tabular-nums group-hover:hidden',
                isActive ? 'text-nw-accent' : 'text-nw-text-tertiary'
              )}>
                {showIndex ? index : ''}
              </span>
              <span className="hidden group-hover:flex text-nw-text">
                <Play size={14} fill="currentColor" />
              </span>
            </>
          )}
        </div>

        {/* Album Art */}
        <AlbumArt src={track.coverUrl} alt={track.album} size="sm" rounded="sm" />

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-sm font-medium truncate',
            isActive ? 'text-nw-accent' : 'text-nw-text'
          )}>
            {track.title}
          </p>
          <p className="text-xs text-nw-text-tertiary truncate">
            {track.artist}
          </p>
        </div>

        {/* Album */}
        {showAlbum && (
          <p className="hidden md:block text-xs text-nw-text-tertiary truncate max-w-[200px]">
            {track.album}
          </p>
        )}

        {/* Duration + More */}
        <div className="flex items-center gap-2">
          <span className="text-xs tabular-nums text-nw-text-tertiary">
            {formatDuration(track.duration)}
          </span>
          <button
            className="opacity-0 group-hover:opacity-100 transition-opacity text-nw-text-secondary hover:text-nw-text"
            onClick={openFromButton}
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
      </motion.div>

      <ContextMenu
        isOpen={isOpen}
        position={position}
        items={menuItems}
        onClose={close}
      />

      {isPlaylistModalOpen && (
        <PlaylistModal
          isOpen={isPlaylistModalOpen}
          onClose={() => setIsPlaylistModalOpen(false)}
          trackToAdd={track}
        />
      )}
    </>
  )
}
