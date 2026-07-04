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
          // Check for linked identity email mismatches
          const identities = session.user.identities || []
          const googleIdentity = identities.find(i => i.provider === 'google')
          if (googleIdentity && googleIdentity.identity_data?.email && googleIdentity.identity_data.email !== session.user.email) {
            setMessage('Email mismatch. Unlinking Google account...')
            await supabase.auth.unlinkIdentity(googleIdentity)
            // Redirect to You page with error so they know what happened
            navigate('/you?error=email_mismatch', { replace: true })
            return
          }

          setMessage('Welcome back!')
          // Initialize auth store to update global state and fetch profile
          await init()
          navigate('/', { replace: true })
        } else {
          // If not approved, redirect to complete profile
          setMessage('Redirecting to Request Access...')
          const errorMsg = encodeURIComponent(`You don't have an account with the email ${session.user.email}. Request Access to use the app instead.`)
          navigate(`/req-access?complete_profile=true&error_msg=${errorMsg}`, { replace: true })
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
