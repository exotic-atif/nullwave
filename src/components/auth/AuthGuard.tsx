import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { Loader2 } from 'lucide-react'

export function AuthGuard() {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-nw-black">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={28} className="text-nw-accent animate-spin" />
          <p className="text-xs text-nw-text-tertiary tracking-wider uppercase">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
