import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Theme } from '@/types'

interface ThemeStore {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'dark',

      setTheme: (theme) => {
        const root = document.documentElement
        root.classList.remove('dark', 'light')
        root.classList.add(theme)
        set({ theme })
      },

      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'dark' ? 'light' : 'dark'
          const root = document.documentElement
          root.classList.remove('dark', 'light')
          root.classList.add(newTheme)
          return { theme: newTheme }
        }),
    }),
    {
      name: 'nullwave-theme',
    }
  )
)
