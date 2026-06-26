import { useState, useEffect, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Radio, Loader2, Eye, EyeOff, ShieldAlert, ShieldCheck,
  Trash2, CheckCircle, XCircle, Clock, Filter, Users,
  Search, ChevronDown, Mail, Music, Sparkles, LogOut
} from 'lucide-react'
import { useAuthStore } from '@/store'
import { supabase, fetchAccessRequests, updateAccessRequest, deleteAccessRequest } from '@/lib/supabase'
import type { AccessRequest } from '@/lib/supabase'
import { getProfile } from '@/lib/supabase'
import { toast } from 'sonner'

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected'

export function AdminPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore()

  // If auth is still loading, show spinner
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-nw-black">
        <Loader2 size={32} className="text-nw-accent animate-spin" />
      </div>
    )
  }

  // Not logged in → login form
  if (!isAuthenticated || !user) {
    return <AdminLogin />
  }

  // Logged in but not admin
  if (user.role !== 'admin') {
    return <AccessDenied />
  }

  // Admin → dashboard
  return <AdminDashboard />
}

// ===== LOGIN FORM =====

function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password.trim()) { setError('Enter both email and password'); return }

    setLoading(true)
    try {
      await login(email, password)

      // After login, check the role from Supabase
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const profile = await getProfile(session.user.id)
        if (profile?.role !== 'admin') {
          // Will re-render and show AccessDenied
        }
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-nw-black relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-nw-accent/[0.04] blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-nw-accent-glow/[0.03] blur-[80px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-sm mx-4"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-2xl mb-4">
            <ShieldCheck size={24} className="text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-nw-text">Admin Panel</h1>
          <p className="text-xs text-nw-muted mt-1.5 uppercase tracking-[0.25em]">Restricted Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-nw-text-tertiary mb-1.5 ml-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@nullwave.app"
              className="w-full px-4 py-3 bg-nw-surface/50 border border-nw-border-subtle rounded-xl text-sm text-nw-text placeholder:text-nw-muted focus:outline-none focus:border-nw-accent/40 focus:ring-1 focus:ring-nw-accent-ring transition-all"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-xs text-nw-text-tertiary mb-1.5 ml-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-10 bg-nw-surface/50 border border-nw-border-subtle rounded-xl text-sm text-nw-text placeholder:text-nw-muted focus:outline-none focus:border-nw-accent/40 focus:ring-1 focus:ring-nw-accent-ring transition-all"
                disabled={loading}
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
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-nw-danger pl-1">
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Authenticating...</> : 'Sign in as Admin'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}

// ===== ACCESS DENIED =====

function AccessDenied() {
  const { logout } = useAuthStore()

  return (
    <div className="min-h-screen flex items-center justify-center bg-nw-black relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/3 w-80 h-80 rounded-full bg-red-500/[0.04] blur-[100px]" />
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 text-center max-w-sm mx-4"
      >
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 border-2 border-red-500/20 flex items-center justify-center">
          <ShieldAlert size={32} className="text-red-400" />
        </div>
        <h1 className="text-2xl font-display font-bold text-nw-text mb-2">Access Denied</h1>
        <p className="text-sm text-nw-text-secondary mb-1">
          You don't have permission to view this page.
        </p>
        <p className="text-xs text-nw-text-tertiary mb-6">
          Admin-level privileges are required. Your current role doesn't include access to the admin dashboard.
        </p>
        <button
          onClick={logout}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/[0.06] text-nw-text-secondary text-sm rounded-xl hover:bg-white/[0.1] transition-colors border border-white/[0.06]"
        >
          <LogOut size={16} /> Sign out
        </button>
      </motion.div>
    </div>
  )
}

// ===== ADMIN DASHBOARD =====

function AdminDashboard() {
  const [requests, setRequests] = useState<AccessRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const { user, logout } = useAuthStore()

  const loadRequests = async () => {
    setLoading(true)
    const data = await fetchAccessRequests()
    setRequests(data)
    setLoading(false)
  }

  useEffect(() => { loadRequests() }, [])

  const handleStatus = async (id: string, status: 'approved' | 'rejected') => {
    await updateAccessRequest(id, { status })
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status } : r))
    toast.success(`Request ${status}`)
  }

  const handleDelete = async (id: string) => {
    await deleteAccessRequest(id)
    setRequests((prev) => prev.filter((r) => r.id !== id))
    toast.success('Request deleted')
  }

  const filtered = requests.filter((r) => {
    if (filter !== 'all' && r.status !== filter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        r.display_name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        (r.fav_artists || '').toLowerCase().includes(q)
      )
    }
    return true
  })

  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    approved: requests.filter((r) => r.status === 'approved').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
  }

  const statusIcon = (s: string) => {
    switch (s) {
      case 'pending': return <Clock size={14} className="text-yellow-400" />
      case 'approved': return <CheckCircle size={14} className="text-green-400" />
      case 'rejected': return <XCircle size={14} className="text-red-400" />
      default: return null
    }
  }

  const statusBadge = (s: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      approved: 'bg-green-500/10 text-green-400 border-green-500/20',
      rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
    }
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border ${colors[s] || ''}`}>
        {statusIcon(s)} {s}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-nw-black">
      {/* Top Bar */}
      <div className="sticky top-0 z-20 bg-nw-black/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Radio size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-display font-bold text-nw-text">Nullwave Admin</h1>
              <p className="text-[10px] text-nw-muted">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-nw-text-tertiary hover:text-nw-text bg-white/[0.04] hover:bg-white/[0.08] rounded-lg transition-colors"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`p-4 rounded-xl border transition-all ${
                filter === key
                  ? 'bg-white/[0.06] border-nw-accent/30'
                  : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {key === 'all' ? <Users size={14} className="text-nw-accent" /> : statusIcon(key)}
                <span className="text-[10px] uppercase tracking-wider text-nw-text-tertiary font-semibold">{key}</span>
              </div>
              <p className="text-2xl font-display font-bold text-nw-text">{counts[key]}</p>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-nw-text-tertiary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or artists..."
            className="w-full pl-10 pr-4 py-3 bg-nw-surface/40 border border-white/[0.06] rounded-xl text-sm text-nw-text placeholder:text-nw-muted focus:outline-none focus:border-nw-accent/30 transition-all"
          />
        </div>

        {/* Request List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="text-nw-accent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Filter size={32} className="text-nw-muted mx-auto mb-3" />
            <p className="text-nw-text-secondary text-sm">No requests found</p>
            <p className="text-nw-text-tertiary text-xs mt-1">
              {filter !== 'all' ? 'Try changing the filter.' : 'No access requests yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filtered.map((req, i) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.02 }}
                  className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden hover:bg-white/[0.04] transition-colors"
                >
                  {/* Row */}
                  <button
                    onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                    className="w-full flex items-center gap-4 p-4 text-left"
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-nw-surface flex-shrink-0">
                      {req.avatar_url ? (
                        <img src={req.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-nw-muted">
                          <Users size={16} />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-nw-text truncate">{req.display_name}</p>
                      <p className="text-xs text-nw-text-tertiary truncate">{req.email}</p>
                    </div>

                    {/* Status */}
                    <div className="hidden sm:block">{statusBadge(req.status)}</div>

                    {/* Date */}
                    <span className="text-[10px] text-nw-muted tabular-nums hidden md:block">
                      {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>

                    <ChevronDown
                      size={16}
                      className={`text-nw-muted transition-transform ${expandedId === req.id ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {expandedId === req.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-0 border-t border-white/[0.04]">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                            {/* Mobile status */}
                            <div className="sm:hidden">{statusBadge(req.status)}</div>

                            <div className="space-y-3">
                              <div>
                                <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-nw-muted font-semibold mb-1">
                                  <Mail size={10} /> Email
                                </label>
                                <p className="text-sm text-nw-text-secondary">{req.email}</p>
                              </div>
                              <div>
                                <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-nw-muted font-semibold mb-1">
                                  <Sparkles size={10} /> Favorite Artists
                                </label>
                                <p className="text-sm text-nw-text-secondary">
                                  {req.fav_artists || <span className="text-nw-muted italic">Not provided</span>}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-nw-muted font-semibold mb-1">
                                  <Music size={10} /> Favorite Songs
                                </label>
                                <p className="text-sm text-nw-text-secondary">
                                  {req.fav_songs || <span className="text-nw-muted italic">Not provided</span>}
                                </p>
                              </div>
                              <div>
                                <label className="text-[10px] uppercase tracking-wider text-nw-muted font-semibold mb-1 block">
                                  Submitted
                                </label>
                                <p className="text-sm text-nw-text-secondary">
                                  {new Date(req.created_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 mt-5 pt-4 border-t border-white/[0.04]">
                            {req.status !== 'approved' && (
                              <button
                                onClick={() => handleStatus(req.id, 'approved')}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors border border-green-500/20"
                              >
                                <CheckCircle size={14} /> Approve
                              </button>
                            )}
                            {req.status !== 'rejected' && (
                              <button
                                onClick={() => handleStatus(req.id, 'rejected')}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/20"
                              >
                                <XCircle size={14} /> Reject
                              </button>
                            )}
                            <div className="flex-1" />
                            <button
                              onClick={() => handleDelete(req.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-nw-text-tertiary hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
