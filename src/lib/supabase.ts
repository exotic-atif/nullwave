import { createClient } from '@supabase/supabase-js'
import type { Track } from '@/types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ===== PROFILES =====

export async function upsertProfile(userId: string, username: string, email: string, theme: string = 'system') {
  const { error } = await supabase
    .from('users')
    .upsert({ id: userId, username, email, theme }, { onConflict: 'id' })
  if (error) console.error('Failed to upsert profile:', error.message)
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('username, avatar_url, theme, role, fav_songs, fav_artists')
    .eq('id', userId)
    .maybeSingle()
  if (error) console.error('Failed to fetch profile:', error.message)
  return data
}

export async function updateProfileName(userId: string, newName: string) {
  const { error } = await supabase
    .from('users')
    .update({ username: newName })
    .eq('id', userId)
  if (error) console.error('Failed to update profile name:', error.message)
}

export async function updateProfileAvatar(userId: string, avatarUrl: string) {
  const { error } = await supabase
    .from('users')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId)
  if (error) console.error('Failed to update profile avatar:', error.message)
}

export async function updateThemePreference(userId: string, theme: string) {
  const { error } = await supabase
    .from('users')
    .update({ theme })
    .eq('id', userId)
  if (error) console.error('Failed to update theme preference:', error.message)
}

export async function updateProfileFavs(userId: string, favSongs: string, favArtists: string) {
  const { error } = await supabase
    .from('users')
    .update({ fav_songs: favSongs, fav_artists: favArtists })
    .eq('id', userId)
  if (error) console.error('Failed to update favorites:', error.message)
}

// ===== LIKED SONGS =====

export async function fetchLikedSongs(userId: string): Promise<{ trackId: string; track: Track }[]> {
  const { data, error } = await supabase
    .from('liked_tracks')
    .select('track_id, track_data')
    .eq('user_id', userId)

  if (error) {
    console.error('Failed to fetch likes:', error.message)
    return []
  }

  return (data || []).map((row) => ({
    trackId: row.track_id as string,
    track: row.track_data as Track,
  }))
}

export async function addLikedSong(userId: string, track: Track) {
  // First check if it already exists
  const { data: existing } = await supabase
    .from('liked_tracks')
    .select('id')
    .eq('user_id', userId)
    .eq('track_id', track.id)
    .maybeSingle()

  if (existing) return

  // If not, insert it
  const { error } = await supabase.from('liked_tracks').insert({
    user_id: userId,
    track_id: track.id,
    track_data: track,
  })

  if (error) console.error('Failed to like song:', error.message)
}

export async function removeLikedSong(userId: string, trackId: string) {
  const { error } = await supabase
    .from('liked_tracks')
    .delete()
    .eq('user_id', userId)
    .eq('track_id', trackId)
  if (error) console.error('Failed to unlike song:', error.message)
}

// ===== PLAY HISTORY =====

export async function recordPlayHistory(userId: string, track: Track) {
  // Deduplication: Remove any previous history entry for this track
  await supabase
    .from('play_history')
    .delete()
    .eq('user_id', userId)
    .eq('track_id', track.id)

  // Insert the new play record
  const { error } = await supabase.from('play_history').insert({
    user_id: userId,
    track_id: track.id,
    track_data: track,
  })
  if (error) console.error('Failed to record history:', error.message)

  // Cleanup: Delete history older than the 100th most recent track
  const { data: keepData } = await supabase
    .from('play_history')
    .select('played_at')
    .eq('user_id', userId)
    .order('played_at', { ascending: false })
    .range(99, 99) // Get exactly the 100th track (0-indexed)

  if (keepData && keepData.length > 0 && keepData[0].played_at) {
    await supabase
      .from('play_history')
      .delete()
      .eq('user_id', userId)
      .lt('played_at', keepData[0].played_at)
  }
}

