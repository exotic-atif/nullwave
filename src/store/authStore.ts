import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  auth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from '@/lib/firebase'
import { getProfile } from '@/lib/supabase'
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

      /** Initialize Firebase Auth — call on app mount. Restores session + listens for changes. */
      init: async () => {
        set({ isLoading: true })

        onAuthStateChanged(auth, async (fbUser) => {
          if (fbUser) {
            try {
              const profile = await getProfile(fbUser.uid, fbUser.email || undefined)
              const displayName =
                profile?.username ||
                fbUser.displayName ||
                fbUser.email?.split('@')[0] ||
                'User'
              const avatarUrl = profile?.avatar_url || fbUser.photoURL || undefined

              if (profile?.theme && profile.theme !== 'system') {
                useThemeStore.getState().setTheme(profile.theme as any)
              }

              const appUser: User = {
                id: fbUser.uid,
                email: fbUser.email || '',
                displayName,
                avatarUrl,
                favSongs: profile?.fav_songs || '',
                favArtists: profile?.fav_artists || '',
                role: (profile?.role as any) || 'member',
                createdAt: fbUser.metadata?.creationTime || new Date().toISOString(),
                approved: profile?.approved ?? true,
              }
              set({ user: appUser, isAuthenticated: true, isLoading: false })
            } catch (err) {
              console.error('Failed to init profile:', err)
              set({ user: null, isAuthenticated: false, isLoading: false })
            }
          } else {
            set({ user: null, isAuthenticated: false, isLoading: false })
          }
        })
      },

      /** Sign in with email + password via Firebase */
      login: async (email: string, password: string) => {
        set({ isLoading: true })

        try {
          const cred = await signInWithEmailAndPassword(auth, email.trim(), password)
          const u = cred.user
          const profile = await getProfile(u.uid, u.email || undefined)
          const displayName =
            profile?.username || u.displayName || u.email?.split('@')[0] || 'User'
          const avatarUrl = profile?.avatar_url || u.photoURL || undefined

          if (profile?.theme && profile.theme !== 'system') {
            useThemeStore.getState().setTheme(profile.theme as any)
          }

          const appUser: User = {
            id: u.uid,
            email: u.email || '',
            displayName,
            avatarUrl,
            favSongs: profile?.fav_songs || '',
            favArtists: profile?.fav_artists || '',
            role: (profile?.role as any) || 'member',
            createdAt: u.metadata?.creationTime || new Date().toISOString(),
            approved: profile?.approved ?? true,
          }

          set({ user: appUser, isAuthenticated: true, isLoading: false })
        } catch (error: any) {
          set({ isLoading: false })
          const code = error?.code || ''
          if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
            throw new Error('Incorrect email or password. Please verify your credentials.')
          } else if (code === 'auth/user-not-found') {
            throw new Error('No account found with this email.')
          } else if (code === 'auth/too-many-requests') {
            throw new Error('Access to this account has been temporarily disabled due to many failed attempts.')
          }
          throw new Error(error.message || 'Invalid credentials')
        }
      },

      /** Sign out from Firebase */
      logout: async () => {
        await signOut(auth)
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
