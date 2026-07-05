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
    let timeoutId: ReturnType<typeof setTimeout>

    const handleSession = async (session: any) => {
      if (!session?.user) {
        const searchParams = new URLSearchParams(window.location.search)
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')
        
        if (error) {
          console.error('OAuth Error:', error, errorDescription)
          if (mounted) navigate(`/login?error=${encodeURIComponent(errorDescription || error)}`)
          return
        }

        // Only redirect to login if we don't have a hash or search params that might be processed
        if (!window.location.hash && !window.location.search) {
          if (mounted) navigate('/login')
        }
        return
      }

      try {
        // Clear any timeout since we got a session
        if (timeoutId) clearTimeout(timeoutId)

        // Check if this was a Facebook linking callback
        const searchParams = new URLSearchParams(window.location.search)
        if (searchParams.get('linking') === 'facebook') {
          if (mounted) navigate('/you?confirm_facebook=true', { replace: true })
          return
        }

        // If they logged in via Facebook but it's not linked, they won't have an email on their session user
        if (!session.user.email) {
          await supabase.auth.signOut()
          if (mounted) navigate('/login?error=facebook_unlinked', { replace: true })
          return
        }

        // Check if user is approved in our public.users table
        const isApproved = await checkUserApproval(session.user.id)

        if (!mounted) return

        if (isApproved) {
          // Check for linked identity email mismatches
          const identities = session.user.identities || []
          const mismatchedIdentity = identities.find((i: any) => i.identity_data?.email && i.identity_data.email !== session.user.email)
          
          if (mismatchedIdentity) {
            const providerName = mismatchedIdentity.provider.charAt(0).toUpperCase() + mismatchedIdentity.provider.slice(1)
            setMessage(`Email mismatch. Unlinking ${providerName} account...`)
            await supabase.auth.unlinkIdentity(mismatchedIdentity)
            if (mounted) navigate('/you?error=email_mismatch', { replace: true })
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
      else {
        // If there's a code in the URL, supabase-js should exchange it automatically.
        // We set a fallback timeout just in case it fails silently.
        const searchParams = new URLSearchParams(window.location.search)
        if (searchParams.has('code')) {
           timeoutId = setTimeout(() => {
             if (mounted) {
               console.error('PKCE code exchange timed out.')
               navigate('/login?error=timeout')
             }
           }, 10000) // 10 seconds timeout
        } else {
           handleSession(null)
        }
      }
    })

    // Listen for auth state changes (crucial for PKCE flows like GitHub where code is exchanged async)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        if (timeoutId) clearTimeout(timeoutId)
        handleSession(session)
      } else if (event === 'USER_UPDATED') {
        // Identity linking triggers USER_UPDATED, not SIGNED_IN
        if (timeoutId) clearTimeout(timeoutId)
        handleSession(session)
      }
    })

    return () => {
      mounted = false
      if (timeoutId) clearTimeout(timeoutId)
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
