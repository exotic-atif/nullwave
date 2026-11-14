import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, ShieldCheck, Check, X, Sliders, FileText, Lock, Sparkles, ChevronRight } from 'lucide-react'

export interface CookiePreferences {
  essential: true
  analytics: boolean
  personalization: boolean
  consentedAt: string
}

const STORAGE_KEY = 'nw_cookie_consent_v1'

export function getStoredCookiePreferences(): CookiePreferences | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as CookiePreferences
  } catch {
    return null
  }
}

export function saveCookiePreferences(prefs: Omit<CookiePreferences, 'essential' | 'consentedAt'>): CookiePreferences {
  const full: CookiePreferences = {
    essential: true,
    analytics: prefs.analytics,
    personalization: prefs.personalization,
    consentedAt: new Date().toISOString(),
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(full))
    // Update GTM / Analytics Consent Mode
    if (typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag('consent', 'update', {
        analytics_storage: full.analytics ? 'granted' : 'denied',
        ad_storage: 'denied', // NullWave is 100% ad-free
        personalization_storage: full.personalization ? 'granted' : 'denied',
      })
    }
    window.dispatchEvent(new CustomEvent('nw-cookie-consent-updated', { detail: full }))
  } catch (err) {
    console.error('Failed to save cookie preferences:', err)
  }
  return full
}

