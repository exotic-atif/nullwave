import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Track } from '@/types'
import { AlbumArt } from './AlbumArt'
import { usePlayerStore, useQueueStore, useAuthStore, useLikedStore } from '@/store'
import { Play, MoreHorizontal, ListPlus, Heart, PlayCircle, Plus, Trash2, User, Disc3, Share2, ThumbsDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { ContextMenu } from './ContextMenu'
import { useContextMenu } from '@/hooks/useContextMenu'
import { PlaylistModal } from './PlaylistModal'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

interface TrackRowProps {
  track: Track
  index?: number
  showIndex?: boolean
  showAlbum?: boolean
  className?: string
  playlistId?: string
  onRemove?: (trackId: string) => void
  onClick?: () => void
}

export function TrackRow({ track, index, showIndex = false, showAlbum = true, className, playlistId, onRemove, onClick }: TrackRowProps) {
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false)
  const { currentTrack, isPlaying, setTrack, togglePlay } = usePlayerStore()
  const { addToQueue, addDislikedTrack } = useQueueStore()
  const user = useAuthStore((s) => s.user)
  const { toggle, isLiked } = useLikedStore()
  const isActive = currentTrack?.id === track.id
  const liked = isLiked(track.id)
  const { isOpen, position, openContextMenu, openFromButton, close } = useContextMenu()
  const navigate = useNavigate()

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else if (isActive) {
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

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/search?q=${encodeURIComponent(track.title + ' ' + track.artist)}`
    const text = `Listen to ${track.title} by ${track.artist} on NullWave!`
    try {
      if (navigator.share) {
        await navigator.share({ title: `${track.title} — ${track.artist}`, text, url: shareUrl })
      } else {
        await navigator.clipboard.writeText(`${text}\n${shareUrl}`)
        toast.success('Link copied to clipboard!')
      }
    } catch {
      // User cancelled share dialog
    }
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
      onClick: () => { addToQueue(track); toast.success('Added to queue') },
    },
    {
      label: liked ? 'Remove from liked' : 'Add to liked songs',
      icon: (
        <motion.div
          animate={liked ? { scale: [1, 1.4, 1], color: ['#fff', '#ec4899', '#ec4899'] } : { scale: 1, color: '#fff' }}
          transition={{ duration: 0.3 }}
        >
          <Heart size={14} fill={liked ? '#ec4899' : 'none'} color={liked ? '#ec4899' : 'currentColor'} />
        </motion.div>
      ),
      onClick: () => { if (user) { toggle(user.id, track); toast.success(liked ? 'Removed from liked' : 'Added to liked songs') } },
    },
    {
      label: 'Add to playlist',
      icon: <Plus size={14} />,
      onClick: () => setIsPlaylistModalOpen(true),
    },
    {
      label: 'Go to Artist',
      icon: <User size={14} />,
      onClick: () => navigate(`/artist/${encodeURIComponent(track.artist.split(',')[0].trim())}`),
    },
    {
      label: 'Go to Album',
      icon: <Disc3 size={14} />,
      onClick: () => navigate(`/album/${encodeURIComponent(track.albumId)}`),
    },
    {
      label: 'Share',
      icon: <Share2 size={14} />,
      onClick: handleShare,
    },
    {
      label: 'Not for me',
      icon: <ThumbsDown size={14} />,
      onClick: () => {
        addDislikedTrack(track)
        if (isActive) {
          usePlayerStore.getState().play() 
        }
        toast.success("We won't suggest this song again")
      },
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

        {/* Duration + Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (user) {
                toggle(user.id, track)
                toast.success(liked ? 'Removed from liked' : 'Added to liked songs')
              } else {
                toast.error('Please log in to like songs')
              }
            }}
            className={cn(
              "transition-all duration-200",
              liked ? "opacity-100" : "opacity-0 group-hover:opacity-100 text-nw-text-secondary hover:text-white"
            )}
            title={liked ? "Unlike" : "Like"}
          >
            <motion.div
              whileTap={{ scale: 0.8 }}
              animate={liked ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Heart size={16} fill={liked ? '#ec4899' : 'none'} color={liked ? '#ec4899' : 'currentColor'} />
            </motion.div>
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation()
              addDislikedTrack(track)
              if (isActive) {
                usePlayerStore.getState().playNext()
              }
              toast.success("We won't suggest this song again")
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-nw-text-secondary hover:text-nw-danger p-1"
            title="Not for me"
          >
            <ThumbsDown size={14} />
          </button>
          <span className="text-xs tabular-nums text-nw-text-tertiary w-8 text-right hidden sm:block">
            {formatDuration(track.duration)}
          </span>
          <button
            className="opacity-0 group-hover:opacity-100 transition-opacity text-nw-text-secondary hover:text-nw-text p-1"
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
