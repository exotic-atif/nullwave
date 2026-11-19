import type { Track } from '@/types'
import type { User, Session, UserIdentity } from '@supabase/supabase-js'
import {
  db,
  auth,
  collection,
  doc,
  getDoc,
  getDocs,
  getCountFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  signOut,
  signInWithPopup,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  googleProvider,
  githubProvider,
  facebookProvider,
  updateProfile,
} from './firebase'

// Path prefix for NullWave data in Firestore
const NW_PATH = ['atifs_codeworks', 'apps', 'nullwave'] as const

function getColRef(table: string) {
  return collection(db, ...NW_PATH, table, 'records')
}

// ===== PROFILES =====

export async function upsertFullProfile(
  userId: string,
  data: {
    username: string
    email: string
    avatar_url?: string | null
    fav_artists?: string | null
    fav_songs?: string | null
    instagram_id?: string | null
    approved?: boolean
  }
) {
  try {
    const existing = await getProfile(userId, data.email)
    const mergedData = {
      id: userId,
      auth_uid: auth.currentUser?.uid || userId,
      ...data,
      username: existing?.username || data.username,
      avatar_url: existing?.avatar_url || data.avatar_url,
      fav_artists: existing?.fav_artists || data.fav_artists,
      fav_songs: existing?.fav_songs || data.fav_songs,
      theme: existing?.theme || 'system',
      approved: existing?.approved ?? data.approved ?? true,
      updated_at: new Date().toISOString(),
    }
    const docRef = doc(getColRef('users'), userId)
    await setDoc(docRef, mergedData, { merge: true })
  } catch (err: any) {
    console.error('Failed to upsert full profile:', err)
  }
}

export async function adminForceUpdateProfile(userId: string, data: any) {
  try {
    const docRef = doc(getColRef('users'), userId)
    await setDoc(docRef, { ...data, updated_at: new Date().toISOString() }, { merge: true })
  } catch (err: any) {
    console.error('Failed to force update profile:', err)
    throw err
  }
}

export async function mergeGoogleProfile(userId: string, googleMetadata: any) {
  if (!googleMetadata) return
  const { full_name, avatar_url, email } = googleMetadata
  const existing = await getProfile(userId, email)
  const updates: any = { updated_at: new Date().toISOString() }
  if (!existing?.username && full_name) updates.username = full_name
  if (!existing?.avatar_url && avatar_url) updates.avatar_url = avatar_url

  if (Object.keys(updates).length > 1) {
    const docRef = doc(getColRef('users'), userId)
    await setDoc(docRef, updates, { merge: true })
  }
}

