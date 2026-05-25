import { create } from 'zustand'
import type { Track } from '@/types'
import { fetchLikedSongs, addLikedSong, removeLikedSong } from '@/lib/supabase'

interface LikedStore {
  likedIds: Set<string>
  likedTracks: Track[]
  isLoaded: boolean

  fetchLiked: (userId: string) => Promise<void>
  toggle: (userId: string, track: Track) => Promise<void>
  isLiked: (trackId: string) => boolean
  reset: () => void
}

export const useLikedStore = create<LikedStore>((set, get) => ({
  likedIds: new Set(),
  likedTracks: [],
  isLoaded: false,

  fetchLiked: async (userId: string) => {
    const results = await fetchLikedSongs(userId)
    const ids = new Set(results.map((r) => r.trackId))
    const tracks = results.map((r) => r.track)
    set({ likedIds: ids, likedTracks: tracks, isLoaded: true })
  },

  toggle: async (userId: string, track: Track) => {
    const { likedIds, likedTracks } = get()
    const isCurrentlyLiked = likedIds.has(track.id)

    if (isCurrentlyLiked) {
      // Optimistic remove
      const newIds = new Set(likedIds)
      newIds.delete(track.id)
      set({
        likedIds: newIds,
        likedTracks: likedTracks.filter((t) => t.id !== track.id),
      })
      await removeLikedSong(userId, track.id)
    } else {
      // Optimistic add
      const newIds = new Set(likedIds)
      newIds.add(track.id)
      set({
        likedIds: newIds,
        likedTracks: [track, ...likedTracks],
      })
      await addLikedSong(userId, track)
    }
  },

  isLiked: (trackId: string) => {
    return get().likedIds.has(trackId)
  },

  reset: () => set({ likedIds: new Set(), likedTracks: [], isLoaded: false }),
}))
