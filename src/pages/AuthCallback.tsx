import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, checkUserApproval } from '@/lib/supabase'
import { useAuthStore } from '@/store'
import { Loader2 } from 'lucide-react'

export function AuthCallback() {
  const navigate = useNavigate()
  const { init } = useAuthStore()
  const [message, setMessage] = useState('Completing sign in...')

  useEffect(() => {
    const processCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) throw error
        
        if (!session?.user) {
          navigate('/login')
          return
        }

        // Check if user is approved in our public.users table
        const isApproved = await checkUserApproval(session.user.id)

        if (isApproved) {
          setMessage('Welcome back!')
          // Initialize auth store to update global state and fetch profile
          await init()
          navigate('/', { replace: true })
        } else {
          // If not approved, sign out so they don't have an active session
          setMessage('Account pending approval...')
          await supabase.auth.signOut()
          // Redirect to request access page with pending state
          navigate('/req-access?status=pending', { replace: true })
        }
      } catch (err) {
        console.error('Callback error:', err)
        navigate('/login')
      }
    }

    processCallback()
  }, [navigate, init])

  return (
    <div className="h-[100dvh] flex flex-col items-center justify-center bg-nw-black">
      <Loader2 size={32} className="text-nw-accent animate-spin mb-4" />
      <p className="text-nw-text-tertiary text-sm tracking-widest uppercase">{message}</p>
    </div>
  )
}
