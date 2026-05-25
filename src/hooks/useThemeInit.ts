import { useEffect } from 'react'
import { useThemeStore } from '@/store'

/**
 * Initialize the theme on first mount, applying the persisted preference
 */
export function useThemeInit() {
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark', 'light')
    root.classList.add(theme)
  }, [theme])
}
