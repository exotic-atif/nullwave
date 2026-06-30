import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Users, Search, Filter, Edit, Trash2 } from 'lucide-react'
import { fetchAllProfiles, adminDeleteProfile, type Track } from '@/lib/supabase'
import { toast } from 'sonner'
import { EditUserModal } from './EditUserModal'
import { RoleBadge } from '@/components/ui/RoleBadge'

export function ProfileManagement() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingUser, setEditingUser] = useState<any | null>(null)

  const loadUsers = async () => {
    setLoading(true)
    const data = await fetchAllProfiles()
    setUsers(data)
    setLoading(false)
  }

  useEffect(() => { loadUsers() }, [])

  const handleDelete = async (userId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this user?')) return
    try {
      await adminDeleteProfile(userId)
      setUsers(prev => prev.filter(u => u.id !== userId))
      toast.success('User deleted successfully')
    } catch (err: any) {
      toast.error('Failed to delete user: ' + err.message)
    }
  }

  const filtered = users.filter((u) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        (u.username || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h2 className="text-xl font-display font-bold text-nw-text">User Profiles</h2>
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-nw-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-9 pr-4 py-2 bg-nw-surface/50 border border-white/[0.06] rounded-xl text-sm text-nw-text focus:outline-none focus:border-nw-accent/40"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="text-nw-accent animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-nw-surface/20 rounded-2xl border border-white/[0.04]">
          <Users size={32} className="mx-auto text-nw-muted mb-4" />
          <p className="text-nw-text">No users found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(u => (
            <div key={u.id} className="bg-nw-surface/40 border border-white/[0.06] rounded-2xl p-4 flex flex-col hover:border-white/[0.12] transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-white/[0.04] border border-white/[0.08] flex-shrink-0">
                  {u.avatar_url ? (
                    <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-nw-muted text-lg font-bold">
                      {(u.username || 'U')[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-nw-text truncate">{u.username}</h3>
                  <p className="text-xs text-nw-muted truncate">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <RoleBadge role={u.role || 'member'} className="text-[10px] px-2 py-0.5" />
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingUser(u)}
                    className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-nw-text transition-colors"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingUser && (
        <EditUserModal 
          user={editingUser} 
          onClose={() => setEditingUser(null)} 
          onUpdate={(updated: any) => {
            setUsers(prev => prev.map(u => u.id === updated.id ? updated : u))
            setEditingUser(null)
          }}
        />
      )}
    </div>
  )
}