export async function getProfile(userId: string, email?: string) {
  const cleanEmail = (email || auth.currentUser?.email || '').trim().toLowerCase()
  const isMasterAdmin =
    cleanEmail === 'mratif00007@gmail.com' ||
    userId === 'fkQeMnkZwcdfBqJv2wAQwwmDdzi1' ||
    auth.currentUser?.email?.toLowerCase() === 'mratif00007@gmail.com' ||
    auth.currentUser?.uid === 'fkQeMnkZwcdfBqJv2wAQwwmDdzi1'
  const isTaniya =
    cleanEmail === 'tya44239@gmail.com' ||
    userId === 'qhYRtYSbpsPDKT1zkXwOZ5CcgsY2' ||
    auth.currentUser?.email?.toLowerCase() === 'tya44239@gmail.com' ||
    auth.currentUser?.uid === 'qhYRtYSbpsPDKT1zkXwOZ5CcgsY2'

  try {
    const usersCol = getColRef('users')
    let foundData: any = null

    // 1. Direct document by userId (must be a full profile doc, not just theme preference)
    const dSnap = await getDoc(doc(usersCol, userId)).catch(() => null)
    if (dSnap && dSnap.exists()) {
      const d = dSnap.data()
      if (d && (d.email || d.username || d.approved !== undefined)) {
        foundData = d
      }
    }

    // 2. Query by auth_uid == userId
    if (!foundData) {
      const qAuth = query(usersCol, where('auth_uid', '==', userId), limit(1))
      const authSnap = await getDocs(qAuth).catch(() => null)
      if (authSnap && !authSnap.empty) {
        foundData = authSnap.docs[0].data()
      }
    }

    // 3. Query by email
    if (!foundData && cleanEmail) {
      const qEmail = query(usersCol, where('email', '==', cleanEmail), limit(1))
      const emailSnap = await getDocs(qEmail).catch(() => null)
      if (emailSnap && !emailSnap.empty) {
        foundData = emailSnap.docs[0].data()
      }
    }

    if (foundData) {
      if (isMasterAdmin) {
        foundData.role = 'admin'
        foundData.approved = true
      } else if (isTaniya) {
        foundData.approved = true
      }

      // Automatically link auth_uid and replicate doc to userId for instant direct lookup
      if (userId && (!foundData.auth_uid || foundData.auth_uid !== userId)) {
        foundData.auth_uid = userId
        if (foundData.id) {
          setDoc(doc(usersCol, foundData.id), { auth_uid: userId }, { merge: true }).catch(() => {})
        }
        if (foundData.id !== userId) {
          setDoc(doc(usersCol, userId), { ...foundData, id: userId, auth_uid: userId }, { merge: true }).catch(() => {})
        }
      }

      return foundData
    }

    // Master Admin fallback if somehow not fetched from DB
    if (isMasterAdmin) {
      return {
        id: userId || 'fkQeMnkZwcdfBqJv2wAQwwmDdzi1',
        auth_uid: 'fkQeMnkZwcdfBqJv2wAQwwmDdzi1',
        username: 'Exotic Atif',
        email: 'mratif00007@gmail.com',
        avatar_url: auth.currentUser?.photoURL || 'https://res.cloudinary.com/mian-storage/image/upload/v1793075995/nullwave_pfps/53a2a0bb-77f3-46e0-a450-4dddfbd4e2dc.jpg',
        approved: true,
        role: 'admin',
        theme: 'dark',
      }
    }

    if (isTaniya) {
      return {
        id: userId || 'qhYRtYSbpsPDKT1zkXwOZ5CcgsY2',
        auth_uid: 'qhYRtYSbpsPDKT1zkXwOZ5CcgsY2',
        username: 'Taniya Karmakar',
        email: 'tya44239@gmail.com',
        avatar_url: 'https://i.ibb.co/RpKcgkQ8/Tanu-pfp.jpg',
        approved: true,
        role: 'member',
        theme: 'system',
      }
    }

    // 4. User is not in records: NOT approved
    if (auth.currentUser) {
      return {
        id: auth.currentUser.uid,
        auth_uid: auth.currentUser.uid,
        username: auth.currentUser.displayName || cleanEmail.split('@')[0] || 'User',
        email: cleanEmail,
        avatar_url: auth.currentUser.photoURL || null,
        approved: false,
        role: 'member',
        theme: 'system',
      }
    }

    return null
  } catch (err) {
    console.warn('Failed to fetch profile:', err)
    if (isMasterAdmin) {
      return {
        id: userId || 'fkQeMnkZwcdfBqJv2wAQwwmDdzi1',
        auth_uid: 'fkQeMnkZwcdfBqJv2wAQwwmDdzi1',
        username: 'Exotic Atif',
        email: 'mratif00007@gmail.com',
        avatar_url: auth.currentUser?.photoURL || null,
        approved: true,
        role: 'admin',
        theme: 'dark',
      }
    }
    return null
  }
}

export async function getSenderProfile(senderId: string) {
  return await getProfile(senderId)
}

export async function updateProfileName(userId: string, newName: string) {
  try {
    const docRef = doc(getColRef('users'), userId)
    await setDoc(docRef, { username: newName, updated_at: new Date().toISOString() }, { merge: true })
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: newName }).catch(() => {})
    }
  } catch (err: any) {
    console.error('Failed to update profile name:', err)
    throw err
  }
}

export async function updateProfileAvatar(userId: string, avatarUrl: string) {
  try {
    const docRef = doc(getColRef('users'), userId)
    await setDoc(docRef, { avatar_url: avatarUrl, updated_at: new Date().toISOString() }, { merge: true })
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { photoURL: avatarUrl }).catch(() => {})
    }
  } catch (err: any) {
    console.error('Failed to update avatar:', err)
    throw err
  }
}

export async function updateThemePreference(userId: string, theme: string) {
  try {
    const docRef = doc(getColRef('users'), userId)
    await setDoc(docRef, { theme, updated_at: new Date().toISOString() }, { merge: true })
  } catch (err: any) {
    console.error('Failed to update theme:', err)
    throw err
  }
}

