var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.ts
function corsHeaders(origin, env) {
  const allowed = env.ALLOWED_ORIGINS.split(",").map((s) => s.trim());
  const isAllowed = allowed.includes("*") || allowed.includes(origin);
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : allowed[0],
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
}
__name(corsHeaders, "corsHeaders");
function json(data, status, origin, env) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(origin, env)
    }
  });
}
__name(json, "json");
var SAAVN_BASE = "https://www.jiosaavn.com/api.php";
var SAAVN_PARAMS = { _format: "json", _marker: "0", ctx: "web6dot0" };
async function saavnFetch(params) {
  const url = new URL(SAAVN_BASE);
  for (const [k, v] of Object.entries({ ...SAAVN_PARAMS, ...params })) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "X-Forwarded-For": "122.160.10.1",
      "X-Real-IP": "122.160.10.1",
      "client-ip": "122.160.10.1",
      "X-Country-Code": "IN"
    }
  });
  if (!res.ok) throw new Error(`JioSaavn API error: ${res.status}`);
  return res.json();
}
__name(saavnFetch, "saavnFetch");
function getHiResImage(url) {
  return url.replace(/150x150/g, "500x500").replace(/50x50/g, "500x500");
}
__name(getHiResImage, "getHiResImage");
function htmlDecode(str) {
  return str.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}
