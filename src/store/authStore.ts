import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, upsertProfile, getProfile } from '@/lib/supabase'
import { useThemeStore } from './themeStore'
import type { User } from '@/types'

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean

  init: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      /** Initialize auth — call on app mount. Restores session + listens for changes. */
      init: async () => {
        set({ isLoading: true })

        try {
          const { data: { session } } = await supabase.auth.getSession()

          if (session?.user) {
            const u = session.user
            let displayName = u.user_metadata?.display_name || u.email?.split('@')[0] || 'User'
            let avatarUrl = u.user_metadata?.avatar_url
            
            // Try to fetch profile from db
            const profile = await getProfile(u.id)
            if (profile) {
              displayName = profile.username || displayName
              avatarUrl = profile.avatar_url || avatarUrl
              if (profile.theme && profile.theme !== 'system') {
                useThemeStore.getState().setTheme(profile.theme as any)
              }
            } else {
              // Create profile row for new user
              await upsertProfile(u.id, displayName, u.email || '')
            }

            const appUser: User = {
              id: u.id,
              email: u.email || '',
              displayName,
              avatarUrl,
              role: (profile?.role as any) || 'member',
              createdAt: u.created_at,
            }
            set({ user: appUser, isAuthenticated: true })
          } else {
            set({ user: null, isAuthenticated: false })
          }
        } catch (err) {
          console.error('Auth init failed:', err)
          set({ user: null, isAuthenticated: false })
        } finally {
          set({ isLoading: false })
        }

        // Listen for future auth changes (tab focus, token refresh, etc.)
        supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            const u = session.user
            getProfile(u.id).then((profile) => {
              const displayName = profile?.username || u.user_metadata?.display_name || u.email?.split('@')[0] || 'User'
              const avatarUrl = profile?.avatar_url || u.user_metadata?.avatar_url
              
              if (profile?.theme && profile.theme !== 'system') {
                useThemeStore.getState().setTheme(profile.theme as any)
              }

              set({
                user: {
                  id: u.id,
                  email: u.email || '',
                  displayName,
                  avatarUrl,
                  role: (profile?.role as any) || 'member',
                  createdAt: u.created_at,
                },
                isAuthenticated: true,
              })
            })
          } else {
            set({ user: null, isAuthenticated: false })
          }
        })
      },

      /** Sign in with email + password via Supabase */
      login: async (email: string, password: string) => {
        set({ isLoading: true })

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          set({ isLoading: false })
          throw new Error(error.message)
        }

          const u = data.user
          let displayName = u.user_metadata?.display_name || u.email?.split('@')[0] || 'User'
          let avatarUrl = u.user_metadata?.avatar_url
          
          const profile = await getProfile(u.id)
          if (profile) {
            displayName = profile.username || displayName
            avatarUrl = profile.avatar_url || avatarUrl
            if (profile.theme && profile.theme !== 'system') {
              useThemeStore.getState().setTheme(profile.theme as any)
            }
          } else {
            // Create profile if first login
            await upsertProfile(u.id, displayName, u.email || '')
          }

          const appUser: User = {
            id: u.id,
            email: u.email || '',
            displayName,
            avatarUrl,
            role: (profile?.role as any) || 'member',
            createdAt: u.created_at,
          }

          set({ user: appUser, isAuthenticated: true, isLoading: false })
      },

      /** Sign out */
      logout: async () => {
        await supabase.auth.signOut()
        set({ user: null, isAuthenticated: false })
      },

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'nullwave-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