export async function updateProfileFavs(userId: string, favSongs: string, favArtists: string) {
  try {
    const docRef = doc(getColRef('users'), userId)
    await setDoc(
      docRef,
      { fav_songs: favSongs, fav_artists: favArtists, updated_at: new Date().toISOString() },
      { merge: true }
    )
  } catch (err: any) {
    console.error('Failed to update profile favs:', err)
    throw err
  }
}

// ===== LIKED SONGS =====

export async function fetchLikedSongs(userId: string): Promise<{ trackId: string; track: Track }[]> {
  try {
    const colRef = getColRef('liked_tracks')
    const currentUid = auth.currentUser?.uid || userId

    let snap = await getDocs(query(colRef, where('auth_uid', '==', currentUid)))
    if (snap.empty) {
      snap = await getDocs(query(colRef, where('user_id', '==', userId)))
    }

    return snap.docs.map((d) => {
      const data = d.data()
      return {
        trackId: data.track_id || d.id,
        track: (data.track_data || data) as Track,
      }
    })
  } catch (err) {
    console.error('Failed to fetch likes:', err)
    return []
  }
}

export async function addLikedSong(userId: string, track: Track) {
  try {
    const colRef = getColRef('liked_tracks')
    const currentUid = auth.currentUser?.uid || userId
    const docId = `${currentUid}_${track.id}`.replace(/[^a-zA-Z0-9_-]/g, '_')

    await setDoc(doc(colRef, docId), {
      id: docId,
      user_id: currentUid,
      auth_uid: currentUid,
      legacy_user_id: userId,
      track_id: track.id,
      title: track.title || '',
      artist: track.artist || '',
      track_data: track,
      liked_at: new Date().toISOString(),
    }, { merge: true })
  } catch (err: any) {
    console.error('Failed to like song:', err)
  }
}

export async function removeLikedSong(userId: string, trackId: string) {
  try {
    const colRef = getColRef('liked_tracks')
    const currentUid = auth.currentUser?.uid || userId

    const snap1 = await getDocs(query(colRef, where('auth_uid', '==', currentUid), where('track_id', '==', trackId)))
    for (const d of snap1.docs) {
      await deleteDoc(d.ref)
    }
    const snap2 = await getDocs(query(colRef, where('user_id', '==', userId), where('track_id', '==', trackId)))
    for (const d of snap2.docs) {
      await deleteDoc(d.ref)
    }
  } catch (err: any) {
    console.error('Failed to unlike song:', err)
  }
}

// ===== PLAY HISTORY =====

const parseHistoryTimestamp = (value: unknown): number => {
  if (value && typeof value === 'object' && 'toMillis' in value && typeof (value as any).toMillis === 'function') {
    return (value as any).toMillis()
  }
  if (value instanceof Date) return value.getTime()
  if (typeof value === 'number') return value
  if (typeof value === 'string') return Date.parse(value) || 0
  return 0
}

export async function recordPlayHistory(userId: string, track: Track) {
  try {
    const colRef = getColRef('play_history')
    const currentUid = auth.currentUser?.uid || userId
    if (!auth.currentUser || (auth.currentUser.uid !== currentUid && auth.currentUser.uid !== userId)) return
    const historyDoc = doc(colRef)
    await setDoc(historyDoc, {
      id: historyDoc.id,
      user_id: currentUid,
      auth_uid: currentUid,
      legacy_user_id: userId,
      track_id: track.id,
      title: track.title || '',
      artist: track.artist || '',
      track_data: track,
      played_at: new Date().toISOString(),
    })

    // Keep only the newest 100 play events for this user. Aggregation avoids
    // reading the full history on every play; delete only the overflow tail.
    const ownerQuery = query(colRef, where('auth_uid', '==', currentUid))
    for (let pass = 0; pass < 3; pass += 1) {
      try {
        const count = (await getCountFromServer(ownerQuery)).data().count
        const overflow = count - 100
        if (overflow <= 0) break

        try {
          const oldest = await getDocs(query(ownerQuery, orderBy('played_at', 'asc'), limit(overflow)))
          if (!oldest.size) break
          await Promise.all(oldest.docs.map((entry) => deleteDoc(entry.ref)))
        } catch {
          // In-memory prune fallback if composite index is pending/building
          const allDocs = await getDocs(ownerQuery)
          const sorted = allDocs.docs.sort((a, b) => {
            const tA = parseHistoryTimestamp(a.data().played_at)
            const tB = parseHistoryTimestamp(b.data().played_at)
            return tA - tB
          })
          const toDelete = sorted.slice(0, overflow)
          await Promise.all(toDelete.map((entry) => deleteDoc(entry.ref)))
          break
        }
      } catch {
        break
      }
    }
  } catch (err: any) {
    console.error('Failed to record history:', err)
  }
}

