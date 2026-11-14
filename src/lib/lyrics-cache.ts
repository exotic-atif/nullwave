import { api, type LyricsResult } from '@/lib/api'

const cache = new Map<string, Promise<LyricsResult>>()
const MAX_CACHED_LYRICS = 60

function keyFor(title: string, artist: string) {
  return `${title.trim().toLocaleLowerCase()}\u0000${artist.trim().toLocaleLowerCase()}`
}

/** Start lyric lookup without coupling it to playback. Concurrent readers share one request. */
export function preloadLyrics(title: string, artist: string): Promise<LyricsResult> {
  const key = keyFor(title, artist)
  const existing = cache.get(key)
  if (existing) return existing

  const pending = api.lyrics(title, artist).catch(() => ({ synced: null, plain: null }))
  cache.set(key, pending)
  while (cache.size > MAX_CACHED_LYRICS) {
    const oldest = cache.keys().next().value
    if (oldest === undefined) break
    cache.delete(oldest)
  }
  return pending
}
