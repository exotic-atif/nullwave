import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getStoredCookiePreferences } from '@/components/ui/CookieBanner'

declare global {
  interface Window {
    dataLayer?: any[]
    gtag?: (...args: any[]) => void
  }
}

/**
 * Global Route / Pageview Analytics Tracker for React Router SPA
 * Dispatches virtual page_view events to Google Tag Manager and gtag on every route change.
 */
export function PageTracker() {
  const location = useLocation()

  useEffect(() => {
    const prefs = getStoredCookiePreferences()
    // Respect user cookie preferences: do not track if user explicitly opted out of analytics
    if (prefs && prefs.analytics === false) {
      return
    }

    const path = location.pathname + location.search
    const title = document.title || 'NullWave'
    const fullUrl = window.location.href

    // 1. Google Tag Manager dataLayer virtual pageview
    if (window.dataLayer && Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: 'page_view',
        page_path: path,
        page_title: title,
        page_location: fullUrl,
        timestamp: new Date().toISOString(),
      })
    }

    // 2. Google Analytics gtag event
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_path: path,
        page_title: title,
        page_location: fullUrl,
      })
    }
  }, [location.pathname, location.search])

  return null
}