export async function fetchPlayHistory(userId: string, limitCount = 100): Promise<Track[]> {
  try {
    const colRef = getColRef('play_history')
    const currentUid = auth.currentUser?.uid || userId

    // Play history is capped at 100 records per user. Fetch with single-field equality
    // index and sort locally, avoiding composite index errors during provisioning.
    let snap = await getDocs(query(colRef, where('auth_uid', '==', currentUid)))
    if (snap.empty && userId !== currentUid) {
      snap = await getDocs(query(colRef, where('user_id', '==', userId)))
    }

    const tracks = snap.docs.map((d) => {
      const data = d.data()
      return { track: (data.track_data || data) as Track, playedAt: parseHistoryTimestamp(data.played_at) }
    })
    const safeLimit = Math.max(0, Math.min(100, Math.floor(limitCount)))
    return tracks.sort((a, b) => b.playedAt - a.playedAt).slice(0, safeLimit).map(({ track }) => track)
  } catch (err) {
    console.error('Failed to fetch play history:', err)
    return []
  }
}

export async function clearPlayHistory(userId: string) {
  try {
    const colRef = getColRef('play_history')
    const currentUid = auth.currentUser?.uid || userId

    const snap1 = await getDocs(query(colRef, where('auth_uid', '==', currentUid)))
    for (const d of snap1.docs) await deleteDoc(d.ref)

    if (userId !== currentUid) {
      const snap2 = await getDocs(query(colRef, where('user_id', '==', userId)))
      for (const d of snap2.docs) await deleteDoc(d.ref)
    }
  } catch (err: any) {
    console.error('Failed to clear play history:', err)
  }
}

export async function removePlayHistoryItem(userId: string, trackId: string) {
  try {
    const colRef = getColRef('play_history')
    const currentUid = auth.currentUser?.uid || userId

    try {
      const snap1 = await getDocs(query(colRef, where('auth_uid', '==', currentUid), where('track_id', '==', trackId)))
      for (const d of snap1.docs) await deleteDoc(d.ref)
    } catch {
      const snap1 = await getDocs(query(colRef, where('auth_uid', '==', currentUid)))
      for (const d of snap1.docs) {
        if (d.data().track_id === trackId) await deleteDoc(d.ref)
      }
    }

    if (userId !== currentUid) {
      try {
        const snap2 = await getDocs(query(colRef, where('user_id', '==', userId), where('track_id', '==', trackId)))
        for (const d of snap2.docs) await deleteDoc(d.ref)
      } catch {
        const snap2 = await getDocs(query(colRef, where('user_id', '==', userId)))
        for (const d of snap2.docs) {
          if (d.data().track_id === trackId) await deleteDoc(d.ref)
        }
      }
    }
  } catch (err: any) {
    console.error('Failed to remove history item:', err)
  }
}

// ===== DISLIKED SONGS =====

export async function addDislikedSong(userId: string, track: Track) {
  try {
    const colRef = getColRef('disliked_songs')
    const currentUid = auth.currentUser?.uid || userId
    const docId = `${currentUid}_${track.id}`.replace(/[^a-zA-Z0-9_-]/g, '_')

    await setDoc(doc(colRef, docId), {
      id: docId,
      user_id: currentUid,
      auth_uid: currentUid,
      legacy_user_id: userId,
      track_id: track.id,
      title: track.title || '',
      artist: track.artist || '',
      track_data: track,
      disliked_at: new Date().toISOString(),
    }, { merge: true })
  } catch (err: any) {
    console.error('Failed to dislike song:', err)
  }
}

export async function removeDislikedSong(userId: string, trackId: string) {
  try {
    const colRef = getColRef('disliked_songs')
    const currentUid = auth.currentUser?.uid || userId

    const snap = await getDocs(query(colRef, where('auth_uid', '==', currentUid), where('track_id', '==', trackId)))
    for (const d of snap.docs) await deleteDoc(d.ref)
  } catch (err: any) {
    console.error('Failed to remove disliked song:', err)
  }
}

