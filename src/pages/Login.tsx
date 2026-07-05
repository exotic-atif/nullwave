import { useState, useEffect, type FormEvent } from 'react'
import { useAuthStore } from '@/store'
import { useNavigate, useLocation, Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Radio, Eye, EyeOff, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [searchParams] = useSearchParams()
  const { login, isLoading, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  
  const from = location.state?.from || '/'
  const search = location.state?.search || ''

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from + search, { replace: true })
    }
    
    // Check for URL errors (e.g. from threads)
    const urlError = searchParams.get('error')
    if (urlError === 'threads_unlinked') {
      setError('Please create an account or log in with Google/GitHub first to link your Threads account.')
    } else if (urlError) {
      setError(decodeURIComponent(urlError))
    }
  }, [isAuthenticated, navigate, from, search, searchParams])

  if (isAuthenticated) {
    return null
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password')
      return
    }

    try {
      await login(email, password)
      navigate(from + search, { replace: true })
    } catch (err) {
      setError((err as Error).message || 'Invalid credentials')
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      })
      if (error) throw error
    } catch (err) {
      setError((err as Error).message || 'Failed to initialize Google Login')
    }
  }

  const handleGithubLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      })
      if (error) throw error
    } catch (err) {
      setError((err as Error).message || 'Failed to initialize GitHub Login')
    }
  }

  const handleThreadsLogin = async () => {
    setError('Please create an account or log in with Google/GitHub first to link your Threads account.')
  }

  return (
    <div className="h-[100dvh] flex flex-col items-center justify-center py-12 bg-nw-black relative overflow-x-hidden overflow-y-auto">
      {/* Atmospheric background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-nw-accent/[0.04] blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-nw-accent-glow/[0.03] blur-[80px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-nw-accent/[0.02] blur-[120px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(56,189,248,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-sm mx-4"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-nw-accent to-nw-accent-glow flex items-center justify-center shadow-2xl shadow-nw-accent-glow/20 mb-4">
            <Radio size={24} className="text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-nw-text">
            nullwave
          </h1>
          <p className="text-xs text-nw-muted mt-1.5 uppercase tracking-[0.25em]">
            invite only
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-xs text-nw-text-tertiary mb-1.5 ml-1">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-nw-surface/50 border border-nw-border-subtle rounded-xl text-sm text-nw-text placeholder:text-nw-muted focus:outline-none focus:border-nw-accent/40 focus:ring-1 focus:ring-nw-accent-ring transition-all duration-200"
              autoComplete="email"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-xs text-nw-text-tertiary mb-1.5 ml-1">
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-10 bg-nw-surface/50 border border-nw-border-subtle rounded-xl text-sm text-nw-text placeholder:text-nw-muted focus:outline-none focus:border-nw-accent/40 focus:ring-1 focus:ring-nw-accent-ring transition-all duration-200"
                autoComplete="current-password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-nw-muted hover:text-nw-text-secondary transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-nw-danger pl-1"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-nw-accent text-white text-sm font-medium rounded-xl hover:bg-nw-accent-hover disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 glow-accent flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Authenticating...
              </>
            ) : (
              'Sign in'
            )}
          </button>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-nw-border-subtle" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-widest font-bold">
              <span className="bg-nw-surface px-4 text-nw-muted">Or continue with</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-3 bg-white text-black text-sm font-semibold rounded-xl hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer shadow-lg"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Continue with Google
            </button>
            <button
              type="button"
              onClick={handleGithubLogin}
              disabled={isLoading}
              className="w-full py-3 bg-[#24292e] text-white text-sm font-semibold rounded-xl hover:bg-[#2f363d] border border-nw-border-subtle disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer shadow-lg"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              Continue with GitHub
            </button>
            <button
              type="button"
              onClick={handleThreadsLogin}
              disabled={isLoading}
              className="w-full py-3 bg-black text-white text-sm font-semibold rounded-xl hover:bg-neutral-900 border border-nw-border-subtle disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer shadow-lg"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M12.0001 0.499878C5.6486 0.499878 0.500122 5.64835 0.500122 11.9999C0.500122 18.3514 5.6486 23.4999 12.0001 23.4999C15.5414 23.4999 18.7061 21.9 20.8523 19.3175L18.6657 17.2024C17.0694 19.102 14.6738 20.3015 12.0001 20.3015C7.41584 20.3015 3.69854 16.5842 3.69854 11.9999C3.69854 7.4156 7.41584 3.6983 12.0001 3.6983C15.8643 3.6983 19.1124 6.33596 20.0094 9.94827H12.0001V12.7844H20.2505C20.2869 12.5273 20.306 12.2655 20.306 11.9999C20.306 6.36836 16.2917 1.68412 11.0068 0.697416C11.3323 0.567605 11.6631 0.531276 12.0001 0.499878Z" />
              </svg>
              Continue with Threads
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-8 space-y-2">
          <p className="text-[11px] text-nw-muted/50">
            Access is restricted. Contact admin for an invite.
          </p>
          <div className="flex justify-center gap-4 text-[10px] text-nw-muted/40 font-medium">
            <Link to="/privacy" className="hover:text-nw-muted/80 transition-colors">Privacy Policy</Link>
            <span>&bull;</span>
            <Link to="/terms" className="hover:text-nw-muted/80 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
