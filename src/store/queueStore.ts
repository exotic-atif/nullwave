import { create } from 'zustand'
import type { Track } from '@/types'

interface QueueStore {
  queue: Track[]
  history: Track[]

  addToQueue: (track: Track) => void
  addMultipleToQueue: (tracks: Track[]) => void
  removeFromQueue: (trackId: string) => void
  clearQueue: () => void
  playNext: () => Track | null
  playPrevious: () => Track | null
  moveInQueue: (fromIndex: number, toIndex: number) => void
  addToHistory: (track: Track) => void
  clearHistory: () => void
}

export const useQueueStore = create<QueueStore>((set, get) => ({
  queue: [],
  history: [],

  addToQueue: (track) =>
    set((state) => ({
      queue: [...state.queue, track],
    })),

  addMultipleToQueue: (tracks) =>
    set((state) => ({
      queue: [...state.queue, ...tracks],
    })),

  removeFromQueue: (trackId) =>
    set((state) => ({
      queue: state.queue.filter((t) => t.id !== trackId),
    })),

  clearQueue: () => set({ queue: [] }),

  playNext: () => {
    const { queue } = get()
    if (queue.length === 0) return null
    const nextTrack = queue[0]
    set({ queue: queue.slice(1) })
    return nextTrack
  },

  playPrevious: () => {
    const { history } = get()
    if (history.length === 0) return null
    const prevTrack = history[history.length - 1]
    set({ history: history.slice(0, -1) })
    return prevTrack
  },

  moveInQueue: (fromIndex, toIndex) =>
    set((state) => {
      const newQueue = [...state.queue]
      const [moved] = newQueue.splice(fromIndex, 1)
      newQueue.splice(toIndex, 0, moved)
      return { queue: newQueue }
    }),

  addToHistory: (track) =>
    set((state) => ({
      history: [...state.history.slice(-49), track],
    })),

  clearHistory: () => set({ history: [] }),
}))
