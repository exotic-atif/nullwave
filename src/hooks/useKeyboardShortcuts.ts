import { useCallback, useEffect } from 'react'
import { usePlayerStore, useQueueStore } from '@/store'

/**
 * Keyboard shortcuts for the music player
 *
 * Space        — Play / Pause
 * Shift+N      — Next track
 * Shift+P      — Previous track
 * Shift+→      — Next track (alt)
 * Shift+←      — Previous track (alt)
 * Shift+↑      — Volume up
 * Shift+↓      — Volume down
 * Shift+M      — Mute toggle
 */
export function useKeyboardShortcuts() {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const target = e.target as HTMLElement
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return
    }

    const { currentTrack, togglePlay, setVolume, volume, toggleMute, setProgress, progress } =
      usePlayerStore.getState()
    const { playNext, playPrevious, addToHistory } = useQueueStore.getState()

    const goNext = () => {
      if (currentTrack) {
        addToHistory(currentTrack)
      }
      const next = playNext()
      if (next) usePlayerStore.getState().setTrack(next)
    }

    const goPrevious = () => {
      if (progress > 3) {
        setProgress(0)
        return
      }
      const prev = playPrevious()
      if (prev) usePlayerStore.getState().setTrack(prev)
    }

    switch (e.code) {
      case 'Space':
        e.preventDefault()
        if (currentTrack) {
          togglePlay()
        }
        break

      // Shift+N → Next track
      case 'KeyN':
        if (e.shiftKey) {
          e.preventDefault()
          goNext()
        }
        break

      // Shift+P → Previous track
      case 'KeyP':
        if (e.shiftKey) {
          e.preventDefault()
          goPrevious()
        }
        break

      // Shift+→ → Next track (alt shortcut)
      case 'ArrowRight':
        if (e.shiftKey && currentTrack) {
          e.preventDefault()
          goNext()
        }
        break

      // Shift+← → Previous track (alt shortcut)
      case 'ArrowLeft':
        if (e.shiftKey) {
          e.preventDefault()
          goPrevious()
        }
        break

      case 'ArrowUp':
        if (e.shiftKey) {
          e.preventDefault()
          setVolume(Math.min(1, volume + 0.1))
        }
        break

      case 'ArrowDown':
        if (e.shiftKey) {
          e.preventDefault()
          setVolume(Math.max(0, volume - 0.1))
        }
        break

      case 'KeyM':
        if (e.shiftKey) {
          e.preventDefault()
          toggleMute()
        }
        break
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
