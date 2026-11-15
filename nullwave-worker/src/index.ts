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
  // Remove everything inside () or [] and common words like "feat.", "ft.", "sped up", etc.
  return (title || '')
    .replace(/\[.*?\]|\(.*?\)/g, '')
    .replace(/\s*-\s*(feat|ft|official|audio|video|remaster(?:ed)?|sped\s+up|slowed|instrumental).*$/gi, '')
    .split('-')[0]
    .replace(/[^\w\s]/gi, '')
    .trim()
    .toLowerCase()
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

function cleanTrackTitle(title: string): string {
  return (title || '')
    .replace(/\s*[\(\[](feat|ft|official|audio|video|lyrics?|remaster(?:ed)?|from\s+"[^"]+").*?[\)\]]/gi, '')
    .replace(/\s*-\s*(feat|ft|official|audio|video|remaster(?:ed)?).*$/gi, '')
    .trim()
}

function cleanArtistName(artist: string): string {
  return (artist || '')
    .split(/[,&/]/)[0]
    .replace(/\s*(feat|ft)\.?.*$/gi, '')
    .trim()
}

async function fetchFromLrcLib(url: string): Promise<LrcLibResult[]> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'NullWave/1.0' } })
    if (!res.ok) return []
    return (await res.json()) as LrcLibResult[]
  } catch {
    return []
  }
}