__name(htmlDecode, "htmlDecode");
function getBaseTitle(title) {
  return title.replace(/\[.*?\]|\(.*?\)/g, "").split("-")[0].trim().toLowerCase();
}
__name(getBaseTitle, "getBaseTitle");
function mapTrack(s, suggestionReason) {
  return {
    id: s.id || "",
    title: htmlDecode(s.song || s.title || ""),
    artist: htmlDecode(s.primary_artists || s.singers || s.music || ""),
    album: htmlDecode(s.album || "Single"),
    albumId: s.albumid || s.id || "",
    duration: parseInt(s.duration) || 0,
    coverUrl: getHiResImage(s.image || ""),
    audioUrl: "",
    // Stream server handles playback
    year: s.year ? parseInt(s.year) : s.release_date ? parseInt(s.release_date.substring(0, 4)) : 0,
    genre: htmlDecode(s.language || ""),
    spotifyUrl: s.perma_url || "",
    suggestionReason
  };
}
__name(mapTrack, "mapTrack");
async function fetchNativeRecommendations(songId) {
  try {
    const res = await saavnFetch({ __call: "reco.getreco", pid: songId });
    return Array.isArray(res) ? res : [];
  } catch {
    return [];
  }
}
__name(fetchNativeRecommendations, "fetchNativeRecommendations");
async function handleLyrics(title, artist) {
  try {
    const res = await fetch(
      `https://lrclib.net/api/search?track_name=${encodeURIComponent(title)}&artist_name=${encodeURIComponent(artist)}`,
      { headers: { "User-Agent": "NullWave/1.0" } }
    );
    if (!res.ok) {
      return { synced: null, plain: null };
    }
    const results = await res.json();
    if (results.length === 0) {
      return { synced: null, plain: null };
    }
    const withSynced = results.find((r) => r.syncedLyrics);
    const best = withSynced || results[0];
    return {
      synced: best.syncedLyrics || null,
      plain: best.plainLyrics || null,
      trackName: best.trackName,
      artistName: best.artistName,
      albumName: best.albumName
    };
  } catch {
    return { synced: null, plain: null };
  }
}
__name(handleLyrics, "handleLyrics");
async function handleTrending() {
  const playlistIds = ["110858205", "93518779", "93520680"];
  const picked = playlistIds[Math.floor(Math.random() * playlistIds.length)];
  try {
    const data = await saavnFetch({
      __call: "playlist.getDetails",
      listid: picked
    });
    const songs = data.songs || [];
    const tracks = songs.slice(0, 25).map((s) => mapTrack(s));
    for (let i = tracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tracks[i], tracks[j]] = [tracks[j], tracks[i]];
    }
    return { tracks: tracks.slice(0, 20) };
  } catch {
    return { tracks: [] };
  }
}
__name(handleTrending, "handleTrending");
async function handleSearch(query) {
  const [songsData, artistsData, albumsData] = await Promise.all([
    saavnFetch({
      __call: "search.getResults",
      q: query,
      n: "25",
      p: "1"
    }).catch(() => ({ results: [] })),
    saavnFetch({
      __call: "search.getArtistResults",
      q: query,
      n: "10",
      p: "1"
    }).catch(() => ({ results: [] })),
    saavnFetch({
      __call: "search.getAlbumResults",
      q: query,
      n: "10",
      p: "1"
    }).catch(() => ({ results: [] }))
  ]);
  const songResults = songsData.results || [];
  const seenTracks = /* @__PURE__ */ new Set();
  const tracks = [];
  for (const s of songResults) {
    const track = mapTrack(s);
    const key = `${track.title.toLowerCase()}::${track.artist.toLowerCase()}`;
    if (!seenTracks.has(key)) {
      seenTracks.add(key);
      tracks.push(track);
    }
  }
  const artistResults = artistsData.results || [];
  const artists = artistResults.map((s) => ({
    id: s.artistId || s.id || "",
    name: htmlDecode(s.name || s.title || ""),
    imageUrl: getHiResImage(s.image || ""),
    genres: s.language ? [htmlDecode(s.language)] : []
  }));
  const albumResults = albumsData.results || [];
  const albums = albumResults.map((s) => ({
    id: s.id || "",
    title: htmlDecode(s.title || ""),
    artist: htmlDecode(s.music || s.primary_artists || ""),
    coverUrl: getHiResImage(s.image || ""),
    year: s.year ? parseInt(s.year) : 0,
    totalTracks: s.more_info?.song_pids ? s.more_info.song_pids.split(",").length : 1
  }));
  return {
    tracks,
    artists,
    albums
  };
}
__name(handleSearch, "handleSearch");
async function handleTrack(trackId) {
  const data = await saavnFetch({
    __call: "song.getDetails",
    pids: trackId
  });
  const songs = data.songs || [];
  if (songs.length === 0) throw new Error("Track not found");
  return { track: mapTrack(songs[0]) };
}
__name(handleTrack, "handleTrack");
async function handleAlbum(albumId) {
  const data = await saavnFetch({
    __call: "content.getAlbumDetails",
    albumid: albumId
  });
  const album = {
    id: data.id || albumId,
    title: htmlDecode(data.title || ""),
    artist: htmlDecode(data.primary_artists || ""),
    coverUrl: getHiResImage(data.image || ""),
    year: data.year ? parseInt(data.year) : 0,
    totalTracks: data.songs ? data.songs.length : 0
  };
  const tracks = (data.songs || []).map((s) => mapTrack(s));
  return { album, tracks };
}
__name(handleAlbum, "handleAlbum");
async function handleArtist(artistId) {
  const searchData = await saavnFetch({
    __call: "search.getArtistResults",
    q: artistId,
    n: "1",
    p: "1"
  });
  const songsData = await saavnFetch({
    __call: "search.getResults",
    q: artistId,
    n: "20",
    p: "1"
  });
  const artistResults = searchData.results || [];
  const songResults = songsData.results || [];
  const artist = artistResults.length > 0 ? {
    id: artistResults[0].artistId || artistResults[0].id || artistId,
    name: htmlDecode(artistResults[0].name || artistId),
    imageUrl: getHiResImage(artistResults[0].image || ""),
    bio: htmlDecode(artistResults[0].description || ""),
    genres: []
  } : {
    id: artistId,
    name: artistId,
    imageUrl: "",
    bio: "",
    genres: []
  };
  const seenTracks = /* @__PURE__ */ new Set();
  const tracks = [];
  for (const s of songResults) {
    const track = mapTrack(s);
    if (track.artist.toLowerCase().includes(artistId.toLowerCase())) {
      const key = `${track.title.toLowerCase()}::${track.artist.toLowerCase()}`;
      if (!seenTracks.has(key)) {
        seenTracks.add(key);
        tracks.push(track);
      }
    }
  }
  return { artist, tracks };
}
__name(handleArtist, "handleArtist");
async function handleRadio(artistId, historyStr, favArtistsStr, favSongsStr, excludeIdsStr, likedTracksStr) {
  let historyExclude = [];
  let excludeIds = [];
  try {
    const rawHistory = JSON.parse(historyStr);
    if (Array.isArray(rawHistory)) historyExclude = rawHistory.map((t) => getBaseTitle(String(t)));
    const rawExclude = JSON.parse(excludeIdsStr);
    if (Array.isArray(rawExclude)) excludeIds = rawExclude.map(String);
  } catch {
  }
  const favArtists = favArtistsStr ? favArtistsStr.split(",").map((s) => s.trim()).filter(Boolean) : [];
  const favSongs = favSongsStr ? favSongsStr.split(",").map((s) => s.trim()).filter(Boolean) : [];
  let seedSongId = "";
  try {
    const topSongRes = await saavnFetch({ __call: "search.getResults", q: artistId, n: "5", p: "1" });
    if (topSongRes && topSongRes.results && topSongRes.results.length > 0) {
      seedSongId = topSongRes.results[0].id;
    }
  } catch {
  }
  const searches = [];
  if (seedSongId) {
    searches.push({ promise: saavnFetch({ __call: "reco.getreco", pid: seedSongId }).catch(() => []), reason: `Recommended based on ${artistId}` });
  }
  searches.push({ promise: saavnFetch({ __call: "search.getResults", q: `${artistId} hits`, n: "15", p: "1" }).then((res) => res.results || []).catch(() => []), reason: `Popular hits from ${artistId}` });
  if (favArtists.length > 0) {
    const randomFavArtist = favArtists[Math.floor(Math.random() * favArtists.length)];
    searches.push({
      promise: saavnFetch({ __call: "search.getResults", q: randomFavArtist, n: "15", p: "1" }).then((res) => res.results || []).catch(() => []),
      reason: `Because you like ${randomFavArtist}`
    });
  }
  if (favSongs.length > 0) {
    const randomFavSong = favSongs[Math.floor(Math.random() * favSongs.length)];
    searches.push({
      promise: saavnFetch({ __call: "search.getResults", q: randomFavSong, n: "15", p: "1" }).then((res) => res.results || []).catch(() => []),
      reason: `Because you like ${randomFavSong}`
    });
  }
  const resultsWithReason = await Promise.all(
    searches.map(async (s) => {
      const results = await s.promise;
      return { results: Array.isArray(results) ? results : [], reason: s.reason };
    })
  );
  const badKeywords = ["slowed", "reverb", "reverbed", "speed", "sped", "lofi", "remix", "mashup", "instrumental", "karaoke", "live", "solo", "8d", "acapella", "bass boosted"];
  const seen = /* @__PURE__ */ new Set();
  const validTracks = [];
  for (const group of resultsWithReason) {
    for (const s of group.results) {
      if (!s.id) continue;
      const track = mapTrack(s, group.reason);
      const titleLower = track.title.toLowerCase();
      const isGarbage = badKeywords.some((b) => titleLower.includes(b));
      if (isGarbage) continue;
      if (excludeIds.includes(track.id)) continue;
      const baseTitle = getBaseTitle(track.title);
      const isInHistory = historyExclude.some((hx) => {
        if (!baseTitle || !hx) return false;
        return baseTitle === hx || baseTitle.includes(hx) || hx.includes(baseTitle);
      });
      if (isInHistory) continue;
      const key = `${baseTitle}::${track.artist.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        validTracks.push(track);
      }
    }
  }
  for (let i = validTracks.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [validTracks[i], validTracks[j]] = [validTracks[j], validTracks[i]];
  }
  if (validTracks.length === 0) {
    return { tracks: [] };
  }
  return { tracks: validTracks.slice(0, 10) };
}
__name(handleRadio, "handleRadio");
async function handleHomeFeed(recentArtistsStr, favArtistsStr, favSongsStr, likedTracksStr) {
  try {
    let recentArtists = [];
    try {
      recentArtists = JSON.parse(recentArtistsStr);
    } catch {
    }
    const favArtists = favArtistsStr ? favArtistsStr.split(",").map((s) => s.trim()).filter(Boolean) : [];
    const favSongs = favSongsStr ? favSongsStr.split(",").map((s) => s.trim()).filter(Boolean) : [];
    let likedTracks = [];
    try {
      likedTracks = JSON.parse(likedTracksStr);
    } catch {
    }
    const searches = [];
    if (likedTracks.length > 0) {
      const randomLikedTrack = likedTracks[Math.floor(Math.random() * likedTracks.length)];
      searches.push({
        promise: saavnFetch({ __call: "search.getResults", q: randomLikedTrack, n: "5", p: "1" }).then(async (res) => {
          if (res?.results?.[0]?.id) {
            return await fetchNativeRecommendations(res.results[0].id);
          }
          return res.results || [];
        }).catch(() => []),
        reason: `Because you liked ${randomLikedTrack}`
      });
    }
    if (recentArtists.length > 0) {
      const randomRecent = recentArtists[Math.floor(Math.random() * recentArtists.length)];
      searches.push({
        promise: saavnFetch({ __call: "search.getResults", q: randomRecent, n: "5", p: "1" }).then(async (res) => {
          if (res?.results?.[0]?.id) {
            return await fetchNativeRecommendations(res.results[0].id);
          }
          return res.results || [];
        }).catch(() => []),
        reason: `Based on your recent listening: ${randomRecent}`
      });
    }
    if (favArtists.length > 0) {
      const a = favArtists[Math.floor(Math.random() * favArtists.length)];
      searches.push({
        promise: saavnFetch({ __call: "search.getResults", q: a, n: "5", p: "1" }).then(async (res) => {
          if (res?.results?.[0]?.id) {
            return await fetchNativeRecommendations(res.results[0].id);
          }
          return res.results || [];
        }).catch(() => []),
        reason: `Because you like ${a}`
      });
    }
    if (favSongs.length > 0) {
      const s = favSongs[Math.floor(Math.random() * favSongs.length)];
      searches.push({
        promise: saavnFetch({ __call: "search.getResults", q: s, n: "5", p: "1" }).then(async (res) => {
          if (res?.results?.[0]?.id) {
            return await fetchNativeRecommendations(res.results[0].id);
          }
          return res.results || [];
        }).catch(() => []),
        reason: `Because you love ${s}`
      });
    }
    const resultsWithReason = await Promise.all(
      searches.map(async (s) => {
        const results = await s.promise;
        return { results: Array.isArray(results) ? results : [], reason: s.reason };
      })
    );
    const badKeywords = ["slowed", "reverb", "reverbed", "speed", "sped", "lofi", "remix", "mashup", "instrumental", "karaoke", "live", "solo", "8d", "acapella", "bass boosted"];
    const seenTracks = /* @__PURE__ */ new Set();
    const tracks = [];
    for (const group of resultsWithReason) {
      for (const s of group.results) {
        if (!s.id) continue;
        const track = mapTrack(s, group.reason);
        const titleLower = track.title.toLowerCase();
        if (badKeywords.some((b) => titleLower.includes(b))) continue;
        const baseTitle = getBaseTitle(track.title);
        const dedupKey = `${baseTitle}::${track.artist.toLowerCase()}`;
        if (!seenTracks.has(dedupKey)) {
          seenTracks.add(dedupKey);
          tracks.push(track);
        }
      }
    }
    for (let i = tracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tracks[i], tracks[j]] = [tracks[j], tracks[i]];
    }
    if (tracks.length === 0) {
      return await handleTrending();
    }
    return { tracks: tracks.slice(0, 20) };
  } catch {
    return await handleTrending();
  }
}
__name(handleHomeFeed, "handleHomeFeed");
var index_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin, env) });
    }
    if (request.method !== "GET" && request.method !== "POST" && request.method !== "DELETE") {
      return json({ error: "Method not allowed" }, 405, origin, env);
    }
    try {
      const path = url.pathname;
      if (path === "/songs/trending") {
        return json(await handleTrending(), 200, origin, env);
      }
      if (path === "/search") {
        const query = url.searchParams.get("q")?.trim();
        if (!query) return json({ error: 'Missing "q"' }, 400, origin, env);
        return json(await handleSearch(query), 200, origin, env);
      }
      if (path === "/lyrics") {
        const title = url.searchParams.get("title")?.trim();
        const artist = url.searchParams.get("artist")?.trim();
        if (!title) return json({ error: 'Missing "title"' }, 400, origin, env);
        return json(await handleLyrics(title, artist || ""), 200, origin, env);
      }
      if (path === "/artist") {
        const name = url.searchParams.get("name")?.trim();
        if (!name) return json({ error: 'Missing "name"' }, 400, origin, env);
        return json(await handleArtist(name), 200, origin, env);
      }
      if (path === "/album") {
        const id = url.searchParams.get("id")?.trim();
        if (!id) return json({ error: 'Missing "id"' }, 400, origin, env);
        return json(await handleAlbum(id), 200, origin, env);
      }
      if (path === "/radio") {
        const artist = url.searchParams.get("artist")?.trim();
        const historyStr = url.searchParams.get("history")?.trim() || "[]";
        const favArtistsStr = url.searchParams.get("favArtists")?.trim() || "";
        const favSongsStr = url.searchParams.get("favSongs")?.trim() || "";
        const excludeIdsStr = url.searchParams.get("excludeIds")?.trim() || "[]";
        const likedTracksStr = url.searchParams.get("likedTracks")?.trim() || "[]";
        if (!artist) return json({ error: 'Missing "artist"' }, 400, origin, env);
        return json(await handleRadio(artist, historyStr, favArtistsStr, favSongsStr, excludeIdsStr, likedTracksStr), 200, origin, env);
      }
      if (path === "/home-feed") {
        const historyStr = url.searchParams.get("history")?.trim() || "[]";
        const favArtistsStr = url.searchParams.get("favArtists")?.trim() || "";
        const favSongsStr = url.searchParams.get("favSongs")?.trim() || "";
        const likedTracksStr = url.searchParams.get("likedTracks")?.trim() || "[]";
        return json(await handleHomeFeed(historyStr, favArtistsStr, favSongsStr, likedTracksStr), 200, origin, env);
      }
      const trackMatch = path.match(/^\/track\/(.+)$/);
      if (trackMatch) {
        return json(await handleTrack(trackMatch[1]), 200, origin, env);
      }
      if (path === "/sign-upload" && request.method === "POST") {
        if (!env.CLOUDINARY_API_SECRET) {
          return json({ error: "Missing CLOUDINARY_API_SECRET in worker" }, 500, origin, env);
        }
        try {
          const body = await request.json();
          const timestamp = Math.round((/* @__PURE__ */ new Date()).getTime() / 1e3).toString();
          const paramsToSign = {
            timestamp,
            ...body
            // Any other params passed from frontend (e.g. folder, public_id)
          };
          const sortedKeys = Object.keys(paramsToSign).sort();
          const signString = sortedKeys.map((k) => `${k}=${paramsToSign[k]}`).join("&");
          const encoder = new TextEncoder();
          const data = encoder.encode(signString + env.CLOUDINARY_API_SECRET);
          const hashBuffer = await crypto.subtle.digest("SHA-1", data);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const signature = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
          return json({ signature, timestamp }, 200, origin, env);
        } catch (e) {
          return json({ error: "Invalid JSON payload" }, 400, origin, env);
        }
      }
      if (path === "/admin/update-user" && request.method === "POST") {
        if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
          return json({ error: "Missing Supabase admin keys" }, 500, origin, env);
        }
        const authHeader = request.headers.get("Authorization");
        if (!authHeader) {
          return json({ error: "Missing Authorization header" }, 401, origin, env);
        }
        try {
          const body = await request.json();
          const { targetUserId, password, email, username } = body;
          if (!targetUserId) {
            return json({ error: "Missing targetUserId" }, 400, origin, env);
          }
          const verifyRes = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
            headers: {
              "Authorization": authHeader,
              "apikey": env.SUPABASE_SERVICE_ROLE_KEY
            }
          });
          if (!verifyRes.ok) return json({ error: "Unauthorized JWT" }, 401, origin, env);
          const callerObj = await verifyRes.json();
          const roleCheckRes = await fetch(`${env.SUPABASE_URL}/rest/v1/users?id=eq.${callerObj.id}&select=role`, {
            headers: {
              "Authorization": `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
              "apikey": env.SUPABASE_SERVICE_ROLE_KEY
            }
          });
          const roleData = await roleCheckRes.json();
          if (!roleData || !roleData[0] || roleData[0].role !== "admin") {
            return json({ error: "Forbidden: Admins only" }, 403, origin, env);
          }
          const updateData = {};
          if (password) updateData.password = password;
          if (email) updateData.email = email;
          if (username) updateData.user_metadata = { full_name: username };
          if (Object.keys(updateData).length === 0) return json({ success: true }, 200, origin, env);
          const updateRes = await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users/${targetUserId}`, {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
              "apikey": env.SUPABASE_SERVICE_ROLE_KEY,
              "Content-Type": "application/json"
            },
            body: JSON.stringify(updateData)
          });
          if (!updateRes.ok) {
            const errBody = await updateRes.text();
            return json({ error: `Failed to update auth user: ${errBody}` }, 500, origin, env);
          }
          return json({ success: true }, 200, origin, env);
        } catch (e) {
          return json({ error: e.message }, 500, origin, env);
        }
      }
      if (path === "/admin/delete-user" && request.method === "DELETE") {
        if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
          return json({ error: "Missing Supabase admin keys" }, 500, origin, env);
        }
        const authHeader = request.headers.get("Authorization");
        if (!authHeader) return json({ error: "Missing Authorization header" }, 401, origin, env);
        try {
          const body = await request.json();
          const { targetUserId } = body;
          if (!targetUserId) return json({ error: "Missing targetUserId" }, 400, origin, env);
          const verifyRes = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
            headers: { "Authorization": authHeader, "apikey": env.SUPABASE_SERVICE_ROLE_KEY }
          });
          if (!verifyRes.ok) return json({ error: "Unauthorized JWT" }, 401, origin, env);
          const callerObj = await verifyRes.json();
          const roleCheckRes = await fetch(`${env.SUPABASE_URL}/rest/v1/users?id=eq.${callerObj.id}&select=role`, {
            headers: { "Authorization": `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, "apikey": env.SUPABASE_SERVICE_ROLE_KEY }
          });
          const roleData = await roleCheckRes.json();
          if (!roleData || !roleData[0] || roleData[0].role !== "admin") {
            return json({ error: "Forbidden: Admins only" }, 403, origin, env);
          }
          const deleteRes = await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users/${targetUserId}`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
              "apikey": env.SUPABASE_SERVICE_ROLE_KEY
            }
          });
          if (!deleteRes.ok) {
            const errBody = await deleteRes.text();
            return json({ error: `Failed to delete auth user: ${errBody}` }, 500, origin, env);
          }
          return json({ success: true }, 200, origin, env);
        } catch (e) {
          return json({ error: e.message }, 500, origin, env);
        }
      }
      if (request.method !== "GET" && request.method !== "DELETE" && path !== "/sign-upload" && path !== "/admin/update-user" && path !== "/admin/delete-user") {
        return json({ error: "Method not allowed" }, 405, origin, env);
      }
      return json({ error: "Not found" }, 404, origin, env);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Internal server error";
      return json({ error: message }, 500, origin, env);
    }
  }
};
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
