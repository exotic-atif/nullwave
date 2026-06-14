import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { HomePage } from '@/pages/Home'
import { SearchPage } from '@/pages/Search'
import { LibraryPage } from '@/pages/Library'
import { QueuePage } from '@/pages/Queue'
import { SettingsPage } from '@/pages/Settings'
import { LoginPage } from '@/pages/Login'
import { PlaylistDetail } from '@/pages/PlaylistDetail'
import { ArtistDetailPage } from '@/pages/ArtistDetail'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <AuthGuard />,
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'search', element: <SearchPage /> },
          { path: 'library', element: <LibraryPage /> },
          { path: 'playlist/:id', element: <PlaylistDetail /> },
          { path: 'artist/:name', element: <ArtistDetailPage /> },
          { path: 'queue', element: <QueuePage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
])

