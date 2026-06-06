// ===== NULLWAVE API CLIENT =====

import type { Track, Album, Artist } from '@/types'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'
const STREAM_BASE_URL = import.meta.env.VITE_STREAM_API_URL || 'http://localhost:4000'

function joinUrl(baseUrl: string, endpoint: string): string {
  return `${baseUrl.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`
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
  error?: string
}

export interface StreamHealthResult {
  ok: boolean
  service: string
  startedAt: string
  uptime: number
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

  /** Check whether the Node stream server has responded */
  async streamHealth(): Promise<StreamHealthResult> {
    return request<StreamHealthResult>('/health', STREAM_BASE_URL)
  },

  /** Get full YouTube audio stream URL for a track */
  async stream(title: string, artist: string): Promise<StreamResult> {
    try {
      const data = await request<StreamResult>(
        `/stream?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`,
        STREAM_BASE_URL,
      )
      return {
        streamUrl: data.streamUrl,
        quality: data.quality || 'high',
        mimeType: data.mimeType || 'audio/mp4',
      }
    } catch (err) {
      return {
        streamUrl: '',
        error: err instanceof Error ? err.message : 'Streaming service temporarily unavailable',
      }
    }
  },

  /** Get synced lyrics for a track */
  async lyrics(title: string, artist: string): Promise<LyricsResult> {
    return request(`/lyrics?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`)
  },
}
