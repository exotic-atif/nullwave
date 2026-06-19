import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Theme } from '@/types'
import { updateThemePreference } from '@/lib/supabase'
import { useAuthStore } from './authStore'

const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light'
  }
  return 'dark'
}

interface ThemeStore {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: getInitialTheme(),

      setTheme: (theme) => {
        const root = document.documentElement
        root.classList.remove('dark', 'light')
        root.classList.add(theme)
        set({ theme })
        
        // Sync with DB if logged in
        const user = useAuthStore.getState().user
        if (user) {
          updateThemePreference(user.id, theme)
        }
      },

      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'dark' ? 'light' : 'dark'
          const root = document.documentElement
          root.classList.remove('dark', 'light')
          root.classList.add(newTheme)
          
          // Sync with DB if logged in
          const user = useAuthStore.getState().user
          if (user) {
            updateThemePreference(user.id, newTheme)
          }
          
          return { theme: newTheme }
        }),
    }),
    {
      name: 'nullwave-theme',
    }
  )
)
