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
    let mounted = true
    
    const handleSession = async (session: any) => {
      if (!session?.user) {
        // Only redirect to login if we don't have a hash or search params that might be processed
        if (!window.location.hash && !window.location.search) {
          navigate('/login')
        }
        return
      }

      try {
        // Check if user is approved in our public.users table
        const isApproved = await checkUserApproval(session.user.id)

        if (!mounted) return

        if (isApproved) {
          // Check for linked identity email mismatches
          const identities = session.user.identities || []
          const mismatchedIdentity = identities.find(i => i.identity_data?.email && i.identity_data.email !== session.user.email)
          
          if (mismatchedIdentity) {
            const providerName = mismatchedIdentity.provider === 'x' ? 'X' : mismatchedIdentity.provider.charAt(0).toUpperCase() + mismatchedIdentity.provider.slice(1)
            setMessage(`Email mismatch. Unlinking ${providerName} account...`)
            await supabase.auth.unlinkIdentity(mismatchedIdentity)
            navigate('/you?error=email_mismatch', { replace: true })
            return
          }

          setMessage('Welcome back!')
          await init()
          if (mounted) navigate('/', { replace: true })
        } else {
          setMessage('Redirecting to Request Access...')
          const errorMsg = encodeURIComponent(`You don't have an account with the email ${session.user.email}. Request Access to use the app instead.`)
          if (mounted) navigate(`/req-access?complete_profile=true&error_msg=${errorMsg}`, { replace: true })
        }
      } catch (err) {
        console.error('Callback error:', err)
        if (mounted) navigate('/login')
      }
    }

    // First check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) handleSession(session)
    })

    // Listen for auth state changes (crucial for PKCE flows like X/Twitter where code is exchanged async)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        handleSession(session)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [navigate, init])

  return (
    <div className="h-[100dvh] flex flex-col items-center justify-center bg-nw-black">
      <Loader2 size={32} className="text-nw-accent animate-spin mb-4" />
      <p className="text-nw-text-tertiary text-sm tracking-widest uppercase">{message}</p>
    </div>
  )
}