// Global event to open modal from anywhere (e.g. Settings, Footer)
export function openCookieModal(tab: 'preferences' | 'policy' = 'preferences') {
  window.dispatchEvent(new CustomEvent('nw-open-cookie-modal', { detail: { tab } }))
}

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'preferences' | 'policy'>('preferences')

  const [analytics, setAnalytics] = useState(true)
  const [personalization, setPersonalization] = useState(true)

  useEffect(() => {
    const existing = getStoredCookiePreferences()
    if (!existing) {
      // Small delay for buttery entrance
      const timer = window.setTimeout(() => setIsVisible(true), 1200)
      return () => window.clearTimeout(timer)
    } else {
      setAnalytics(existing.analytics)
      setPersonalization(existing.personalization)
      // Apply existing consent to GTM
      if (typeof window !== 'undefined' && (window as any).gtag) {
        ;(window as any).gtag('consent', 'update', {
          analytics_storage: existing.analytics ? 'granted' : 'denied',
          ad_storage: 'denied',
          personalization_storage: existing.personalization ? 'granted' : 'denied',
        })
      }
    }
  }, [])

  // Listen for manual open requests from Settings or Footer
  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<{ tab?: 'preferences' | 'policy' }>
      if (customEvent.detail?.tab) {
        setActiveTab(customEvent.detail.tab)
      }
      setIsModalOpen(true)
    }
    window.addEventListener('nw-open-cookie-modal', handler)
    return () => window.removeEventListener('nw-open-cookie-modal', handler)
  }, [])

  const handleAcceptAll = () => {
    saveCookiePreferences({ analytics: true, personalization: true })
    setAnalytics(true)
    setPersonalization(true)
    setIsVisible(false)
    setIsModalOpen(false)
  }

  const handleRejectNonEssential = () => {
    saveCookiePreferences({ analytics: false, personalization: false })
    setAnalytics(false)
    setPersonalization(false)
    setIsVisible(false)
    setIsModalOpen(false)
  }

  const handleSaveCustom = () => {
    saveCookiePreferences({ analytics, personalization })
    setIsVisible(false)
    setIsModalOpen(false)
  }

  return (
    <>
      {/* 1. FLOATING SUBTLE BANNER */}
      <AnimatePresence>
        {isVisible && !isModalOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-20 md:bottom-24 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-[80] pointer-events-auto"
          >
            <div className="p-4 sm:p-5 rounded-2xl bg-nw-void/90 backdrop-blur-2xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.8)] space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-nw-accent/10 border border-nw-accent/20 text-nw-accent flex-shrink-0 mt-0.5">
                  <Cookie size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white tracking-wide">Cookie & Privacy Choices</h3>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-white/10 text-nw-muted">
                      Ad-Free
                    </span>
                  </div>
                  <p className="text-xs text-nw-text-secondary mt-1 leading-relaxed">
                    NullWave uses essential cookies for seamless playback and optional telemetry to optimize music recommendations. We never sell your data or serve third-party ads.
                  </p>
                </div>
                <button
                  onClick={handleRejectNonEssential}
                  className="text-nw-muted hover:text-white p-1 rounded-lg transition-colors flex-shrink-0"
                  title="Dismiss & Keep Essential Only"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/5">
                <button
                  onClick={handleAcceptAll}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-nw-accent text-black font-semibold text-xs hover:bg-nw-accent-hover transition-all active:scale-[0.98] shadow-lg shadow-nw-accent/20"
                >
                  Accept All
                </button>
                <button
                  onClick={handleRejectNonEssential}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-nw-text-secondary hover:text-white text-xs font-medium border border-white/5 transition-all"
                >
                  Essential Only
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-nw-text-secondary hover:text-white transition-all border border-white/5 flex items-center justify-center"
                  title="Customize Preferences"
                >
                  <Sliders size={14} />
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-nw-muted pt-0.5">
                <button
                  onClick={() => {
                    setActiveTab('policy')
                    setIsModalOpen(true)
                  }}
                  className="hover:text-nw-accent underline underline-offset-2 transition-colors cursor-pointer"
                >
                  View Cookie Policy
                </button>
                <span>GDPR / CCPA Compliant</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. FULL PREFERENCES & POLICY MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg bg-nw-void border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
            >
              {/* Header */}
              <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-nw-accent/10 border border-nw-accent/20 text-nw-accent">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-display font-bold text-white">Privacy & Cookie Settings</h2>
                    <p className="text-xs text-nw-muted">Curated for an ad-free, respectful listening experience</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-nw-muted hover:text-white rounded-xl hover:bg-white/5 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/10 px-6 bg-nw-surface/20 flex-shrink-0">
                <button
                  onClick={() => setActiveTab('preferences')}
                  className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
                    activeTab === 'preferences'
                      ? 'border-nw-accent text-nw-accent'
                      : 'border-transparent text-nw-muted hover:text-white'
                  }`}
                >
                  <Sliders size={13} />
                  Cookie Preferences
                </button>
                <button
                  onClick={() => setActiveTab('policy')}
                  className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
                    activeTab === 'policy'
                      ? 'border-nw-accent text-nw-accent'
                      : 'border-transparent text-nw-muted hover:text-white'
                  }`}
                >
                  <FileText size={13} />
                  Cookie Policy
                </button>
              </div>

              {/* Content Area */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-sm text-nw-text-secondary">
                {activeTab === 'preferences' ? (
                  <div className="space-y-4">
                    {/* Category 1: Strictly Necessary */}
                    <div className="p-4 rounded-2xl bg-nw-surface/40 border border-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Lock size={15} className="text-nw-accent" />
                          <span className="font-semibold text-white text-sm">Strictly Necessary Cookies</span>
                        </div>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-nw-muted border border-white/10">
                          Always Active
                        </span>
                      </div>
                      <p className="text-xs text-nw-muted leading-relaxed">
                        Required for secure login authentication, queue management, volume memory, and persistent dark mode playback. The application cannot function without these.
                      </p>
                    </div>

                    {/* Category 2: Performance & Analytics */}
                    <div className="p-4 rounded-2xl bg-nw-surface/40 border border-white/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldCheck size={15} className="text-nw-accent" />
                          <span className="font-semibold text-white text-sm">Analytics & Diagnostic Telemetry</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={analytics}
                            onChange={(e) => setAnalytics(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-nw-accent"></div>
                        </label>
                      </div>
                      <p className="text-xs text-nw-muted leading-relaxed">
                        Helps us monitor stream latency, crash reports, audio CDN performance, and general platform stability via Google Tag Manager and Cloudflare Web Analytics. All data is anonymized.
                      </p>
                    </div>

                    {/* Category 3: Personalization & Music Affinity */}
                    <div className="p-4 rounded-2xl bg-nw-surface/40 border border-white/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles size={15} className="text-nw-accent" />
                          <span className="font-semibold text-white text-sm">Personalization & Listening Affinity</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={personalization}
                            onChange={(e) => setPersonalization(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-nw-accent"></div>
                        </label>
                      </div>
                      <p className="text-xs text-nw-muted leading-relaxed">
                        Allows our recommendation engine to remember how long you listen to each song (smart duration tracking) so "Made For You" and "Radio" suggest songs tailored to your actual taste.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* COOKIE POLICY TEXT */
                  <div className="space-y-4 text-xs leading-relaxed text-nw-text-secondary pr-1">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-sm text-white">NullWave Cookie & Data Policy</h3>
                      <p className="text-nw-muted text-[11px]">Last Updated: November 15, 2026 • Version 1.5.9</p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-white text-xs">1. Our Commitment: 100% Ad-Free</h4>
                      <p>
                        NullWave is designed as an ad-free music streaming experience by Atif Arman. We strictly do not sell, rent, or trade your personal data with third-party advertising brokers. No behavioral advertising networks (such as Google AdSense or Meta Pixel) are permitted.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-white text-xs">2. What are Cookies & Local Storage?</h4>
                      <p>
                        Cookies and browser local storage are small text files stored on your device that enable key application features, maintain your active session, remember your volume level, and store your preferred audio playback settings.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-white text-xs">3. Cookie Categories</h4>
                      <ul className="list-disc pl-4 space-y-1.5 text-nw-muted">
                        <li>
                          <strong className="text-white">Essential Storage:</strong> Firebase Authentication tokens, encrypted session cookies, player volume, and active queue state.
                        </li>
                        <li>
                          <strong className="text-white">Analytics:</strong> Aggregated diagnostic metrics via Google Tag Manager and Cloudflare Web Analytics to measure site speed and streaming latency.
                        </li>
                        <li>
                          <strong className="text-white">Personalization:</strong> Stored listening session duration vectors used exclusively to curate your personalized recommendations.
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-white text-xs">4. How to Manage Your Choices</h4>
                      <p>
                        You can update your cookie preferences at any time by navigating to <span className="text-white font-medium">Settings &rarr; Cookie Preferences</span> or clearing your browser cookies.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-5 border-t border-white/10 bg-nw-surface/30 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
                <button
                  onClick={handleRejectNonEssential}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-nw-text-secondary hover:text-white text-xs font-medium border border-white/5 transition-all"
                >
                  Reject Optional
                </button>
                <div className="flex items-center gap-2 ml-auto">
                  {activeTab === 'preferences' ? (
                    <button
                      onClick={handleSaveCustom}
                      className="px-4 py-2 rounded-xl bg-nw-accent text-black font-semibold text-xs hover:bg-nw-accent-hover transition-all shadow-lg shadow-nw-accent/20 flex items-center gap-1.5"
                    >
                      <Check size={14} />
                      Save Preferences
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveTab('preferences')}
                      className="px-4 py-2 rounded-xl bg-nw-accent text-black font-semibold text-xs hover:bg-nw-accent-hover transition-all flex items-center gap-1.5"
                    >
                      Manage Cookies
                      <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
