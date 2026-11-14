import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { Loader2 } from 'lucide-react'

export function AuthGuard() {
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const location = useLocation()

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
    return <Navigate to="/login" state={{ from: location.pathname, search: location.search }} replace />
  }

  // Ensure unapproved users cannot bypass AuthGuard (Master Admin and Taniya are always exempt)
  const isPrivileged =
    (user?.email || '').toLowerCase() === 'mratif00007@gmail.com' ||
    user?.id === 'fkQeMnkZwcdfBqJv2wAQwwmDdzi1' ||
    user?.id === '53a2a0bb-77f3-46e0-a450-4dddfbd4e2dc' ||
    (user?.email || '').toLowerCase() === 'tya44239@gmail.com' ||
    user?.id === 'qhYRtYSbpsPDKT1zkXwOZ5CcgsY2' ||
    user?.id === '04e2ceee-cfc4-40eb-bcbf-db049e011356'

  if (user && !user.approved && !isPrivileged && location.pathname !== '/req-access') {
    const errorMsg = encodeURIComponent(`You don't have an account with the email ${user.email}. Request Access to use the app instead.`)
    return <Navigate to={`/req-access?complete_profile=true&error_msg=${errorMsg}`} replace />
  }

  return <Outlet />
}
