// ===== NULLWAVE WORKER — iTunes + Piped + LRCLIB =====

interface Env {
  ALLOWED_ORIGINS: string
}

// ===== CORS =====

function corsHeaders(origin: string, env: Env): Record<string, string> {
  const allowed = env.ALLOWED_ORIGINS.split(',').map((s) => s.trim())
  const isAllowed = allowed.includes('*') || allowed.includes(origin)
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowed[0],
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  }
}

function json(data: unknown, status: number, origin: string, env: Env): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(origin, env),
    },
  })
}

// ===== iTunes TYPES =====

interface iTunesResult {
  trackId: number
  trackName: string
  artistName: string
  collectionName: string
  collectionId: number
  artworkUrl100: string
  previewUrl: string
  trackTimeMillis: number
  releaseDate: string
  primaryGenreName: string
  trackViewUrl: string
}

interface iTunesResponse {
  resultCount: number
  results: iTunesResult[]
}

// ===== LRCLIB TYPES =====

interface LrcLibResult {
  id: number
  trackName: string
  artistName: string
  albumName: string
  duration: number
  syncedLyrics: string | null
  plainLyrics: string | null
}

// ===== MAPPING =====

function getHiResArtwork(url: string): string {
  return url.replace('100x100bb', '600x600bb')
}

function mapTrack(t: iTunesResult) {
  return {
    id: String(t.trackId),
    title: t.trackName,
    artist: t.artistName,
    album: t.collectionName || 'Single',
    albumId: String(t.collectionId || t.trackId),
    duration: Math.floor((t.trackTimeMillis || 0) / 1000),
    coverUrl: getHiResArtwork(t.artworkUrl100 || ''),
    audioUrl: t.previewUrl || '',
    year: t.releaseDate ? parseInt(t.releaseDate.substring(0, 4)) : 0,
    genre: t.primaryGenreName || '',
    spotifyUrl: t.trackViewUrl || '',
  }
}



// ===== LRCLIB — Synced Lyrics =====

async function handleLyrics(title: string, artist: string): Promise<unknown> {
  try {
    // Try exact match first
    const res = await fetch(
      `https://lrclib.net/api/search?track_name=${encodeURIComponent(title)}&artist_name=${encodeURIComponent(artist)}`,
      { headers: { 'User-Agent': 'NullWave/1.0' } }
    )

    if (!res.ok) {
      return { synced: null, plain: null }
    }

    const results = (await res.json()) as LrcLibResult[]

    if (results.length === 0) {
      return { synced: null, plain: null }
    }

    // Pick the best result (prefer one with synced lyrics)
    const withSynced = results.find((r) => r.syncedLyrics)
    const best = withSynced || results[0]

    return {
      synced: best.syncedLyrics || null,
      plain: best.plainLyrics || null,
      trackName: best.trackName,
      artistName: best.artistName,
      albumName: best.albumName,
    }
  } catch {
    return { synced: null, plain: null }
  }
}

// ===== iTunes HANDLERS =====

async function handleTrending(env: Env): Promise<unknown> {
  const queries = [
    'The Weeknd',
    'Arijit Singh',
    'Char Diwari',
    'Coke Studio',
    'Pritam',
    'Dua Lipa',
    'Anuv Jain',
    'Post Malone',
  ]
  
  // Pick 3 random artists/queries to fetch to save time
  const shuffledQueries = queries.sort(() => 0.5 - Math.random()).slice(0, 3)

  const allTracks: ReturnType<typeof mapTrack>[] = []
  const seenIds = new Set<string>()

  for (const q of shuffledQueries) {
    try {
      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&entity=song&limit=10`
      )
      if (!res.ok) continue
      const data = (await res.json()) as iTunesResponse

      for (const t of data.results) {
        const id = String(t.trackId)
        if (!seenIds.has(id)) {
          seenIds.add(id)
          allTracks.push(mapTrack(t))
        }
      }
    } catch {
      // Skip failed queries
    }
  }

  // Shuffle the combined tracks
  const randomMix = allTracks.sort(() => 0.5 - Math.random()).slice(0, 20)

  return { tracks: randomMix }
}

async function handleSearch(query: string): Promise<unknown> {
  const res = await fetch(
    `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=25`
  )

  if (!res.ok) {
    throw new Error(`iTunes API error: ${res.status}`)
  }

  const data = (await res.json()) as iTunesResponse
  
  // Deduplicate tracks by title and artist
  const uniqueTracks = []
  const seenTracks = new Set<string>()
  
  for (const t of data.results) {
    const track = mapTrack(t)
    const key = `${track.title.toLowerCase()}::${track.artist.toLowerCase()}`
    if (!seenTracks.has(key)) {
      seenTracks.add(key)
      uniqueTracks.push(track)
    }
  }
  const tracks = uniqueTracks

  const albumMap = new Map<string, { id: string; title: string; artist: string; coverUrl: string; year: number; totalTracks: number }>()
  for (const t of tracks) {
    if (!albumMap.has(t.albumId)) {
      albumMap.set(t.albumId, { id: t.albumId, title: t.album, artist: t.artist, coverUrl: t.coverUrl, year: t.year, totalTracks: 1 })
    }
  }

  const artistMap = new Map<string, { id: string; name: string; imageUrl: string; genres: string[] }>()
  for (const t of data.results) {
    if (!artistMap.has(t.artistName)) {
      artistMap.set(t.artistName, { id: t.artistName, name: t.artistName, imageUrl: getHiResArtwork(t.artworkUrl100 || ''), genres: t.primaryGenreName ? [t.primaryGenreName] : [] })
    }
  }

  return {
    tracks,
    albums: Array.from(albumMap.values()).slice(0, 10),
    artists: Array.from(artistMap.values()).slice(0, 10),
  }
}

async function handleTrack(trackId: string): Promise<unknown> {
  const res = await fetch(`https://itunes.apple.com/lookup?id=${trackId}`)
  if (!res.ok) throw new Error(`iTunes API error: ${res.status}`)
  const data = (await res.json()) as iTunesResponse
  if (data.results.length === 0) throw new Error('Track not found')
  return { track: mapTrack(data.results[0]) }
}



// ===== MAIN HANDLER =====

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const origin = request.headers.get('Origin') || ''

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin, env) })
    }

    if (request.method !== 'GET') {
      return json({ error: 'Method not allowed' }, 405, origin, env)
    }

    try {
      const path = url.pathname

      // GET /songs/trending
      if (path === '/songs/trending') {
        return json(await handleTrending(env), 200, origin, env)
      }

      // GET /search?q=
      if (path === '/search') {
        const query = url.searchParams.get('q')?.trim()
        if (!query) return json({ error: 'Missing "q"' }, 400, origin, env)
        return json(await handleSearch(query), 200, origin, env)
      }



      // GET /lyrics?title=X&artist=Y
      if (path === '/lyrics') {
        const title = url.searchParams.get('title')?.trim()
        const artist = url.searchParams.get('artist')?.trim()
        if (!title) return json({ error: 'Missing "title"' }, 400, origin, env)
        return json(await handleLyrics(title, artist || ''), 200, origin, env)
      }

      // GET /track/:id
      const trackMatch = path.match(/^\/track\/([0-9]+)$/)
      if (trackMatch) {
        return json(await handleTrack(trackMatch[1]), 200, origin, env)
      }

      return json({ error: 'Not found' }, 404, origin, env)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal server error'
      return json({ error: message }, 500, origin, env)
    }
  },
} satisfies ExportedHandler<Env>
