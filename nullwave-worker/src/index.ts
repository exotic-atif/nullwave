// ===== NULLWAVE WORKER — JioSaavn + LRCLIB =====

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

// ===== JIOSAAVN HELPERS =====

const SAAVN_BASE = 'https://www.jiosaavn.com/api.php'
const SAAVN_PARAMS = { _format: 'json', _marker: '0', ctx: 'web6dot0' }

async function saavnFetch(params: Record<string, string>): Promise<any> {
  const url = new URL(SAAVN_BASE)
  for (const [k, v] of Object.entries({ ...SAAVN_PARAMS, ...params })) {
    url.searchParams.set(k, v)
  }
  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': 'NullWave/1.0' },
  })
  if (!res.ok) throw new Error(`JioSaavn API error: ${res.status}`)
  return res.json()
}

function getHiResImage(url: string): string {
  return url
    .replace(/150x150/g, '500x500')
    .replace(/50x50/g, '500x500')
}

function htmlDecode(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

function mapTrack(s: any) {
  return {
    id: s.id || '',
    title: htmlDecode(s.song || s.title || ''),
    artist: htmlDecode(s.primary_artists || s.singers || s.music || ''),
    album: htmlDecode(s.album || 'Single'),
    albumId: s.albumid || s.id || '',
    duration: parseInt(s.duration) || 0,
    coverUrl: getHiResImage(s.image || ''),
    audioUrl: '', // Stream server handles playback
    year: s.year ? parseInt(s.year) : (s.release_date ? parseInt(s.release_date.substring(0, 4)) : 0),
    genre: htmlDecode(s.language || ''),
    spotifyUrl: s.perma_url || '',
  }
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

// ===== LRCLIB — Synced Lyrics =====

async function handleLyrics(title: string, artist: string): Promise<unknown> {
  try {
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

// ===== JIOSAAVN HANDLERS =====

async function handleTrending(): Promise<unknown> {
  // Use JioSaavn's "Trending Today" playlist (ID: 110858205)
  // and "Weekly Top Songs" for variety
  const playlistIds = ['110858205', '93518779', '93520680']
  const picked = playlistIds[Math.floor(Math.random() * playlistIds.length)]

  try {
    const data = await saavnFetch({
      __call: 'playlist.getDetails',
      listid: picked,
    })

    const songs = (data.songs || []) as any[]
    const tracks = songs.slice(0, 25).map(mapTrack)

    // Shuffle for variety
    for (let i = tracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[tracks[i], tracks[j]] = [tracks[j], tracks[i]]
    }

    return { tracks: tracks.slice(0, 20) }
  } catch {
    return { tracks: [] }
  }
}

async function handleSearch(query: string): Promise<unknown> {
  const data = await saavnFetch({
    __call: 'search.getResults',
    q: query,
    n: '25',
    p: '1',
  })

  const results = (data.results || []) as any[]

  // Deduplicate by title + artist
  const seenTracks = new Set<string>()
  const tracks = []
  for (const s of results) {
    const track = mapTrack(s)
    const key = `${track.title.toLowerCase()}::${track.artist.toLowerCase()}`
    if (!seenTracks.has(key)) {
      seenTracks.add(key)
      tracks.push(track)
    }
  }

  // Build albums from tracks
  const albumMap = new Map<string, any>()
  for (const t of tracks) {
    if (!albumMap.has(t.albumId)) {
      albumMap.set(t.albumId, {
        id: t.albumId,
        title: t.album,
        artist: t.artist,
        coverUrl: t.coverUrl,
        year: t.year,
        totalTracks: 1,
      })
    }
  }

  // Build artists from tracks
  const artistMap = new Map<string, any>()
  for (const s of results) {
    const ids = (s.primary_artists_id || '').split(',')
    const names = (s.primary_artists || '').split(',')
    for (let i = 0; i < ids.length && i < names.length; i++) {
      const id = ids[i].trim()
      const name = htmlDecode(names[i].trim())
      if (id && name && !artistMap.has(id)) {
        artistMap.set(id, {
          id,
          name,
          imageUrl: getHiResImage(s.image || ''),
          genres: s.language ? [htmlDecode(s.language)] : [],
        })
      }
    }
  }

  return {
    tracks,
    albums: Array.from(albumMap.values()).slice(0, 10),
    artists: Array.from(artistMap.values()).slice(0, 10),
  }
}

async function handleTrack(trackId: string): Promise<unknown> {
  const data = await saavnFetch({
    __call: 'song.getDetails',
    pids: trackId,
  })

  const songs = (data.songs || []) as any[]
  if (songs.length === 0) throw new Error('Track not found')

  return { track: mapTrack(songs[0]) }
}

async function handleArtist(artistId: string): Promise<unknown> {
  // Get artist info from artist search
  const searchData = await saavnFetch({
    __call: 'search.getArtistResults',
    q: artistId,
    n: '1',
    p: '1',
  })

  // Also get songs by this artist
  const songsData = await saavnFetch({
    __call: 'search.getResults',
    q: artistId,
    n: '20',
    p: '1',
  })

  const artistResults = (searchData.results || []) as any[]
  const songResults = (songsData.results || []) as any[]

  const artist = artistResults.length > 0
    ? {
        id: artistResults[0].artistId || artistResults[0].id || artistId,
        name: htmlDecode(artistResults[0].name || artistId),
        imageUrl: getHiResImage(artistResults[0].image || ''),
        bio: htmlDecode(artistResults[0].description || ''),
        genres: [],
      }
    : {
        id: artistId,
        name: artistId,
        imageUrl: '',
        bio: '',
        genres: [],
      }

  const tracks = songResults.map(mapTrack)

  return { artist, tracks }
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
        return json(await handleTrending(), 200, origin, env)
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

      // GET /artist?name=X
      if (path === '/artist') {
        const name = url.searchParams.get('name')?.trim()
        if (!name) return json({ error: 'Missing "name"' }, 400, origin, env)
        return json(await handleArtist(name), 200, origin, env)
      }

      // GET /track/:id
      const trackMatch = path.match(/^\/track\/(.+)$/)
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