export async function fetchDislikedSongs(userId: string): Promise<Track[]> {
  try {
    const colRef = getColRef('disliked_songs')
    const currentUid = auth.currentUser?.uid || userId

    let snap = await getDocs(query(colRef, where('auth_uid', '==', currentUid)))
    if (snap.empty) {
      snap = await getDocs(query(colRef, where('user_id', '==', userId)))
    }

    return snap.docs.map((d) => {
      const data = d.data()
      return (data.track_data || data) as Track
    })
  } catch (err) {
    console.error('Failed to fetch disliked songs:', err)
    return []
  }
}

// ===== PLAYLISTS =====

export async function createPlaylist(userId: string, name: string) {
  try {
    const colRef = getColRef('playlists')
    const currentUid = auth.currentUser?.uid || userId
    const docRef = doc(colRef)
    const newPlaylist = {
      id: docRef.id,
      user_id: currentUid,
      auth_uid: currentUid,
      legacy_user_id: userId,
      name,
      created_at: new Date().toISOString(),
    }
    await setDoc(docRef, newPlaylist)
    return newPlaylist
  } catch (err: any) {
    console.error('Failed to create playlist:', err)
    return null
  }
}

export async function getUserPlaylists(userId: string) {
  try {
    const colRef = getColRef('playlists')
    const currentUid = auth.currentUser?.uid || userId

    let snap = await getDocs(query(colRef, where('auth_uid', '==', currentUid)))
    if (snap.empty) {
      snap = await getDocs(query(colRef, where('user_id', '==', userId)))
    }

    const playlists: any[] = snap.docs.map((d) => ({ id: d.id, ...d.data() }))

    const ptCol = getColRef('playlist_tracks')
    for (const p of playlists) {
      try {
        const ptSnap = await getDocs(query(ptCol, where('playlist_id', '==', p.id)))
        p.playlist_tracks = ptSnap.docs.map((d) => ({
          track_data: d.data().track_data || d.data(),
        }))
      } catch {
        p.playlist_tracks = []
      }
    }

    return playlists
  } catch (err) {
    console.error('Failed to fetch playlists:', err)
    return []
  }
}

export async function addTrackToPlaylist(playlistId: string, track: Track) {
  try {
    const ptCol = getColRef('playlist_tracks')
    const docId = `${playlistId}_${track.id}`.replace(/[^a-zA-Z0-9_-]/g, '_')
    await setDoc(doc(ptCol, docId), {
      id: docId,
      playlist_id: playlistId,
      user_id: auth.currentUser?.uid || '',
      auth_uid: auth.currentUser?.uid || '',
      track_id: track.id,
      track_data: track,
      added_at: new Date().toISOString(),
    }, { merge: true })
  } catch (err: any) {
    console.error('Failed to add track to playlist:', err)
  }
}

export async function getPlaylistTracks(playlistId: string): Promise<Track[]> {
  try {
    const ptCol = getColRef('playlist_tracks')
    const snap = await getDocs(query(ptCol, where('playlist_id', '==', playlistId)))
    return snap.docs.map((d) => (d.data().track_data || d.data()) as Track)
  } catch (err) {
    console.error('Failed to fetch playlist tracks:', err)
    return []
  }
}

export async function getPlaylistDetails(playlistId: string) {
  try {
    const docRef = doc(getColRef('playlists'), playlistId)
    const snap = await getDoc(docRef)
    if (snap.exists()) return { id: snap.id, ...snap.data() }
    return null
  } catch (err) {
    console.error('Failed to fetch playlist details:', err)
    return null
  }
}

export async function removeTrackFromPlaylist(playlistId: string, trackId: string) {
  try {
    const ptCol = getColRef('playlist_tracks')
    const snap = await getDocs(query(ptCol, where('playlist_id', '==', playlistId), where('track_id', '==', trackId)))
    for (const d of snap.docs) await deleteDoc(d.ref)
  } catch (err: any) {
    console.error('Failed to remove track:', err)
  }
}

export async function renamePlaylist(playlistId: string, newName: string) {
  try {
    const docRef = doc(getColRef('playlists'), playlistId)
    await updateDoc(docRef, { name: newName, updated_at: new Date().toISOString() })
  } catch (err: any) {
    console.error('Failed to rename playlist:', err)
  }
}

