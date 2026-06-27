import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Track } from '@/types'
import { addDislikedSong, removeDislikedSong, fetchDislikedSongs, removePlayHistoryItem } from '@/lib/supabase'
import { useAuthStore } from './authStore'

interface QueueStore {
  queue: Track[]
  history: Track[]

  addToQueue: (track: Track) => void
  addMultipleToQueue: (tracks: Track[]) => void
  removeFromQueue: (trackId: string) => void
  clearQueue: () => void
  setQueue: (tracks: Track[]) => void
  playNext: () => Track | null
  playPrevious: () => Track | null
  moveInQueue: (fromIndex: number, toIndex: number) => void
  reorderQueue: (newQueue: Track[]) => void
  addToHistory: (track: Track) => void
  removeFromHistory: (trackId: string) => void
  clearHistory: () => void
  dislikedTracks: Track[]
  addDislikedTrack: (track: Track) => void
  removeDislikedTrack: (trackId: string) => void
  fetchDislikedTracks: (userId: string) => Promise<void>
}

export const useQueueStore = create<QueueStore>()(
  persist(
    (set, get) => ({
      queue: [],
      history: [],
      dislikedTracks: [],

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

      setQueue: (tracks) =>
        set(() => ({
          queue: tracks,
        })),

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

      reorderQueue: (newQueue) => set({ queue: newQueue }),

      addToHistory: (track) =>
        set((state) => ({
          history: [...state.history.slice(-99), track],
        })),
        
      removeFromHistory: (trackId) => {
        set((state) => ({
          history: state.history.filter(t => t.id !== trackId),
        }))
        const user = useAuthStore.getState().user
        if (user) {
          removePlayHistoryItem(user.id, trackId)
        }
      },

      clearHistory: () => set({ history: [] }),

      addDislikedTrack: (track) => {
        set((state) => {
          if (state.dislikedTracks.some(t => t.id === track.id)) return state
          return { dislikedTracks: [...state.dislikedTracks, track] }
        })
        const user = useAuthStore.getState().user
        if (user) {
          addDislikedSong(user.id, track)
        }
      },

      removeDislikedTrack: (trackId) => {
        set((state) => ({
          dislikedTracks: state.dislikedTracks.filter(t => t.id !== trackId)
        }))
        const user = useAuthStore.getState().user
        if (user) {
          removeDislikedSong(user.id, trackId)
        }
      },

      fetchDislikedTracks: async (userId: string) => {
        const tracks = await fetchDislikedSongs(userId)
        set({ dislikedTracks: tracks })
      },
    }),
    {
      name: 'nw-queue-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist dislikedTracks and history, we don't want to persist the active queue between sessions to keep it fresh
      partialize: (state) => ({
        dislikedTracks: state.dislikedTracks,
        history: state.history
      }),
    }
  )
)
