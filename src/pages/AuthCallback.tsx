import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, onAuthStateChanged } from '@/lib/firebase'
import { useAuthStore } from '@/store'
import { Loader2 } from 'lucide-react'

export function AuthCallback() {
  const navigate = useNavigate()
  const { init } = useAuthStore()
  const [message, setMessage] = useState('Completing sign in...')

  useEffect(() => {
    let mounted = true
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (mounted) {
          setMessage('Welcome back!')
          await init()
          navigate('/', { replace: true })
        }
      } else {
        setTimeout(() => {
          if (mounted && !auth.currentUser) {
            navigate('/login', { replace: true })
          }
        }, 1200)
      }
    })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [navigate, init])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-nw-black text-white p-4">
      <Loader2 className="w-8 h-8 text-nw-accent animate-spin mb-4" />
      <p className="text-nw-muted text-sm">{message}</p>
    </div>
  )
}
