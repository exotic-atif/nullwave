import { useQueueStore, usePlayerStore } from '@/store'
import { TrackRow } from '@/components/ui/TrackRow'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { motion, Reorder } from 'framer-motion'
import { ListMusic, Play, Trash2 } from 'lucide-react'
import { AlbumArt } from '@/components/ui/AlbumArt'

export function QueuePage() {
  const { queue, history, clearQueue, clearHistory, reorderQueue } = useQueueStore()
  const currentTrack = usePlayerStore((s) => s.currentTrack)

  return (
    <div className="px-4 md:px-8 py-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl md:text-3xl font-display font-bold text-nw-text tracking-tight">
          Queue
        </h1>
        <p className="text-sm text-nw-text-tertiary mt-1">
          Manage your upcoming tracks
        </p>
      </motion.div>

      {/* Now Playing */}
      {currentTrack && (
        <section>
          <SectionHeader title="Now Playing" />
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 p-4 rounded-xl bg-nw-accent-dim border border-nw-accent-ring"
          >
            <div className="relative">
              <AlbumArt
                src={currentTrack.coverUrl}
                alt={currentTrack.album}
                size="xl"
                rounded="xl"
                showShadow
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-nw-black/60 ring-2 ring-nw-accent/30" />
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-lg font-display font-semibold text-nw-accent truncate">
                {currentTrack.title}
              </p>
              <p className="text-sm text-nw-text-secondary truncate">
                {currentTrack.artist} • {currentTrack.album}
              </p>
            </div>
          </motion.div>
        </section>
      )}

      {/* Up Next */}
      <section>
        <SectionHeader
          title="Up Next"
          subtitle={`${queue.length} tracks`}
          action={
            queue.length > 0 ? (
              <button
                onClick={clearQueue}
                className="text-xs text-nw-danger/70 hover:text-nw-danger flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-nw-border-subtle hover:border-nw-danger/20 transition-all duration-200"
              >
                <Trash2 size={12} />
                Clear
              </button>
            ) : undefined
          }
        />
        {queue.length > 0 ? (
          <Reorder.Group axis="y" values={queue} onReorder={reorderQueue} className="space-y-0.5">
            {queue.map((track, i) => (
              <Reorder.Item 
                key={track.id + '-' + i} 
                value={track}
                className="cursor-grab active:cursor-grabbing relative"
                whileDrag={{ scale: 1.02, zIndex: 10, opacity: 0.9 }}
              >
                <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-nw-text-tertiary">
                   {/* Optional grip handle could go here, but TrackRow handles hover well */}
                </div>
                <TrackRow track={track} index={i + 1} showIndex />
              </Reorder.Item>
            ))}
          </Reorder.Group>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center py-16 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-nw-surface flex items-center justify-center mb-4">
              <ListMusic size={24} className="text-nw-muted" />
            </div>
            <p className="text-nw-text-secondary text-sm font-medium">Queue is empty</p>
            <p className="text-xs text-nw-text-tertiary mt-1 max-w-[240px]">
              Right-click any track and select "Add to queue" to build your playlist
            </p>
          </motion.div>
        )}
      </section>

      {/* Recently Played */}
      <section>
        <SectionHeader
          title="Recently Played"
          subtitle={`${history.length} tracks`}
          action={
            history.length > 0 ? (
              <button
                onClick={clearHistory}
                className="text-xs text-nw-text-tertiary hover:text-nw-text transition-colors"
              >
                Clear history
              </button>
            ) : undefined
          }
        />
        {history.length > 0 ? (
          <div className="space-y-0.5">
            {history
              .slice()
              .reverse()
              .map((track, i) => (
                <TrackRow key={`hist-${track.id}-${i}`} track={track} index={i + 1} showIndex />
              ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 py-8 text-center justify-center">
            <Play size={14} className="text-nw-muted" />
            <p className="text-xs text-nw-text-tertiary">No playback history yet</p>
          </div>
        )}
      </section>
    </div>
  )
}
