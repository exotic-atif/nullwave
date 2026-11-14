// ===== NULLWAVE WORKER — JioSaavn + LRCLIB =====

interface Env {
  ALLOWED_ORIGINS: string
  CLOUDINARY_API_SECRET?: string
  SUPABASE_URL?: string
  SUPABASE_SERVICE_ROLE_KEY?: string
}

// ===== CORS =====

function corsHeaders(origin: string, env: Env): Record<string, string> {
  const allowed = env.ALLOWED_ORIGINS.split(',').map((s) => s.trim())
  const isAllowed = allowed.includes('*') || allowed.includes(origin)
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowed[0],
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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

function mapTrack(s: any, suggestionReason?: string) {
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
    suggestionReason
  }
}

function rankRecommendations(
  tracks: any[],
  context: { favoriteArtists?: string[]; recentArtists?: string[]; favoriteSongs?: string[]; likedTracks?: string[] }
) {
  const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
  const matches = (candidate: string, preferences: string[] = []) =>
    preferences.some((value) => {
      const needle = normalize(value)
      return needle.length > 1 && candidate.includes(needle)
    })

  const scored = tracks.map((track) => {
    const artist = normalize(track.artist || '')
    const title = normalize(track.title || '')
    const reason = normalize(track.suggestionReason || '')
    let score = 0
    if (reason.includes('high affinity')) score += 4
    if (reason.includes('because you liked')) score += 3
    if (reason.includes('because you like')) score += 2.5
    if (reason.includes('recent listening')) score += 1.5
    if (matches(artist, context.favoriteArtists)) score += 3
    if (matches(artist, context.recentArtists)) score += 1.5
    if (matches(title, context.favoriteSongs)) score += 2
    if (matches(title, context.likedTracks)) score += 2.5
    return { track, score, artist }
  }).sort((a, b) => b.score - a.score)

  // Greedy artist diversity: preserve relevance while avoiding same-artist streaks.
  const ranked: any[] = []
  while (scored.length && ranked.length < 20) {
    let bestIndex = 0
    let bestScore = Number.NEGATIVE_INFINITY
    scored.forEach((candidate, index) => {
      const repeatedArtist = ranked.length > 0 && normalize(ranked[ranked.length - 1].artist || '') === candidate.artist
      const adjusted = candidate.score - (repeatedArtist ? 1.25 : 0)
      if (adjusted > bestScore) { bestScore = adjusted; bestIndex = index }
    })
    ranked.push(scored.splice(bestIndex, 1)[0].track)
  }
  return ranked
}

