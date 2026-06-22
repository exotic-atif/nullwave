import { create } from 'zustand'
import type { Track, RepeatMode } from '@/types'

interface PlayerStore {
  // State
  currentTrack: Track | null
  isPlaying: boolean
  volume: number
  progress: number
  duration: number
  isMuted: boolean
  isShuffled: boolean
  repeatMode: RepeatMode
  isLoadingStream: boolean

  // Actions
  setTrack: (track: Track) => void
  play: () => void
  pause: () => void
  togglePlay: () => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  setProgress: (progress: number) => void
  setDuration: (duration: number) => void
  toggleShuffle: () => void
  cycleRepeat: () => void
  setIsLoadingStream: (isLoading: boolean) => void
  reset: () => void
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  currentTrack: null,
  isPlaying: false,
  volume: 0.75,
  progress: 0,
  duration: 0,
  isMuted: false,
  isShuffled: true,
  repeatMode: 'off',
  isLoadingStream: false,

  setTrack: (track) =>
    set({
      currentTrack: track,
      isPlaying: true,
      isLoadingStream: true, // Optimistically show loading state when switching tracks
      progress: 0,
      duration: track.duration,
    }),

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  setVolume: (volume) => set({ volume, isMuted: volume === 0 }),
  toggleMute: () =>
    set((state) => ({
      isMuted: !state.isMuted,
    })),

  setProgress: (progress) => set({ progress }),
  setDuration: (duration) => set({ duration }),
  toggleShuffle: () => set((state) => ({ isShuffled: !state.isShuffled })),

  cycleRepeat: () =>
    set((state) => {
      const modes: RepeatMode[] = ['off', 'all', 'one']
      const currentIndex = modes.indexOf(state.repeatMode)
      return { repeatMode: modes[(currentIndex + 1) % modes.length] }
    }),

  setIsLoadingStream: (isLoadingStream) => set({ isLoadingStream }),

  reset: () =>
    set({
      currentTrack: null,
      isPlaying: false,
      isLoadingStream: false,
      progress: 0,
      duration: 0,
    }),
}))
