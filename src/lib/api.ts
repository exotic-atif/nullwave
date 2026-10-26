// ===== NULLWAVE API CLIENT =====

import type { Track, Album, Artist } from '@/types'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

// ===== STREAM SERVERS =====
// Primary server: Your Oracle Cloud VM proxy (default)
export const PRIMARY_STREAM_URL = (
  import.meta.env.VITE_STREAM_API_URL ||
  import.meta.env.VITE_PRIMARY_STREAM_API_URL ||
  'http://localhost:4000'
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
  const lines: SyncedLine[] = []
  for (const raw of lrc.split('\n')) {
    const match = raw.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\]\s*(.*)/)
    if (match) {
      const mins = parseInt(match[1])
      const secs = parseInt(match[2])
      const ms = parseInt(match[3].padEnd(3, '0'))
      let time = mins * 60 + secs + ms / 1000
      // Offset by -0.4s to fix late syncing
      time = Math.max(0, time - 0.4)
      const text = match[4].trim()
      if (text) {
        lines.push({ time, text })
      }
    }
  }
  return lines.sort((a, b) => a.time - b.time)
}

export const api = {
  async trending(): Promise<Track[]> {
    const data = await request<{ tracks: Track[] }>('/songs/trending')
    return data.tracks
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
    const inCooldown = now < streamFailoverState.primaryCooldownUntil

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

    // If caller requested forceFallback, or primary is in active cooldown
    if ((options?.forceFallback || inCooldown) && hasFallback) {
      try {
        const fallbackRes = await tryFetchStream(FALLBACK_STREAM_URL, 'fallback', 15000)
        streamFailoverState.activeServer = 'fallback'
        return fallbackRes
      } catch (fbErr) {
        console.warn('[StreamManager] Fallback stream failed:', fbErr)
        // If not explicitly forced, try primary as last ditch
        if (!options?.forceFallback) {
          try {
            const primaryRes = await tryFetchStream(PRIMARY_STREAM_URL, 'primary', 12000)
            streamFailoverState.primaryHealthy = true
            streamFailoverState.primaryCooldownUntil = 0
            streamFailoverState.activeServer = 'primary'
            return primaryRes
          } catch {}
        }
        return {
          streamUrl: '',
          error: fbErr instanceof Error ? fbErr.message : 'Stream temporarily unavailable',
          server: 'fallback',
        }
      }
    }

    // Default flow: Try Primary (Oracle VM) first
    try {
      const primaryRes = await tryFetchStream(PRIMARY_STREAM_URL, 'primary', 10000)
      streamFailoverState.primaryHealthy = true
      streamFailoverState.primaryCooldownUntil = 0
      streamFailoverState.activeServer = 'primary'
      return primaryRes
    } catch (primaryErr) {
      console.warn(`[StreamManager] Primary stream failed for "${title}" (${primaryErr}). Attempting fallback server...`)
      streamFailoverState.primaryHealthy = false
      streamFailoverState.primaryCooldownUntil = now + 40_000 // 40s cooldown

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

  /** Get personalized home feed */
  async homeFeed(params: { recentArtists: string[]; favArtists: string; favSongs: string; likedTracks?: string[]; smartSeeds?: string[] }): Promise<Track[]> {
    const query = new URLSearchParams({
      history: JSON.stringify(params.recentArtists),
      favArtists: params.favArtists,
      favSongs: params.favSongs,
      likedTracks: JSON.stringify(params.likedTracks || []),
      smartSeeds: JSON.stringify(params.smartSeeds || []),
    })
    const data = await request<{ tracks: Track[] }>(`/home-feed?${query.toString()}`)
    return data.tracks
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
    const data = await request<{ tracks: Track[] }>(`/radio?${query.toString()}`)
    return data.tracks
  },
}