export async function fetchPlayHistory(userId: string, limit = 100): Promise<Track[]> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('play_history')
    .select('track_id, track_data')
    .eq('user_id', userId)
    .gte('played_at', sevenDaysAgo)
    .order('played_at', { ascending: false })
    // fetch more to allow deduplication
    .limit(limit * 3)

  if (error) {
    console.error('Failed to fetch history:', error.message)
    return []
  }

  // Deduplicate by track_id
  const seen = new Set<string>()
  const uniqueTracks: Track[] = []

  for (const row of (data || [])) {
    if (!seen.has(row.track_id)) {
      seen.add(row.track_id)
      uniqueTracks.push(row.track_data as Track)
    }
    if (uniqueTracks.length >= limit) break
  }

  return uniqueTracks
}

export async function clearPlayHistory(userId: string) {
  const { error } = await supabase
    .from('play_history')
    .delete()
    .eq('user_id', userId)
  if (error) console.error('Failed to clear history:', error.message)
}

// ===== PLAYLISTS =====

export async function createPlaylist(userId: string, name: string) {
  const { data, error } = await supabase
    .from('playlists')
    .insert({ user_id: userId, name })
    .select()
    .single()

  if (error) {
    console.error('Failed to create playlist:', error.message)
    return null
  }
  return data
}

export async function getUserPlaylists(userId: string) {
  const { data, error } = await supabase
    .from('playlists')
    .select(`
      *,
      playlist_tracks (
        track_data
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch playlists:', error.message)
    return []
  }
  return data
}

export async function addTrackToPlaylist(playlistId: string, track: Track) {
  const { error } = await supabase.from('playlist_tracks').insert({
    playlist_id: playlistId,
    track_id: track.id,
    track_data: track,
  })

  if (error) console.error('Failed to add track to playlist:', error.message)
}

export async function getPlaylistTracks(playlistId: string): Promise<Track[]> {
  const { data, error } = await supabase
    .from('playlist_tracks')
    .select('track_data')
    .eq('playlist_id', playlistId)
    .order('added_at', { ascending: true })

  if (error) {
    console.error('Failed to fetch playlist tracks:', error.message)
    return []
  }

  return (data || []).map((row) => row.track_data as Track)
}

export async function getPlaylistDetails(playlistId: string) {
  const { data, error } = await supabase
    .from('playlists')
    .select('*')
    .eq('id', playlistId)
    .single()

  if (error) {
    console.error('Failed to fetch playlist details:', error.message)
    return null
  }
  return data
}

export async function removeTrackFromPlaylist(playlistId: string, trackId: string) {
  const { error } = await supabase
    .from('playlist_tracks')
    .delete()
    .eq('playlist_id', playlistId)
    .eq('track_id', trackId)
  if (error) console.error('Failed to remove track:', error.message)
}

export async function renamePlaylist(playlistId: string, newName: string) {
  const { error } = await supabase
    .from('playlists')
    .update({ name: newName })
    .eq('id', playlistId)
  if (error) console.error('Failed to rename playlist:', error.message)
}

export async function deletePlaylist(playlistId: string) {
  const { error } = await supabase
    .from('playlists')
    .delete()
    .eq('id', playlistId)
  if (error) console.error('Failed to delete playlist:', error.message)
}

// ===== ACCESS REQUESTS =====

export interface AccessRequest {
  id: string
  display_name: string
  email: string
  avatar_url: string | null
  fav_artists: string | null
  fav_songs: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export async function submitAccessRequest(data: {
  display_name: string
  email: string
  avatar_url?: string
  fav_artists?: string
  fav_songs?: string
}) {
  const { error } = await supabase.from('access_requests').insert(data)
  if (error) throw new Error(error.message)
}

export async function fetchAccessRequests(): Promise<AccessRequest[]> {
  const { data, error } = await supabase
    .from('access_requests')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch access requests:', error.message)
    return []
  }
  return (data || []) as AccessRequest[]
}

export async function updateAccessRequest(id: string, updates: Partial<AccessRequest>) {
  const { error } = await supabase
    .from('access_requests')
    .update(updates)
    .eq('id', id)
  if (error) console.error('Failed to update access request:', error.message)
}

export async function deleteAccessRequest(id: string) {
  const { error } = await supabase
    .from('access_requests')
    .delete()
    .eq('id', id)
  if (error) console.error('Failed to delete access request:', error.message)
}
