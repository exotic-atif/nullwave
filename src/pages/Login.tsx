import { useState, useEffect, type FormEvent } from 'react'
import { useAuthStore } from '@/store'
import { useNavigate, useLocation, Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { FcGoogle } from 'react-icons/fc'
import { FaGithub, FaFacebook } from 'react-icons/fa'

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
    
    // Check for URL errors (e.g. from facebook)
    const urlError = searchParams.get('error')
    if (urlError === 'facebook_unlinked') {
      setError('Please create an account or log in with Google/GitHub first to link your Facebook account.')
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

  const handleFacebookLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'public_profile,email'
        }
      })
      if (error) throw error
    } catch (err) {
      setError((err as Error).message || 'Failed to initialize Facebook Login')
    }
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
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0c0c0c] to-nw-surface flex items-center justify-center shadow-2xl shadow-nw-accent-glow/10 border border-white/5 mb-4 p-3">
            <img src="/favicon.svg" alt="NullWave" className="w-full h-full object-contain" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-nw-text">
            NullWave
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
              <FcGoogle size={20} />
              Continue with Google
            </button>
            <button
              type="button"
              onClick={handleGithubLogin}
              disabled={isLoading}
              className="w-full py-3 bg-[#24292e] text-white text-sm font-semibold rounded-xl hover:bg-[#2f363d] border border-nw-border-subtle disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer shadow-lg"
            >
              <FaGithub size={20} />
              Continue with GitHub
            </button>
            <button
              type="button"
              onClick={handleFacebookLogin}
              disabled={isLoading}
              className="w-full py-3 bg-[#1877F2] text-white text-sm font-semibold rounded-xl hover:bg-[#166FE5] border border-nw-border-subtle disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer shadow-lg"
            >
              <FaFacebook size={20} />
              Continue with Facebook
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