export async function deletePlaylist(playlistId: string) {
  try {
    const docRef = doc(getColRef('playlists'), playlistId)
    await deleteDoc(docRef)
  } catch (err: any) {
    console.error('Failed to delete playlist:', err)
  }
}

// ===== ACCESS REQUESTS =====

export interface AccessRequest {
  id: string
  display_name: string
  email: string
  auth_uid?: string | null
  avatar_url: string | null
  fav_artists: string | null
  fav_songs: string | null
  instagram_id: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export async function submitAccessRequest(data: {
  display_name: string
  email: string
  auth_uid?: string
  avatar_url?: string
  fav_artists?: string
  fav_songs?: string
  instagram_id?: string
}) {
  try {
    const colRef = getColRef('access_requests')
    const docRef = doc(colRef)
    await setDoc(docRef, {
      id: docRef.id,
      ...data,
      status: 'pending',
      created_at: new Date().toISOString(),
    })
  } catch (err: any) {
    throw new Error(err.message)
  }
}

export async function completeAccessRequest(data: {
  email: string
  display_name: string
  avatar_url?: string
  fav_artists?: string
  fav_songs?: string
  instagram_id?: string
}) {
  return await submitAccessRequest(data)
}

export async function fetchAccessRequests(): Promise<AccessRequest[]> {
  try {
    const colRef = getColRef('access_requests')
    const snap = await getDocs(colRef)
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as AccessRequest)
  } catch (err) {
    console.error('Failed to fetch access requests:', err)
    return []
  }
}

export async function updateAccessRequest(id: string, updates: Partial<AccessRequest>) {
  try {
    const docRef = doc(getColRef('access_requests'), id)
    await updateDoc(docRef, updates)
  } catch (err) {
    console.error('Failed to update access request:', err)
  }
}

export async function deleteAccessRequest(id: string) {
  try {
    const docRef = doc(getColRef('access_requests'), id)
    await deleteDoc(docRef)
  } catch (err) {
    console.error('Failed to delete access request:', err)
  }
}

export async function cancelAccessRequest(email: string) {
  try {
    const colRef = getColRef('access_requests')
    const snap = await getDocs(query(colRef, where('email', '==', email.toLowerCase().trim())))
    for (const d of snap.docs) await deleteDoc(d.ref)
  } catch (err: any) {
    throw new Error(err.message)
  }
}

// ===== ADMIN API =====

export async function fetchAllProfiles() {
  try {
    const colRef = getColRef('users')
    const snap = await getDocs(colRef)
    return snap.docs.map((d) => d.data())
  } catch (err) {
    console.error('Failed to fetch all profiles:', err)
    return []
  }
}

export async function adminUpdateProfile(userId: string, updates: any) {
  try {
    const docRef = doc(getColRef('users'), userId)
    await setDoc(docRef, { ...updates, updated_at: new Date().toISOString() }, { merge: true })
  } catch (err: any) {
    throw new Error(err.message)
  }
}

export async function adminDeleteProfile(userId: string) {
  try {
    const docRef = doc(getColRef('users'), userId)
    await deleteDoc(docRef)
  } catch (err: any) {
    throw new Error(err.message)
  }
}

export async function adminUpdateAuthCredentials(
  _userId: string,
  _jwt: string,
  _password?: string,
  _email?: string,
  _username?: string
) {
  throw new Error('Credential management must be performed directly in Firebase Console or via Firebase Admin SDK.')
}

