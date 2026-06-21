// ===== NULLWAVE WORKER — JioSaavn + LRCLIB =====

interface Env {
  ALLOWED_ORIGINS: string
  CLOUDINARY_API_SECRET?: string
}

// ===== CORS =====

function corsHeaders(origin: string, env: Env): Record<string, string> {
  const allowed = env.ALLOWED_ORIGINS.split(',').map((s) => s.trim())
  const isAllowed = allowed.includes('*') || allowed.includes(origin)
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowed[0],
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
    headers: { 
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'X-Forwarded-For': '122.160.10.1',
      'X-Real-IP': '122.160.10.1',
      'client-ip': '122.160.10.1',
      'X-Country-Code': 'IN'
    },
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

function getBaseTitle(title: string): string {
  // Remove everything inside () or [] and common words like "feat.", "ft.", "-"
  return title.replace(/\[.*?\]|\(.*?\)/g, '').split('-')[0].trim().toLowerCase()
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
  // Fetch tracks, artists, and albums in parallel
  const [songsData, artistsData, albumsData] = await Promise.all([
    saavnFetch({
      __call: 'search.getResults',
      q: query,
      n: '25',
      p: '1',
    }).catch(() => ({ results: [] })),
    saavnFetch({
      __call: 'search.getArtistResults',
      q: query,
      n: '10',
      p: '1',
    }).catch(() => ({ results: [] })),
    saavnFetch({
      __call: 'search.getAlbumResults',
      q: query,
      n: '10',
      p: '1',
    }).catch(() => ({ results: [] }))
  ])

  // Tracks
  const songResults = (songsData.results || []) as any[]
  const seenTracks = new Set<string>()
  const tracks = []
  for (const s of songResults) {
    const track = mapTrack(s)
    const key = `${track.title.toLowerCase()}::${track.artist.toLowerCase()}`
    if (!seenTracks.has(key)) {
      seenTracks.add(key)
      tracks.push(track)
    }
  }

  // Artists
  const artistResults = (artistsData.results || []) as any[]
  const artists = artistResults.map((s) => ({
    id: s.artistId || s.id || '',
    name: htmlDecode(s.name || s.title || ''),
    imageUrl: getHiResImage(s.image || ''),
    genres: s.language ? [htmlDecode(s.language)] : [],
  }))

  // Albums
  const albumResults = (albumsData.results || []) as any[]
  const albums = albumResults.map((s) => ({
    id: s.id || '',
    title: htmlDecode(s.title || ''),
    artist: htmlDecode(s.music || s.primary_artists || ''),
    coverUrl: getHiResImage(s.image || ''),
    year: s.year ? parseInt(s.year) : 0,
    totalTracks: s.more_info?.song_pids ? s.more_info.song_pids.split(',').length : 1,
  }))

  return {
    tracks,
    artists,
    albums,
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

async function handleAlbum(albumId: string): Promise<unknown> {
  const data = await saavnFetch({
    __call: 'content.getAlbumDetails',
    albumid: albumId,
  })

  const album = {
    id: data.id || albumId,
    title: htmlDecode(data.title || ''),
    artist: htmlDecode(data.primary_artists || ''),
    coverUrl: getHiResImage(data.image || ''),
    year: data.year ? parseInt(data.year) : 0,
    totalTracks: data.songs ? data.songs.length : 0,
  }

  const tracks = (data.songs || []).map(mapTrack)

  return { album, tracks }
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

  const seenTracks = new Set<string>()
  const tracks = []
  for (const s of songResults) {
    const track = mapTrack(s)
    if (track.artist.toLowerCase().includes(artistId.toLowerCase())) {
      const key = `${track.title.toLowerCase()}::${track.artist.toLowerCase()}`
      if (!seenTracks.has(key)) {
        seenTracks.add(key)
        tracks.push(track)
      }
    }
  }

  return { artist, tracks }
}

async function handleRadio(artistId: string, historyStr: string): Promise<unknown> {
  let historyExclude: string[] = []
  try {
    const raw = JSON.parse(historyStr)
    if (Array.isArray(raw)) historyExclude = raw.map(t => getBaseTitle(String(t)))
  } catch {
    // Ignore parse errors
  }

  // Fetch songs by artist and potentially a related genre search
  const [artistData, hitsData] = await Promise.all([
    saavnFetch({ __call: 'search.getResults', q: artistId, n: '30', p: '1' }).catch(() => ({ results: [] })),
    saavnFetch({ __call: 'search.getResults', q: `${artistId} hits`, n: '30', p: '1' }).catch(() => ({ results: [] }))
  ])

  const songResults = [...(artistData.results || []), ...(hitsData.results || [])] as any[]
  
  // Filter and deduplicate
  const seenTracks = new Set<string>()
  const tracks = []
  
  const badKeywords = ['slowed', 'reverb', 'speed', 'sped', 'lofi', 'remix', 'mashup', 'instrumental', 'karaoke', 'live']

  for (const s of songResults) {
    const track = mapTrack(s)
    const titleLower = track.title.toLowerCase()
    
    // Skip bad versions
    const isGarbage = badKeywords.some(b => titleLower.includes(b))
    if (isGarbage) continue

    const baseTitle = getBaseTitle(track.title)
    
    // Aggressively skip if it matches any recently played song's base title
    const isInHistory = historyExclude.some(hx => {
      if (!baseTitle || !hx) return false
      return baseTitle === hx || baseTitle.includes(hx) || hx.includes(baseTitle)
    })
    
    if (isInHistory) continue

    // Deduplicate by base title so we don't return 5 versions of another song
    const key = `${baseTitle}::${track.artist.toLowerCase()}`
    if (!seenTracks.has(key)) {
      seenTracks.add(key)
      tracks.push(track)
    }
  }

  // Shuffle the valid tracks
  for (let i = tracks.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[tracks[i], tracks[j]] = [tracks[j], tracks[i]]
  }

  // Pick up to 20 tracks
  let batch = tracks.slice(0, 20)
  
  if (batch.length === 0) {
    // Ultimate fallback if filtered out everything
    const randomFallback = songResults[Math.floor(Math.random() * songResults.length)]
    if (!randomFallback) throw new Error('No recommendations found')
    batch = [mapTrack(randomFallback)]
  }
  
  return { tracks: batch }
}

async function handleHomeFeed(recentArtistsStr: string): Promise<unknown> {
  try {
    const recentArtists = JSON.parse(recentArtistsStr) as string[]
    if (!recentArtists || recentArtists.length === 0) {
      return await handleTrending()
    }

    // Pick up to 3 random artists from history to search
    const shuffledArtists = [...recentArtists].sort(() => 0.5 - Math.random()).slice(0, 3)
    const fetchPromises = shuffledArtists.map(a => 
      saavnFetch({ __call: 'search.getResults', q: a, n: '15', p: '1' }).catch(() => ({ results: [] }))
    )
    
    const resultsArray = await Promise.all(fetchPromises)
    const songResults = resultsArray.flatMap(r => r.results || [])

    const seenTracks = new Set<string>()
    const tracks = []
    
    for (const s of songResults) {
      const track = mapTrack(s)
      if (!seenTracks.has(track.id)) {
        seenTracks.add(track.id)
        tracks.push(track)
      }
    }

    // Shuffle final tracks
    for (let i = tracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[tracks[i], tracks[j]] = [tracks[j], tracks[i]]
    }

    return { tracks: tracks.slice(0, 25) }
  } catch {
    return await handleTrending()
  }
}

// ===== MAIN HANDLER =====

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const origin = request.headers.get('Origin') || ''

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin, env) })
    }

    if (request.method !== 'GET' && request.method !== 'POST') {
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

      // GET /album?id=X
      if (path === '/album') {
        const id = url.searchParams.get('id')?.trim()
        if (!id) return json({ error: 'Missing "id"' }, 400, origin, env)
        return json(await handleAlbum(id), 200, origin, env)
      }

      // GET /radio?artist=X&history=["A", "B"]
      if (path === '/radio') {
        const artist = url.searchParams.get('artist')?.trim()
        const historyStr = url.searchParams.get('history')?.trim() || '[]'
        if (!artist) return json({ error: 'Missing "artist"' }, 400, origin, env)
        return json(await handleRadio(artist, historyStr), 200, origin, env)
      }

      // GET /home-feed?history=X
      if (path === '/home-feed') {
        const historyStr = url.searchParams.get('history')?.trim() || '[]'
        return json(await handleHomeFeed(historyStr), 200, origin, env)
      }

      // GET /track/:id
      const trackMatch = path.match(/^\/track\/(.+)$/)
      if (trackMatch) {
        return json(await handleTrack(trackMatch[1]), 200, origin, env)
      }

      // POST /sign-upload (Cloudinary)
      if (path === '/sign-upload' && request.method === 'POST') {
        if (!env.CLOUDINARY_API_SECRET) {
          return json({ error: 'Missing CLOUDINARY_API_SECRET in worker' }, 500, origin, env)
        }
        
        try {
          const body = await request.json() as Record<string, string>
          const timestamp = Math.round(new Date().getTime() / 1000).toString()
          
          // Generate signature based on params
          // Cloudinary requires alphabetically sorted params joined by '&'
          const paramsToSign = {
            timestamp,
            ...body // Any other params passed from frontend (e.g. folder, public_id)
          }
          
          const sortedKeys = Object.keys(paramsToSign).sort()
          const signString = sortedKeys.map(k => `${k}=${paramsToSign[k as keyof typeof paramsToSign]}`).join('&')
          
          const encoder = new TextEncoder()
          const data = encoder.encode(signString + env.CLOUDINARY_API_SECRET)
          const hashBuffer = await crypto.subtle.digest('SHA-1', data)
          const hashArray = Array.from(new Uint8Array(hashBuffer))
          const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
          
          return json({ signature, timestamp }, 200, origin, env)
        } catch (e) {
          return json({ error: 'Invalid JSON payload' }, 400, origin, env)
        }
      }

      // Add POST to method check for /sign-upload
      if (request.method !== 'GET' && path !== '/sign-upload') {
        return json({ error: 'Method not allowed' }, 405, origin, env)
      }

      return json({ error: 'Not found' }, 404, origin, env)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal server error'
      return json({ error: message }, 500, origin, env)
    }
  },
} satisfies ExportedHandler<Env>
