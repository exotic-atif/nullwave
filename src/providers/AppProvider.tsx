import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/routes'
import { useThemeInit } from '@/hooks/useThemeInit'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useAuthStore, useLikedStore, useQueueStore } from '@/store'
import { Toaster } from 'sonner'

export function AppProvider() {
  useThemeInit()
  useKeyboardShortcuts()

  const init = useAuthStore((s) => s.init)
  const user = useAuthStore((s) => s.user)
  const fetchLiked = useLikedStore((s) => s.fetchLiked)
  const fetchDislikedTracks = useQueueStore((s) => s.fetchDislikedTracks)

  // Restore auth session on mount
  useEffect(() => {
    init()
  }, [init])

  // Fetch liked songs when user is available
  useEffect(() => {
    if (user?.id) {
      fetchLiked(user.id)
      fetchDislikedTracks(user.id)
    }
  }, [user?.id, fetchLiked, fetchDislikedTracks])

  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="bottom-center"
        offset={100}
        toastOptions={{
          style: {
            background: '#18181b',
            border: '1px solid rgba(255,255,255,0.06)',
            color: '#fafafa',
            fontSize: '13px',
            borderRadius: '12px',
            backdropFilter: 'blur(20px)',
          },
        }}
      />
    </>
  )
}
