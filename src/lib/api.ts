// ===== NULLWAVE API CLIENT =====

import type { Track, Album, Artist } from '@/types'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

async function request<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`)
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

  /** Get full YouTube audio stream URL for a track */
  async stream(title: string, artist: string): Promise<StreamResult> {
    try {
      // Use yt-dlp Node server (port 4000)
      const res = await fetch(`http://localhost:4000/stream?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`)
      if (!res.ok) throw new Error('Stream failed')
      const data = await res.json()
      return {
        streamUrl: data.streamUrl,
        quality: data.quality || 'high',
        mimeType: data.mimeType || 'audio/mp4',
      }
    } catch (err) {
      return { streamUrl: '', error: 'Streaming service temporarily unavailable' }
    }
  },

  /** Get synced lyrics for a track */
  async lyrics(title: string, artist: string): Promise<LyricsResult> {
    return request(`/lyrics?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`)
  },
}
