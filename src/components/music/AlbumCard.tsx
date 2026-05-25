import type { Album } from '@/types'
import { AlbumArt } from '../ui/AlbumArt'
import { usePlayerStore, useQueueStore } from '@/store'
import { Play, ListPlus, PlayCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { ContextMenu } from '../ui/ContextMenu'
import { useContextMenu } from '@/hooks/useContextMenu'

interface AlbumCardProps {
  album: Album
  index?: number
}

export function AlbumCard({ album, index = 0 }: AlbumCardProps) {
  const setTrack = usePlayerStore((s) => s.setTrack)
  const addMultipleToQueue = useQueueStore((s) => s.addMultipleToQueue)
  const { isOpen, position, openContextMenu, close } = useContextMenu()

  const handlePlay = () => {
    if (album.tracks && album.tracks.length > 0) {
      setTrack(album.tracks[0])
    }
  }

  const menuItems = [
    {
      label: 'Play album',
      icon: <PlayCircle size={14} />,
      onClick: handlePlay,
    },
    {
      label: 'Add all to queue',
      icon: <ListPlus size={14} />,
      onClick: () => {
        if (album.tracks) addMultipleToQueue(album.tracks)
      },
      disabled: !album.tracks || album.tracks.length === 0,
    },
  ]

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.4 }}
        className="group flex flex-col gap-3 p-3 rounded-xl transition-all duration-300 hover:bg-white/[0.03] cursor-pointer"
        onClick={handlePlay}
        onContextMenu={openContextMenu}
      >
        {/* Cover */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl shadow-lg shadow-black/30">
          <AlbumArt
            src={album.coverUrl}
            alt={album.title}
            size="hero"
            rounded="xl"
            showShadow
            className="!w-full !h-full"
          />

          {/* Play overlay */}
          <div className="absolute inset-0 flex items-end justify-end p-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="w-11 h-11 bg-nw-accent rounded-full flex items-center justify-center shadow-xl shadow-nw-accent-glow/30 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <Play size={20} fill="white" className="text-white ml-0.5" />
            </div>
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>

        {/* Info */}
        <div className="space-y-0.5 min-w-0">
          <h3 className="text-sm font-medium text-nw-text truncate">{album.title}</h3>
          <p className="text-xs text-nw-text-tertiary truncate">
            {album.artist} • {album.year}
          </p>
        </div>
      </motion.div>

      <ContextMenu
        isOpen={isOpen}
        position={position}
        items={menuItems}
        onClose={close}
      />
    </>
  )
}