async function handleLyrics(title: string, artist: string): Promise<unknown> {
  try {
    const cleanTitle = cleanTrackTitle(title)
    const cleanArtist = cleanArtistName(artist)

    // 1. Try exact search with cleaned track and artist names
    let results = await fetchFromLrcLib(
      `https://lrclib.net/api/search?track_name=${encodeURIComponent(cleanTitle)}&artist_name=${encodeURIComponent(cleanArtist)}`
    )

    // 2. If no synced lyrics found, try general query search (higher match rate)
    if (!results.some(r => r.syncedLyrics)) {
      const qResults = await fetchFromLrcLib(
        `https://lrclib.net/api/search?q=${encodeURIComponent(`${cleanTitle} ${cleanArtist}`)}`
      )
      if (qResults.length > 0) {
        results = [...results, ...qResults]
      }
    }

    // 3. Fallback: try raw title & artist
    if (!results.some(r => r.syncedLyrics)) {
      const rawResults = await fetchFromLrcLib(
        `https://lrclib.net/api/search?track_name=${encodeURIComponent(title)}&artist_name=${encodeURIComponent(artist)}`
      )
      if (rawResults.length > 0) {
        results = [...results, ...rawResults]
      }
    }

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

// ===== CONTENT FILTER & BLACKLIST =====

const BLOCKED_KEYWORDS = [
  'slowed', 'reverb', 'reverbed', 'speed', 'sped', 'lofi', 'remix', 'mashup', 'instrumental',
  'karaoke', 'live', 'solo', '8d', 'acapella', 'bass boosted',
  // Religious, devotional, and bhajan blacklist
  'bhajan', 'aarti', 'arti', 'chalisa', 'kripa', 'krishna', 'radhe', 'radha', 'shyam', 'ram',
  'shree ram', 'ramayana', 'sita', 'hanuman', 'shiv', 'shiva', 'mahadev', 'bholenath', 'kedarnath',
  'bhakti', 'devotional', 'katha', 'mantra', 'stotram', 'amritwani', 'dhun', 'jaap',
  'kirtan', 'qawwali', 'naat', 'nasheed', 'gospel', 'hymn', 'chandan', 'pooja', 'puja',
  'prarthana', 'bihari ji', 'anup jalota', 'navin tripathi', 'indresh upadhyay',
  'hansraj raghuwanshi', 'sadhu tiwari', 'mandir', 'pandit', 'swami', 'guru',
  'bhagwan', 'deva', 'ganesh', 'ganpati', 'durga', 'lakshmi', 'saraswati', 'sai baba',
  'har har', 'jai shree', 'jai jai', 'vaishno', 'parvati', 'barsane', 'vrindavan',
  'govind', 'gopal', 'murari', 'namo namo', 'zee music devotional',
  'anandmurti', 'anuradha paudwal', 'lakhbir singh', 'gulshan kumar', 't-series bhakti', 'bhaktisangeet'
]

function isCleanTrack(track: { title?: string; artist?: string; album?: string }): boolean {
  if (!track) return false
  const fullText = `${track.title || ''} ${track.artist || ''} ${track.album || ''}`.toLowerCase()
  return !BLOCKED_KEYWORDS.some(kw => fullText.includes(kw))
}

// ===== JIOSAAVN HANDLERS =====

async function handleTrending(): Promise<unknown> {
  const trendingQueries = [
    'Top Global Hits 2026',
    'Today Top Hits',
    'Billboard Hot 100',
    'Global Pop Hits',
    'International Hits'
  ]
  const q = trendingQueries[Math.floor(Math.random() * trendingQueries.length)]

  try {
    const data = await saavnFetch({
      __call: 'search.getResults',
      q,
      n: '30',
      p: '1',
    })

    const songs = (data.results || []) as any[]
    const tracks = songs
      .map((s: any) => mapTrack(s, 'Trending across NullWave'))
      .filter(t => t.id && isCleanTrack(t))

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
  let targetId = (albumId || '').trim()

  // If albumId is not numeric or contains composite delimiters, resolve numeric ID via album search
  const isNumeric = /^\d+$/.test(targetId)
  if (!isNumeric) {
    const cleanQuery = targetId.replace(/::/g, ' ').replace(/-/g, ' ').trim()
    const searchRes = await saavnFetch({
      __call: 'search.getAlbumResults',
      q: cleanQuery,
      n: '1',
      p: '1',
    }).catch(() => ({}))

    if (searchRes?.results?.[0]?.id) {
      targetId = searchRes.results[0].id
    }
  }

  const data = await saavnFetch({
    __call: 'content.getAlbumDetails',
    albumid: targetId,
  }).catch(() => ({}))

  // In JioSaavn, album songs are stored in `list` (or fallback `songs`)
  const songList = (data.list || data.songs || []) as any[]

  const album = {
    id: data.id || targetId,
    title: htmlDecode(data.title || data.name || albumId),
    artist: htmlDecode(data.primary_artists || data.music || data.artist || ''),
    coverUrl: getHiResImage(data.image || ''),
    year: data.year ? parseInt(data.year) : 0,
    totalTracks: songList.length,
  }

  const tracks = songList.map((s: any) => mapTrack(s))

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

function interleaveByArtist(tracks: any[], maxPerArtist = 2, primaryArtist?: string): any[] {
  const artistBuckets = new Map<string, any[]>()
  for (const t of tracks) {
    const art = (t.artist || '').split(/[,&/]/)[0].trim().toLowerCase() || 'various'
    if (!artistBuckets.has(art)) artistBuckets.set(art, [])
    const bucket = artistBuckets.get(art)!
    if (bucket.length < maxPerArtist) {
      bucket.push(t)
    }
  }

  // Put alternate artists first so the next song is always fresh
  const cleanPrimary = (primaryArtist || '').toLowerCase()
  const bucketList = Array.from(artistBuckets.entries())
  bucketList.sort(([artA], [artB]) => {
    if (cleanPrimary) {
      if (artA === cleanPrimary && artB !== cleanPrimary) return 1
      if (artB === cleanPrimary && artA !== cleanPrimary) return -1
    }
    return 0
  })

  const entries = bucketList.map(([, b]) => b)
  const result: any[] = []
  const maxLen = Math.max(...entries.map(b => b.length), 0)

  for (let i = 0; i < maxLen; i++) {
    for (const bucket of entries) {
      if (bucket[i]) {
        result.push(bucket[i])
      }
    }
  }

  return result
}

const CURATED_MIX_ARTISTS = [
  'The Weeknd',
  'Tame Impala',
  'Dua Lipa',
  'Post Malone',
  'Billie Eilish',
  'Coldplay',
  'Ariana Grande',
  'Travis Scott',
  'Arijit Singh',
  'Ed Sheeran',
  'Kendrick Lamar',
  'Imagine Dragons'
]

async function handleRadio(
  artistId: string,
  currentTitle: string,
  historyStr: string,
  favArtistsStr: string,
  favSongsStr: string,
  excludeIdsStr: string,
  likedTracksStr: string,
  smartSeedsStr: string = '[]',
  recentArtistsStr: string = '[]'
): Promise<unknown> {
  const rawArtist = (artistId || '').slice(0, 100).trim()
  if (!rawArtist) return { tracks: [] }

  // Extract primary artist for clean search queries
  const primaryArtist = rawArtist.split(/[,&/]/)[0].replace(/\s*(feat|ft)\.?.*$/gi, '').trim() || rawArtist
  const currentBaseTitle = getBaseTitle(currentTitle || '')

  let historyExclude: string[] = []
  let excludeIds: string[] = []
  try {
    const rawHistory = JSON.parse(historyStr)
    if (Array.isArray(rawHistory)) {
      historyExclude = rawHistory.slice(-30).map(t => getBaseTitle(String(t))).filter(Boolean)
    }
  } catch {
    // Ignore parse errors
  }

  if (currentBaseTitle && !historyExclude.includes(currentBaseTitle)) {
    historyExclude.push(currentBaseTitle)
  }

  try {
    const rawExclude = JSON.parse(excludeIdsStr)
    if (Array.isArray(rawExclude)) {
      excludeIds = rawExclude.slice(-50).map(String)
    }
  } catch {
    // Ignore parse errors
  }

  const favArtists = favArtistsStr ? favArtistsStr.slice(0, 500).split(',').map(s => s.trim()).filter(Boolean) : []
  const favSongs = favSongsStr ? favSongsStr.slice(0, 500).split(',').map(s => s.trim()).filter(Boolean) : []
  let recentArtists: string[] = []
  try {
    const rawRecent = JSON.parse(recentArtistsStr)
    if (Array.isArray(rawRecent)) {
      recentArtists = rawRecent.map(a => String(a).split(/[,&/]/)[0].trim()).filter(Boolean)
    }
  } catch {}

  // High quality search seeds (curated for true mixed artist variety)
  const searches: { promise: Promise<any>, reason: string }[] = []

  // 1. Primary artist tracks (strictly capped to 4 so one artist never dominates)
  searches.push({
    promise: saavnFetch({ __call: 'search.getResults', q: primaryArtist, n: '4', p: '1' }).then(res => res.results || []).catch(() => []),
    reason: `Top tracks from ${primaryArtist}`
  })

  // 2. Curate 3-4 distinct alternate artists (user favorites + user recent + curated icons)
  const otherFavArtists = favArtists.filter(a => a.toLowerCase() !== primaryArtist.toLowerCase())
  const otherRecent = recentArtists.filter(a => a.toLowerCase() !== primaryArtist.toLowerCase())
  const mixedPool = [...new Set([...otherFavArtists, ...otherRecent])]

  for (const icon of CURATED_MIX_ARTISTS) {
    if (mixedPool.length >= 4) break
    if (icon.toLowerCase() !== primaryArtist.toLowerCase() && !mixedPool.some(m => m.toLowerCase() === icon.toLowerCase())) {
      mixedPool.push(icon)
    }
  }

  for (const altArtist of mixedPool.slice(0, 3)) {
    searches.push({
      promise: saavnFetch({ __call: 'search.getResults', q: altArtist, n: '4', p: '1' }).then(res => res.results || []).catch(() => []),
      reason: `Because you like ${altArtist}`
    })
  }

  // 3. Favorite song if available
  if (favSongs.length > 0) {
    const randomSong = favSongs[Math.floor(Math.random() * favSongs.length)]
    searches.push({
      promise: saavnFetch({ __call: 'search.getResults', q: randomSong, n: '4', p: '1' }).then(res => res.results || []).catch(() => []),
      reason: `Because you love ${randomSong}`
    })
  }

  // 4. Smart seeds from listening habits
  let smartSeeds: string[] = []
  try {
    const rawSmart = JSON.parse(smartSeedsStr)
    if (Array.isArray(rawSmart)) smartSeeds = rawSmart.slice(0, 2)
  } catch { }

  if (smartSeeds.length > 0) {
    for (const seedStr of smartSeeds) {
      searches.push({
        promise: saavnFetch({ __call: 'search.getResults', q: seedStr, n: '4', p: '1' }).then(res => res.results || []).catch(() => []),
        reason: `Based on your listening habits`
      })
    }
  }

  // 5. Global Top Hits for fresh diverse discovery
  searches.push({
    promise: saavnFetch({ __call: 'search.getResults', q: 'Global Hits', n: '4', p: '1' }).then(res => res.results || []).catch(() => []),
    reason: `Trending discovery`
  })

  const resultsWithReason = await Promise.all(
    searches.map(async (s) => {
      const results = await s.promise
      return { results: Array.isArray(results) ? results : [], reason: s.reason }
    })
  )

  // Filter and deduplicate (Strictly prevent duplicate song titles!)
  const seenTitles = new Set<string>()
  const validTracks = []
  const allEligibleTracks = []

  for (const group of resultsWithReason) {
    for (const s of group.results) {
      if (!s.id) continue
      const track = mapTrack(s, group.reason)
      if (!isCleanTrack(track)) continue
      if (excludeIds.includes(track.id)) continue

      const baseTitle = getBaseTitle(track.title)
      if (!baseTitle) continue

      // Never suggest the song that is currently playing or duplicate song titles
      if (currentBaseTitle && (baseTitle === currentBaseTitle || baseTitle.includes(currentBaseTitle) || currentBaseTitle.includes(baseTitle))) {
        continue
      }

      if (seenTitles.has(baseTitle)) continue
      seenTitles.add(baseTitle)

      allEligibleTracks.push(track)

      const isInHistory = historyExclude.some(hx => {
        if (!baseTitle || !hx) return false
        return baseTitle === hx || (baseTitle.length > 4 && (baseTitle.includes(hx) || hx.includes(baseTitle)))
      })
      if (!isInHistory) {
        validTracks.push(track)
      }
    }
  }

  // If strict history exclusion depleted the pool, recycle eligible tracks that are not the currently playing song
  const candidatePool = validTracks.length >= 6 ? validTracks : allEligibleTracks

  // Interleave artists (max 2 songs per artist, alternate artists first) so queue is always a balanced, mixed-artist playlist
  const mixedQueue = interleaveByArtist(candidatePool, 2, primaryArtist)

  return { tracks: mixedQueue.slice(0, 15) }
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

    const seenTracks = new Set<string>()
    const tracks = []

    for (const group of resultsWithReason) {
      for (const s of group.results) {
        if (!s.id) continue
        const track = mapTrack(s, group.reason)
        if (!isCleanTrack(track)) continue

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

        const currentTitle = url.searchParams.get('currentTitle')?.trim() || ''
        const historyStr = url.searchParams.get('history')?.trim() || '[]'
        const favArtistsStr = url.searchParams.get('favArtists')?.trim() || ''
        const favSongsStr = url.searchParams.get('favSongs')?.trim() || ''
        const excludeIdsStr = url.searchParams.get('excludeIds')?.trim() || '[]'
        const likedTracksStr = url.searchParams.get('likedTracks')?.trim() || '[]'
        const smartSeedsStr = url.searchParams.get('smartSeeds')?.trim() || '[]'
        const recentArtistsStr = url.searchParams.get('recentArtists')?.trim() || '[]'

        if (historyStr.length > 10000 || likedTracksStr.length > 10000) {
          return json({ error: 'History payload too large' }, 400, origin, env)
        }

        return json(await handleRadio(artist, currentTitle, historyStr, favArtistsStr, favSongsStr, excludeIdsStr, likedTracksStr, smartSeedsStr, recentArtistsStr), 200, origin, env)
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