// ===== NATIVE RECOMMENDATION ENGINE =====
async function fetchNativeRecommendations(songId: string): Promise<any[]> {
  try {
    const res = await saavnFetch({ __call: 'reco.getreco', pid: songId })
    return Array.isArray(res) ? res : []
  } catch {
    return []
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
    const tracks = songs.slice(0, 25).map((s: any) => mapTrack(s))

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

  const tracks = (data.songs || []).map((s: any) => mapTrack(s))

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

async function handleRadio(
  artistId: string,
  historyStr: string,
  favArtistsStr: string,
  favSongsStr: string,
  excludeIdsStr: string,
  likedTracksStr: string,
  smartSeedsStr: string = '[]'
): Promise<unknown> {
  // Input length guards (ratings.md security fix)
  const cleanArtist = (artistId || '').slice(0, 100).trim()
  if (!cleanArtist) return { tracks: [] }
  if (historyStr.length > 2000) historyStr = historyStr.slice(0, 2000)
  if (favArtistsStr.length > 500) favArtistsStr = favArtistsStr.slice(0, 500)
  if (favSongsStr.length > 500) favSongsStr = favSongsStr.slice(0, 500)
  if (excludeIdsStr.length > 2000) excludeIdsStr = excludeIdsStr.slice(0, 2000)
  if (likedTracksStr.length > 2000) likedTracksStr = likedTracksStr.slice(0, 2000)
  if (smartSeedsStr.length > 2000) smartSeedsStr = smartSeedsStr.slice(0, 2000)

  let historyExclude: string[] = []
  let excludeIds: string[] = []
  try {
    const rawHistory = JSON.parse(historyStr)
    if (Array.isArray(rawHistory)) historyExclude = rawHistory.map(t => getBaseTitle(String(t)))

    const rawExclude = JSON.parse(excludeIdsStr)
    if (Array.isArray(rawExclude)) excludeIds = rawExclude.map(String)
  } catch {
    // Ignore parse errors
  }

  const favArtists = favArtistsStr ? favArtistsStr.split(',').map(s => s.trim()).filter(Boolean) : []
  const favSongs = favSongsStr ? favSongsStr.split(',').map(s => s.trim()).filter(Boolean) : []

  // High quality search seeds: query artist tracks directly instead of noisy reco.getreco
  const searches: { promise: Promise<any>, reason: string }[] = []

  // 1. Primary artist tracks & hits
  searches.push({
    promise: saavnFetch({ __call: 'search.getResults', q: cleanArtist, n: '15', p: '1' }).then(res => res.results || []).catch(() => []),
    reason: `Top tracks from ${cleanArtist}`
  })
  searches.push({
    promise: saavnFetch({ __call: 'search.getResults', q: `${cleanArtist} hits`, n: '10', p: '1' }).then(res => res.results || []).catch(() => []),
    reason: `Popular hits from ${cleanArtist}`
  })

  // 2. Favorite artist if available
  if (favArtists.length > 0) {
    const randomFav = favArtists[Math.floor(Math.random() * favArtists.length)]
    searches.push({
      promise: saavnFetch({ __call: 'search.getResults', q: randomFav, n: '10', p: '1' }).then(res => res.results || []).catch(() => []),
      reason: `Because you like ${randomFav}`
    })
  }

  // 3. Favorite song if available
  if (favSongs.length > 0) {
    const randomSong = favSongs[Math.floor(Math.random() * favSongs.length)]
    searches.push({
      promise: saavnFetch({ __call: 'search.getResults', q: randomSong, n: '8', p: '1' }).then(res => res.results || []).catch(() => []),
      reason: `Because you love ${randomSong}`
    })
  }

  // 4. Smart seeds
  let smartSeeds: string[] = []
  try { smartSeeds = JSON.parse(smartSeedsStr) } catch { }
  if (smartSeeds.length > 0) {
    for (const seedStr of smartSeeds.slice(0, 2)) {
      searches.push({
        promise: saavnFetch({ __call: 'search.getResults', q: seedStr, n: '8', p: '1' }).then(res => res.results || []).catch(() => []),
        reason: `Based on your high affinity listening`
      })
    }
  }

  const resultsWithReason = await Promise.all(
    searches.map(async (s) => {
      const results = await s.promise
      return { results: Array.isArray(results) ? results : [], reason: s.reason }
    })
  )

  // Filter and deduplicate
  const badKeywords = ['slowed', 'reverb', 'reverbed', 'speed', 'sped', 'lofi', 'remix', 'mashup', 'instrumental', 'karaoke', 'live', 'solo', '8d', 'acapella', 'bass boosted']
  const seen = new Set<string>()
  const validTracks = []

  for (const group of resultsWithReason) {
    for (const s of group.results) {
      if (!s.id) continue
      const track = mapTrack(s, group.reason)
      const titleLower = track.title.toLowerCase()

      const isGarbage = badKeywords.some(b => titleLower.includes(b))
      if (isGarbage) continue

      if (excludeIds.includes(track.id)) continue

      const baseTitle = getBaseTitle(track.title)
      const isInHistory = historyExclude.some(hx => {
        if (!baseTitle || !hx) return false
        return baseTitle === hx || baseTitle.includes(hx) || hx.includes(baseTitle)
      })
      if (isInHistory) continue

      const key = `${baseTitle}::${track.artist.toLowerCase()}`
      if (!seen.has(key)) {
        seen.add(key)
        validTracks.push(track)
      }
    }
  }

  // Shuffle for variety
  for (let i = validTracks.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[validTracks[i], validTracks[j]] = [validTracks[j], validTracks[i]]
  }

  return { tracks: validTracks.slice(0, 15) }
}

async function handleHomeFeed(
  recentArtistsStr: string,
  favArtistsStr: string,
  favSongsStr: string,
  likedTracksStr: string,
  smartSeedsStr: string = '[]'
): Promise<unknown> {
  try {
    // Input length guards (ratings.md security fix)
    if (recentArtistsStr.length > 1000) recentArtistsStr = recentArtistsStr.slice(0, 1000)
    if (favArtistsStr.length > 500) favArtistsStr = favArtistsStr.slice(0, 500)
    if (favSongsStr.length > 500) favSongsStr = favSongsStr.slice(0, 500)
    if (likedTracksStr.length > 2000) likedTracksStr = likedTracksStr.slice(0, 2000)
    if (smartSeedsStr.length > 2000) smartSeedsStr = smartSeedsStr.slice(0, 2000)

    let recentArtists: string[] = []
    try { recentArtists = JSON.parse(recentArtistsStr) } catch { }

    const favArtists = favArtistsStr ? favArtistsStr.split(',').map(s => s.trim()).filter(Boolean) : []
    const favSongs = favSongsStr ? favSongsStr.split(',').map(s => s.trim()).filter(Boolean) : []
    let likedTracks: string[] = []
    try { likedTracks = JSON.parse(likedTracksStr) } catch { }

    const searches: { promise: Promise<any>, reason: string }[] = []

    let smartSeeds: string[] = []
    try { smartSeeds = JSON.parse(smartSeedsStr) } catch { }

    // 1. High-priority Smart Seeds (actual tracks the user finished listening to)
    if (smartSeeds.length > 0) {
      for (const seedStr of smartSeeds.slice(0, 3)) {
        searches.push({
          promise: saavnFetch({ __call: 'search.getResults', q: seedStr, n: '8', p: '1' }).then(res => res.results || []).catch(() => []),
          reason: `Based on your high affinity listening`
        })
      }
    }

    // 2. Favorite Artists
    if (favArtists.length > 0) {
      for (const a of favArtists.slice(0, 2)) {
        searches.push({
          promise: saavnFetch({ __call: 'search.getResults', q: a, n: '8', p: '1' }).then(res => res.results || []).catch(() => []),
          reason: `Because you like ${a}`
        })
      }
    }

    // 3. Recent Artists
    if (recentArtists.length > 0) {
      for (const a of recentArtists.slice(0, 2)) {
        searches.push({
          promise: saavnFetch({ __call: 'search.getResults', q: a, n: '8', p: '1' }).then(res => res.results || []).catch(() => []),
          reason: `Based on your recent listening: ${a}`
        })
      }
    }

    // 4. Favorite Songs
    if (favSongs.length > 0) {
      const s = favSongs[Math.floor(Math.random() * favSongs.length)]
      searches.push({
        promise: saavnFetch({ __call: 'search.getResults', q: s, n: '6', p: '1' }).then(res => res.results || []).catch(() => []),
        reason: `Because you love ${s}`
      })
    }

    // 5. Liked Tracks
    if (likedTracks.length > 0) {
      const randomLikedTrack = likedTracks[Math.floor(Math.random() * likedTracks.length)]
      searches.push({
        promise: saavnFetch({ __call: 'search.getResults', q: randomLikedTrack, n: '6', p: '1' }).then(res => res.results || []).catch(() => []),
        reason: `Because you liked ${randomLikedTrack}`
      })
    }

    // If candidate list is empty, add popular fallback searches
    if (searches.length === 0) {
      searches.push({
        promise: saavnFetch({ __call: 'search.getResults', q: 'Top Hits 2026', n: '15', p: '1' }).then(res => res.results || []).catch(() => []),
        reason: 'Trending on NullWave'
      })
    }

    const settled = await Promise.allSettled(
      searches.map(async (s) => {
        const results = await s.promise
        return { results: Array.isArray(results) ? results : [], reason: s.reason }
      })
    )

    const resultsWithReason = settled
      .filter((r): r is PromiseFulfilledResult<{ results: any[], reason: string }> => r.status === 'fulfilled')
      .map(r => r.value)

    const badKeywords = ['slowed', 'reverb', 'reverbed', 'speed', 'sped', 'lofi', 'remix', 'mashup', 'instrumental', 'karaoke', 'live', 'solo', '8d', 'acapella', 'bass boosted']
    const seenTracks = new Set<string>()
    const tracks = []

    for (const group of resultsWithReason) {
      for (const s of group.results) {
        if (!s.id) continue
        const track = mapTrack(s, group.reason)
        const titleLower = track.title.toLowerCase()
        if (badKeywords.some(b => titleLower.includes(b))) continue

        const baseTitle = getBaseTitle(track.title)
        const dedupKey = `${baseTitle}::${track.artist.toLowerCase()}`

        if (!seenTracks.has(dedupKey)) {
          seenTracks.add(dedupKey)
          tracks.push(track)
        }
      }
    }

    const rankedTracks = rankRecommendations(tracks, { favoriteArtists: favArtists, recentArtists, favoriteSongs: favSongs, likedTracks })

    if (rankedTracks.length === 0) {
      return await handleTrending()
    }

    return { tracks: rankedTracks }
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

    if (request.method !== 'GET' && request.method !== 'POST' && request.method !== 'DELETE') {
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
        if (query.length > 200) return json({ error: 'Query parameter too long (max 200 chars)' }, 400, origin, env)
        return json(await handleSearch(query), 200, origin, env)
      }

      // GET /lyrics?title=X&artist=Y
      if (path === '/lyrics') {
        const title = url.searchParams.get('title')?.trim()
        const artist = url.searchParams.get('artist')?.trim()
        if (!title) return json({ error: 'Missing "title"' }, 400, origin, env)
        if (title.length > 200 || (artist && artist.length > 200)) {
          return json({ error: 'Parameters too long (max 200 chars)' }, 400, origin, env)
        }
        return json(await handleLyrics(title, artist || ''), 200, origin, env)
      }

      // GET /artist?name=X
      if (path === '/artist') {
        const name = url.searchParams.get('name')?.trim()
        if (!name) return json({ error: 'Missing "name"' }, 400, origin, env)
        if (name.length > 200) return json({ error: 'Name parameter too long (max 200 chars)' }, 400, origin, env)
        return json(await handleArtist(name), 200, origin, env)
      }

      // GET /album?id=X
      if (path === '/album') {
        const id = url.searchParams.get('id')?.trim()
        if (!id) return json({ error: 'Missing "id"' }, 400, origin, env)
        if (id.length > 200) return json({ error: 'Id parameter too long (max 200 chars)' }, 400, origin, env)
        return json(await handleAlbum(id), 200, origin, env)
      }

      // GET /radio?artist=X&history=["A", "B"]
      if (path === '/radio') {
        const artist = url.searchParams.get('artist')?.trim()
        if (!artist) return json({ error: 'Missing "artist"' }, 400, origin, env)
        if (artist.length > 200) return json({ error: 'Artist parameter too long (max 200 chars)' }, 400, origin, env)

        const historyStr = url.searchParams.get('history')?.trim() || '[]'
        const favArtistsStr = url.searchParams.get('favArtists')?.trim() || ''
        const favSongsStr = url.searchParams.get('favSongs')?.trim() || ''
        const excludeIdsStr = url.searchParams.get('excludeIds')?.trim() || '[]'
        const likedTracksStr = url.searchParams.get('likedTracks')?.trim() || '[]'
        const smartSeedsStr = url.searchParams.get('smartSeeds')?.trim() || '[]'

        if (historyStr.length > 10000 || likedTracksStr.length > 10000) {
          return json({ error: 'History payload too large' }, 400, origin, env)
        }

        return json(await handleRadio(artist, historyStr, favArtistsStr, favSongsStr, excludeIdsStr, likedTracksStr, smartSeedsStr), 200, origin, env)
      }

      // GET /home-feed?history=X
      if (path === '/home-feed') {
        const historyStr = url.searchParams.get('history')?.trim() || '[]'
        const favArtistsStr = url.searchParams.get('favArtists')?.trim() || ''
        const favSongsStr = url.searchParams.get('favSongs')?.trim() || ''
        const likedTracksStr = url.searchParams.get('likedTracks')?.trim() || '[]'
        const smartSeedsStr = url.searchParams.get('smartSeeds')?.trim() || '[]'
        if (historyStr.length > 10000 || likedTracksStr.length > 10000) {
          return json({ error: 'Feed payload too large' }, 400, origin, env)
        }
        return json(await handleHomeFeed(historyStr, favArtistsStr, favSongsStr, likedTracksStr, smartSeedsStr), 200, origin, env)
      }

      // GET /track/:id
      const trackMatch = path.match(/^\/track\/([a-zA-Z0-9_-]+)$/)
      if (trackMatch) {
        return json(await handleTrack(trackMatch[1]), 200, origin, env)
      }

      // POST /sign-upload (Cloudinary — hardened with strict parameter allowlist & folder validation)
      if (path === '/sign-upload' && request.method === 'POST') {
        if (!env.CLOUDINARY_API_SECRET) {
          return json({ error: 'Missing CLOUDINARY_API_SECRET in worker' }, 500, origin, env)
        }

        try {
          const body = await request.json() as Record<string, string>
          const folder = String(body.folder || '').trim()
          const publicId = String(body.public_id || '').trim()

          // 1. Enforce strict folder allowlist
          const ALLOWED_FOLDERS = ['nullwave_pfps', 'nullwave_requests']
          if (!ALLOWED_FOLDERS.includes(folder)) {
            return json({ error: 'Invalid or forbidden upload folder' }, 403, origin, env)
          }

          // 2. Validate public_id to prevent path traversal or special chars
          // For nullwave_requests, always enforce a secure random server-generated ID to prevent ID targeting
          const finalPublicId = folder === 'nullwave_requests'
            ? `req_${crypto.randomUUID().replace(/-/g, '')}`
            : publicId

          if (folder === 'nullwave_pfps' && (!finalPublicId || !/^[a-zA-Z0-9_-]{1,128}$/.test(finalPublicId))) {
            return json({ error: 'Invalid public_id (must be alphanumeric, hyphens, or underscores up to 128 chars)' }, 400, origin, env)
          }

          const timestamp = Math.round(new Date().getTime() / 1000).toString()

          // 3. Strict parameter allowlist: only sign folder, public_id, timestamp, and conditionally overwrite/invalidate
          const paramsToSign: Record<string, string> = {
            folder,
            public_id: finalPublicId,
            timestamp,
          }

          // Only nullwave_pfps is allowed to overwrite/invalidate; requests can never overwrite
          if (folder === 'nullwave_pfps' && (body.overwrite === 'true' || body.overwrite === '1')) {
            paramsToSign.invalidate = 'true'
            paramsToSign.overwrite = 'true'
          }

          const sortedKeys = Object.keys(paramsToSign).sort()
          const signString = sortedKeys.map(k => `${k}=${paramsToSign[k]}`).join('&')

          const encoder = new TextEncoder()
          const data = encoder.encode(signString + env.CLOUDINARY_API_SECRET)
          const hashBuffer = await crypto.subtle.digest('SHA-1', data)
          const hashArray = Array.from(new Uint8Array(hashBuffer))
          const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

          return json({ signature, timestamp, folder, public_id: finalPublicId }, 200, origin, env)
        } catch (e) {
          return json({ error: 'Invalid JSON payload' }, 400, origin, env)
        }
      }

      // Deprecated /admin routes: return 410 Gone as operations are now managed directly in Firestore
      if (path.startsWith('/admin/')) {
        return json({ error: 'Admin routes are deprecated and migrated to direct Firestore management' }, 410, origin, env)
      }

      // Method check
      if (request.method !== 'GET' && request.method !== 'POST') {
        return json({ error: 'Method not allowed' }, 405, origin, env)
      }

      return json({ error: 'Not found' }, 404, origin, env)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal server error'
      return json({ error: message }, 500, origin, env)
    }
  },
} satisfies ExportedHandler<Env>
