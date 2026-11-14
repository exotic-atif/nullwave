// ===== NULLWAVE API CLIENT =====

import type { Track, Album, Artist } from '@/types'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

// ===== STREAM SERVERS =====
// Primary server: Your Oracle Cloud VM proxy (default)
export const PRIMARY_STREAM_URL = (
  import.meta.env.VITE_STREAM_API_URL ||
  import.meta.env.VITE_PRIMARY_STREAM_API_URL ||
  'https://thenullwave.duckdns.org'
).replace(/\/+$/, '')

// Fallback server: Used automatically if primary is high on load, offline, or times out
export const FALLBACK_STREAM_URL = (
  import.meta.env.VITE_FALLBACK_STREAM_API_URL ||
  import.meta.env.VITE_STREAM_FALLBACK_URL ||
  'https://nullwave.onrender.com'
).replace(/\/+$/, '')

function joinUrl(baseUrl: string, endpoint: string): string {
  return `${baseUrl.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 6000): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    clearTimeout(timer)
    return res
  } catch (err) {
    clearTimeout(timer)
    throw err
  }
}

async function request<T>(endpoint: string, baseUrl = BASE_URL): Promise<T> {
  const res = await fetch(joinUrl(baseUrl, endpoint))
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error((body as { error?: string }).error || `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

export interface StreamResult {
  streamUrl: string
  quality?: string
  mimeType?: string
  videoId?: string
  source?: string
  server?: 'primary' | 'fallback'
  error?: string
}

export interface StreamHealthResult {
  ok: boolean
  service: string
  startedAt?: string
  uptime?: number
  activeServer?: 'primary' | 'fallback'
  primaryOk?: boolean
  fallbackOk?: boolean
  serverUrl?: string
}

interface StreamFailoverState {
  primaryHealthy: boolean
  primaryCooldownUntil: number
  activeServer: 'primary' | 'fallback'
}

const streamFailoverState: StreamFailoverState = {
  primaryHealthy: true,
  primaryCooldownUntil: 0,
  activeServer: 'primary',
}

export interface LyricsResult {
  synced: string | null
  plain: string | null
  trackName?: string
  artistName?: string
  albumName?: string
}

export interface SyncedLine {
  time: number // seconds
  text: string
}

/** Parse LRC format "[mm:ss.xx] text" into timed lines */
export function parseLRC(lrc: string): SyncedLine[] {
  if (!lrc) return []
  const lines: SyncedLine[] = []
  for (const raw of lrc.split('\n')) {
    // Accept standard centiseconds, milliseconds, timestamps without fractions,
    // and lines carrying more than one timestamp.
    const timestamps = [...raw.matchAll(/\[(\d{1,3}):(\d{2})(?:[.,](\d{1,3}))?\]/g)]
    if (!timestamps.length) continue
    const text = raw.replace(/\[(?:\d{1,3}):(?:\d{2})(?:[.,]\d{1,3})?\]/g, '').trim()
    if (!text) continue
    for (const match of timestamps) {
      const fraction = match[3] ?? ''
      const fractionalSeconds = fraction ? Number(`0.${fraction.padEnd(3, '0').slice(0, 3)}`) : 0
      const time = Number(match[1]) * 60 + Number(match[2]) + fractionalSeconds
      lines.push({ time, text })
    }
  }
  return lines.sort((a, b) => a.time - b.time)
}

export const BLOCKED_KEYWORDS = [
  'bhajan', 'aarti', 'arti', 'chalisa', 'kripa', 'krishna', 'radhe', 'radha', 'shyam', 'ram',
  'shree ram', 'ramayana', 'sita', 'hanuman', 'shiv', 'shiva', 'mahadev', 'bholenath', 'kedarnath',
  'bhakti', 'devotional', 'katha', 'mantra', 'stotram', 'amritwani', 'dhun', 'jaap',
  'kirtan', 'qawwali', 'naat', 'nasheed', 'gospel', 'hymn', 'chandan', 'pooja', 'puja',
  'prarthana', 'bihari ji', 'anup jalota', 'navin tripathi', 'indresh upadhyay',
  'hansraj raghuwanshi', 'sadhu tiwari', 'mandir', 'pandit', 'swami', 'guru',
  'bhagwan', 'deva', 'ganesh', 'ganpati', 'durga', 'lakshmi', 'saraswati', 'sai baba',
  'har har', 'jai shree', 'jai jai', 'vaishno', 'parvati', 'barsane', 'vrindavan',
  'govind', 'gopal', 'murari', 'namo namo', 'zee music devotional',
  'anandmurti', 'anuradha paudwal', 'lakhbir singh', 'gulshan kumar', 't-series bhakti', 'bhaktisangeet',
  'slowed', 'reverb', 'reverbed', 'speed', 'sped', 'lofi', 'mashup', 'instrumental', 'karaoke', 'bass boosted', '8d'
]

export function filterCleanTracks(tracks: Track[]): Track[] {
  if (!Array.isArray(tracks)) return []
  return tracks.filter((t) => {
    if (!t) return false
    const text = `${t.title || ''} ${t.artist || ''} ${t.album || ''}`.toLowerCase()
    return !BLOCKED_KEYWORDS.some((kw) => text.includes(kw))
  })
}

export const api = {
  async trending(): Promise<Track[]> {
    try {
      const data = await request<{ tracks: Track[] }>('/songs/trending')
      const clean = filterCleanTracks(data.tracks || [])
      if (clean.length >= 6) return clean
      const fallback = await api.search('Today Top Hits')
      return filterCleanTracks(fallback.tracks || []).slice(0, 20)
    } catch {
      const fallback = await api.search('Today Top Hits')
      return filterCleanTracks(fallback.tracks || []).slice(0, 20)
    }
  },

  async search(query: string): Promise<{ tracks: Track[]; albums: Album[]; artists: Artist[] }> {
    return request(`/search?q=${encodeURIComponent(query)}`)
  },

  async track(id: string): Promise<Track> {
    const data = await request<{ track: Track }>(`/track/${id}`)
    return data.track
  },

  /** Check stream server health with automatic failover between Primary (Oracle VM) and Fallback */
  async streamHealth(): Promise<StreamHealthResult> {
    const now = Date.now()
    const inCooldown = now < streamFailoverState.primaryCooldownUntil
    const hasFallback = !!FALLBACK_STREAM_URL && FALLBACK_STREAM_URL !== PRIMARY_STREAM_URL

    // 1. If primary is not in cooldown, check primary first (default)
    if (!inCooldown) {
      try {
        const res = await fetchWithTimeout(joinUrl(PRIMARY_STREAM_URL, '/health'), {}, 3500)
        if (res.ok) {
          const data = await res.json().catch(() => ({}))
          if (!data.overloaded) {
            streamFailoverState.primaryHealthy = true
            streamFailoverState.activeServer = 'primary'
            return {
              ok: true,
              service: data.service || 'nullwave-stream',
              activeServer: 'primary',
              primaryOk: true,
              fallbackOk: hasFallback,
              serverUrl: PRIMARY_STREAM_URL,
            }
          }
          console.warn('[StreamManager] Primary server reported high load. Switching to fallback.')
        } else {
          console.warn(`[StreamManager] Primary health check returned HTTP ${res.status}. Switching to fallback.`)
        }
      } catch (err) {
        console.warn('[StreamManager] Primary health check failed:', err)
      }

      // If we reached here, primary failed or is overloaded! Enter cooldown
      streamFailoverState.primaryHealthy = false
      streamFailoverState.primaryCooldownUntil = now + 40_000 // 40s cooldown before retrying primary
    }

    // 2. Try fallback server
    if (hasFallback) {
      try {
        const res = await fetchWithTimeout(joinUrl(FALLBACK_STREAM_URL, '/health'), {}, 5000)
        if (res.ok) {
          const data = await res.json().catch(() => ({}))
          streamFailoverState.activeServer = 'fallback'
          return {
            ok: true,
            service: data.service || 'nullwave-stream-fallback',
            activeServer: 'fallback',
            primaryOk: false,
            fallbackOk: true,
            serverUrl: FALLBACK_STREAM_URL,
          }
        }
      } catch (err) {
        console.warn('[StreamManager] Fallback health check failed:', err)
      }
    }

    // 3. If primary was in cooldown, maybe it recovered? Try once as fallback
    if (inCooldown && hasFallback) {
      try {
        const res = await fetchWithTimeout(joinUrl(PRIMARY_STREAM_URL, '/health'), {}, 3000)
        if (res.ok) {
          streamFailoverState.primaryHealthy = true
          streamFailoverState.primaryCooldownUntil = 0
          streamFailoverState.activeServer = 'primary'
          return {
            ok: true,
            service: 'nullwave-stream',
            activeServer: 'primary',
            primaryOk: true,
            fallbackOk: false,
            serverUrl: PRIMARY_STREAM_URL,
          }
        }
      } catch {}
    }

    throw new Error('All stream servers are currently unavailable or high on load.')
  },

  /**
   * Get audio stream URL for a track.
   * Primary (Oracle VM) is used by default.
   * Automatically falls back to secondary/backup server if primary is down,
   * high on load, or unable to resolve the track.
   */
  async stream(
    title: string,
    artist: string,
    options?: { forceFallback?: boolean }
  ): Promise<StreamResult> {
    const now = Date.now()
    const hasFallback = !!FALLBACK_STREAM_URL && FALLBACK_STREAM_URL !== PRIMARY_STREAM_URL

    async function tryFetchStream(baseUrl: string, serverTag: 'primary' | 'fallback', timeoutMs: number): Promise<StreamResult> {
      const endpoint = `/stream?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`
      const res = await fetchWithTimeout(joinUrl(baseUrl, endpoint), {}, timeoutMs)
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
        throw new Error((body as { error?: string }).error || `HTTP ${res.status}`)
      }
      const data = await res.json() as StreamResult
      if (!data.streamUrl) {
        throw new Error(data.error || 'No stream URL returned')
      }
      return {
        streamUrl: data.streamUrl,
        quality: data.quality || 'high',
        mimeType: data.mimeType || 'audio/mp4',
        videoId: data.videoId,
        source: data.source,
        server: serverTag,
      }
    }

    // Only go directly to fallback if caller explicitly forced it
    if (options?.forceFallback && hasFallback) {
      try {
        const fallbackRes = await tryFetchStream(FALLBACK_STREAM_URL, 'fallback', 15000)
        streamFailoverState.activeServer = 'fallback'
        return fallbackRes
      } catch (fbErr) {
        return {
          streamUrl: '',
          error: fbErr instanceof Error ? fbErr.message : 'Fallback stream unavailable',
          server: 'fallback',
        }
      }
    }

    // Default & Preferred flow: Always try Primary (Oracle VM yt-dlp) first!
    try {
      const primaryRes = await tryFetchStream(PRIMARY_STREAM_URL, 'primary', 25000)
      streamFailoverState.primaryHealthy = true
      streamFailoverState.primaryCooldownUntil = 0
      streamFailoverState.activeServer = 'primary'
      return primaryRes
    } catch (primaryErr) {
      console.warn(`[StreamManager] Primary stream failed for "${title}" (${primaryErr}). Attempting fallback server...`)
      streamFailoverState.primaryHealthy = false
      streamFailoverState.primaryCooldownUntil = now + 15_000 // Short 15s cooldown before re-checking primary

      if (hasFallback) {
        try {
          const fallbackRes = await tryFetchStream(FALLBACK_STREAM_URL, 'fallback', 15000)
          streamFailoverState.activeServer = 'fallback'
          return fallbackRes
        } catch (fbErr) {
          console.warn('[StreamManager] Fallback stream also failed:', fbErr)
          return {
            streamUrl: '',
            error: fbErr instanceof Error ? fbErr.message : 'Stream temporarily unavailable on both servers',
            server: 'fallback',
          }
        }
      }

      return {
        streamUrl: '',
        error: primaryErr instanceof Error ? primaryErr.message : 'Stream temporarily unavailable',
        server: 'primary',
      }
    }
  },

  /** Get details about the active stream servers */
  getStreamServerInfo() {
    return {
      primaryUrl: PRIMARY_STREAM_URL,
      fallbackUrl: FALLBACK_STREAM_URL,
      activeServer: streamFailoverState.activeServer,
      isPrimaryHealthy: streamFailoverState.primaryHealthy,
      inCooldown: Date.now() < streamFailoverState.primaryCooldownUntil,
    }
  },

  /** Manually reset failover cooldown so next request immediately uses primary */
  resetStreamCooldown() {
    streamFailoverState.primaryCooldownUntil = 0
    streamFailoverState.primaryHealthy = true
    streamFailoverState.activeServer = 'primary'
  },

  /** Get synced lyrics for a track */
  async lyrics(title: string, artist: string): Promise<LyricsResult> {
    return request(`/lyrics?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`)
  },

  /** Get artist details + top songs */
  async artist(name: string): Promise<{ artist: Artist; tracks: Track[] }> {
    return request(`/artist?name=${encodeURIComponent(name)}`)
  },

  /** Get album details + tracks */
  async album(id: string): Promise<{ album: Album; tracks: Track[] }> {
    return request(`/album?id=${encodeURIComponent(id)}`)
  },

  /** Get personalized home feed with taste-affinity guarantee */
  async homeFeed(params: { recentArtists: string[]; favArtists: string; favSongs: string; likedTracks?: string[]; smartSeeds?: string[] }): Promise<Track[]> {
    const userArtists = [
      ...(params.favArtists ? params.favArtists.split(',').map((s) => s.trim().toLowerCase()) : []),
      ...(params.recentArtists || []).map((s) => s.trim().toLowerCase()),
    ].filter(Boolean)

    const query = new URLSearchParams({
      history: JSON.stringify(params.recentArtists),
      favArtists: params.favArtists,
      favSongs: params.favSongs,
      likedTracks: JSON.stringify(params.likedTracks || []),
      smartSeeds: JSON.stringify(params.smartSeeds || []),
    })

    let candidateTracks: Track[] = []

    try {
      const data = await request<{ tracks: Track[] }>(`/home-feed?${query.toString()}`)
      candidateTracks = filterCleanTracks(data.tracks || [])
    } catch {
      candidateTracks = []
    }

    // Check if response contains genuine tracks matching the user's declared artists/taste
    const hasTasteMatch =
      userArtists.length === 0 ||
      candidateTracks.some((t) => {
        const tArtist = (t.artist || '').toLowerCase()
        return userArtists.some((ua) => tArtist.includes(ua) || ua.includes(tArtist))
      })

    // If candidate response is empty OR completely divorced from user's declared taste (e.g. stale worker fallback returning unrelated songs):
    if (!hasTasteMatch || candidateTracks.length < 6) {
      const targetedQueries: string[] = []
      if (params.favArtists) {
        targetedQueries.push(...params.favArtists.split(',').map((s) => s.trim()).filter(Boolean))
      }
      if (params.recentArtists?.length) {
        targetedQueries.push(...params.recentArtists.slice(0, 2))
      }
      if (params.smartSeeds?.length) {
        targetedQueries.push(...params.smartSeeds.slice(0, 2))
      }
      if (targetedQueries.length === 0) {
        targetedQueries.push('Global Top Hits 2026')
      }

      const searchPromises = targetedQueries.slice(0, 3).map((q) =>
        api.search(q).then((res) => filterCleanTracks(res.tracks || [])).catch(() => [])
      )

      const searchBatches = await Promise.all(searchPromises)
      const directCandidates = searchBatches.flat()

      const seen = new Set<string>()
      const merged: Track[] = []

      for (const track of [...directCandidates, ...candidateTracks]) {
        const key = `${track.title.toLowerCase()}::${track.artist.toLowerCase()}`
        if (!seen.has(key)) {
          seen.add(key)
          merged.push(track)
        }
      }

      if (merged.length >= 6) {
        return merged.slice(0, 20)
      }
    }

    if (candidateTracks.length > 0) {
      return candidateTracks.slice(0, 20)
    }

    // Final fallback: Global Top Hits (never regional religious or irrelevant dumps)
    const fallback = await api.search('Global Top Hits 2026')
    return filterCleanTracks(fallback.tracks || []).slice(0, 20)
  },

  /** Get a smart infinite radio queue */
  async radio(params: { artist: string; historyTitles: string[]; favArtists: string; favSongs: string; excludeIds?: string[]; likedTracks?: string[]; smartSeeds?: string[] }): Promise<Track[]> {
    const query = new URLSearchParams({
      artist: params.artist,
      history: JSON.stringify(params.historyTitles),
      favArtists: params.favArtists,
      favSongs: params.favSongs,
      excludeIds: JSON.stringify(params.excludeIds || []),
      likedTracks: JSON.stringify(params.likedTracks || []),
      smartSeeds: JSON.stringify(params.smartSeeds || []),
    })
    try {
      const data = await request<{ tracks: Track[] }>(`/radio?${query.toString()}`)
      return filterCleanTracks(data.tracks || [])
    } catch {
      return []
    }
  },
}
