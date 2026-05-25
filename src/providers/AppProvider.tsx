import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/routes'
import { useThemeInit } from '@/hooks/useThemeInit'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useAuthStore, useLikedStore } from '@/store'

export function AppProvider() {
  useThemeInit()
  useKeyboardShortcuts()

  const init = useAuthStore((s) => s.init)
  const user = useAuthStore((s) => s.user)
  const fetchLiked = useLikedStore((s) => s.fetchLiked)

  // Restore auth session on mount
  useEffect(() => {
    init()
  }, [init])

  // Fetch liked songs when user is available
  useEffect(() => {
    if (user?.id) {
      fetchLiked(user.id)
    }
  }, [user?.id, fetchLiked])

  return <RouterProvider router={router} />
}
