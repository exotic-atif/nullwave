// ===== MUSIC TYPES =====

export interface Track {
  id: string
  title: string
  artist: string
  album: string
  albumId: string
  duration: number // in seconds
  coverUrl: string
  audioUrl?: string
  genre?: string
  year?: number
  isLiked?: boolean
  spotifyUrl?: string
}

export interface Album {
  id: string
  title: string
  artist: string
  coverUrl: string
  year: number
  genre?: string
  tracks: Track[]
  description?: string
  totalTracks?: number
}

export interface Artist {
  id: string
  name: string
  imageUrl: string
  bio?: string
  genres?: string[]
}

export interface Playlist {
  id: string
  user_id: string
  name: string
  cover_url?: string
  created_at?: string
  playlist_tracks?: { track_data: Track }[]
}

export interface PlaylistWithTracks extends Playlist {
  tracks: Track[]
}

// ===== PLAYER TYPES =====

export type RepeatMode = 'off' | 'all' | 'one'

export interface PlayerState {
  currentTrack: Track | null
  isPlaying: boolean
  volume: number
  progress: number
  duration: number
  isMuted: boolean
  isShuffled: boolean
  repeatMode: RepeatMode
}

// ===== AUTH TYPES =====

export interface User {
  id: string
  email: string
  displayName: string
  avatarUrl?: string
  role: 'member' | 'contributor' | 'bug_tester' | 'helping_dev' | 'admin'
  createdAt: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

// ===== THEME TYPES =====

export type Theme = 'dark' | 'light'

// ===== SEARCH TYPES =====

export interface SearchResult {
  tracks: Track[]
  albums: Album[]
  artists: Artist[]
}