export async function adminApproveAccessRequest(
  _tokenOrRequestId?: any,
  reqOrEmail?: any,
  updatedDataOrName?: any
): Promise<any> {
  try {
    const req = typeof reqOrEmail === 'object' ? reqOrEmail : { id: _tokenOrRequestId, email: reqOrEmail }
    const updated = typeof updatedDataOrName === 'object' ? updatedDataOrName : {}
    const merged = { ...req, ...updated }
    const cleanEmail = (merged.email || '').trim().toLowerCase()
    const usersCol = getColRef('users')

    // Check if user already has a record in users collection or auth_uid is known
    const targetUid = merged.auth_uid || merged.uid || merged.user_id
    let userDocRef = targetUid ? doc(usersCol, targetUid) : doc(usersCol)
    if (cleanEmail) {
      const qEmail = query(usersCol, where('email', '==', cleanEmail), limit(1))
      const snap = await getDocs(qEmail)
      if (!snap.empty) {
        userDocRef = snap.docs[0].ref
      }
    }

    const profileData: any = {
      id: userDocRef.id,
      email: cleanEmail,
      username: merged.display_name || cleanEmail.split('@')[0] || 'User',
      avatar_url: merged.avatar_url || null,
      fav_artists: merged.fav_artists || null,
      fav_songs: merged.fav_songs || null,
      instagram_id: merged.instagram_id || null,
      approved: true,
      role: 'member',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    if (targetUid) {
      profileData.auth_uid = targetUid
    }

    await setDoc(userDocRef, profileData, { merge: true })

    // Also ensure direct record at targetUid if targetUid is known
    if (targetUid && userDocRef.id !== targetUid) {
      await setDoc(doc(usersCol, targetUid), { ...profileData, id: targetUid, auth_uid: targetUid }, { merge: true }).catch(() => {})
    }

    if (merged.id) {
      const reqDocRef = doc(getColRef('access_requests'), merged.id)
      await updateDoc(reqDocRef, { status: 'approved' }).catch(() => {})
    }

    return { request: { ...merged, status: 'approved' }, success: true }
  } catch (err: any) {
    console.error('Failed to approve access request:', err)
    return { request: null, success: false, error: err.message }
  }
}

export async function adminFetchUserHistory(userId: string) {
  return await fetchPlayHistory(userId)
}

export async function adminDeleteUserHistoryItem(itemId: string) {
  try {
    const docRef = doc(getColRef('play_history'), itemId)
    await deleteDoc(docRef)
  } catch {}
}

export async function adminFetchUserPlaylists(userId: string) {
  return await getUserPlaylists(userId)
}

export async function adminDeletePlaylist(playlistId: string) {
  return await deletePlaylist(playlistId)
}

export async function adminFetchUserLikedSongs(userId: string) {
  return await fetchLikedSongs(userId)
}

export async function adminDeleteUserLikedSong(itemId: string) {
  try {
    const docRef = doc(getColRef('liked_tracks'), itemId)
    await deleteDoc(docRef)
  } catch {}
}

export async function adminDeleteAuthUser(_userId: string, _jwt: string) {
  throw new Error('User deletion from Authentication must be performed via Firebase Admin SDK or Console.')
}

export function isFacebookConnected(user: any): boolean {
  if (!user || !user.app_metadata || !user.app_metadata.providers) return false
  return user.app_metadata.providers.includes('facebook')
}

export function isGoogleConnected(user: any): boolean {
  if (!user) return false
  if (user.app_metadata?.providers) return user.app_metadata.providers.includes('google')
  return true
}

export function isGithubConnected(user: any): boolean {
  if (!user) return false
  if (user.app_metadata?.providers) return user.app_metadata.providers.includes('github')
  return false
}

export async function checkUserApproval(userId: string, email?: string): Promise<boolean> {
  const cleanEmail = (email || auth.currentUser?.email || '').trim().toLowerCase()
  if (cleanEmail === 'mratif00007@gmail.com' || userId === 'fkQeMnkZwcdfBqJv2wAQwwmDdzi1') return true
  if (cleanEmail === 'tya44239@gmail.com' || userId === 'qhYRtYSbpsPDKT1zkXwOZ5CcgsY2') return true
  const profile = await getProfile(userId, email)
  return profile ? Boolean(profile.approved === true) : false
}

// Supabase backwards compatibility adapter for any legacy references
export const supabaseUrl = ''
export const supabaseAnonKey = ''

function createDummyUser(): User {
  const u = auth.currentUser
  return {
    id: u?.uid || 'usr_anonymous',
    app_metadata: {
      provider: 'google',
      providers: ['google'],
    },
    user_metadata: {
      full_name: u?.displayName || 'User',
      name: u?.displayName || 'User',
      avatar_url: u?.photoURL || null,
      picture: u?.photoURL || null,
      facebook_id: null,
    },
    aud: 'authenticated',
    confirmation_sent_at: '',
    recovery_sent_at: '',
    email_change_sent_at: '',
    new_email: '',
    invited_at: '',
    action_link: '',
    email: u?.email || '',
    phone: '',
    created_at: new Date().toISOString(),
    confirmed_at: new Date().toISOString(),
    email_confirmed_at: new Date().toISOString(),
    phone_confirmed_at: '',
    last_sign_in_at: new Date().toISOString(),
    role: 'authenticated',
    updated_at: new Date().toISOString(),
    identities: [
      {
        id: u?.uid || 'google_identity',
        user_id: u?.uid || 'usr_anonymous',
        identity_id: u?.uid || 'google_identity',
        identity_data: { email: u?.email, full_name: u?.displayName, avatar_url: u?.photoURL },
        provider: 'google',
        last_sign_in_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as unknown as UserIdentity,
    ],
    factors: [],
  } as User
}

function createDummySession(): Session {
  const user = createDummyUser()
  return {
    access_token: 'firebase_auth_token_active',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    refresh_token: 'firebase_refresh_token_active',
    user,
  } as Session
}

export interface MockAuth {
  getUser: () => Promise<{ data: { user: User | null }; error: any }>
  getSession: () => Promise<{ data: { session: Session | null }; error: any }>
  updateUser: (attributes: any) => Promise<{ data: { user: User | null }; error: any }>
  refreshSession: () => Promise<{ data: { session: Session | null; user: User | null }; error: any }>
  linkIdentity: (identity: any) => Promise<{ data: any; error: any }>
  unlinkIdentity: (identity: any) => Promise<{ data: any; error: any }>
  signOut: () => Promise<void>
  signInWithPassword: (creds: any) => Promise<{ data: any; error: any }>
  onAuthStateChange: (cb: (event: string, session: Session | null) => void) => { data: { subscription: { unsubscribe: () => void } } }
  signInWithOAuth: (opts: any) => Promise<{ data: any; error: any }>
}

export interface MockSupabase {
  auth: MockAuth
  from: (table: string) => any
  rpc: (name: string, params?: any) => Promise<{ data: any; error: any }>
  [key: string]: any
}

export const supabase: MockSupabase = {
  auth: {
    getUser: async (): Promise<{ data: { user: User | null }; error: any }> => ({
      data: { user: auth.currentUser ? createDummyUser() : null },
      error: null,
    }),
    getSession: async (): Promise<{ data: { session: Session | null }; error: any }> => ({
      data: {
        session: auth.currentUser ? createDummySession() : null,
      },
      error: null,
    }),
    updateUser: async (_attributes: any): Promise<{ data: { user: User | null }; error: any }> => ({
      data: { user: createDummyUser() },
      error: null,
    }),
    refreshSession: async (): Promise<{ data: { session: Session | null; user: User | null }; error: any }> => ({
      data: { session: createDummySession(), user: createDummyUser() },
      error: null,
    }),
    linkIdentity: async (_identity: any): Promise<{ data: any; error: any }> => ({ data: null, error: null }),
    unlinkIdentity: async (_identity: any): Promise<{ data: any; error: any }> => ({ data: null, error: null }),
    signOut: async () => {
      await signOut(auth)
    },
    signInWithPassword: async ({ email, password }: any) => {
      try {
        await signInWithEmailAndPassword(auth, email, password)
        return { data: { user: createDummyUser(), session: createDummySession() }, error: null }
      } catch (err: any) {
        return { data: { user: null, session: null }, error: err }
      }
    },
    onAuthStateChange: (cb: (event: string, session: Session | null) => void) => {
      const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
        cb(fbUser ? 'SIGNED_IN' : 'SIGNED_OUT', fbUser ? createDummySession() : null)
      })
      return {
        data: {
          subscription: {
            unsubscribe,
          },
        },
      }
    },
    signInWithOAuth: async ({ provider }: any) => {
      if (provider === 'google') await signInWithPopup(auth, googleProvider)
      else if (provider === 'github') await signInWithPopup(auth, githubProvider)
      else if (provider === 'facebook') await signInWithPopup(auth, facebookProvider)
      return { data: null, error: null }
    },
  },
  from: (_table: string) => {
    const chain: any = {
      select: () => chain,
      insert: () => chain,
      update: () => chain,
      delete: () => chain,
      eq: () => chain,
      order: () => chain,
      limit: () => chain,
      single: () => Promise.resolve({ data: null, error: null }),
      then: (resolve: any) => Promise.resolve({ data: [], error: null }).then(resolve),
    }
    return chain
  },
  rpc: (_name: string, _params?: any) => {
    return Promise.resolve({
      data: { available: true, reason: null, request: null },
      error: null,
    })
  },
}
