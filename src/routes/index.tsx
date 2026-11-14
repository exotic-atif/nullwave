import { createBrowserRouter, Outlet } from 'react-router-dom'
import { PageTracker } from '@/components/analytics/PageTracker'
import { AppLayout } from '@/components/layout/AppLayout'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { HomePage } from '@/pages/Home'
import { SearchPage } from '@/pages/Search'
import { LibraryPage } from '@/pages/Library'
import { QueuePage } from '@/pages/Queue'
import { SettingsPage } from '@/pages/Settings'
import { YouPage } from '@/pages/You'
import { LoginPage } from '@/pages/Login'
import { PlaylistDetail } from '@/pages/PlaylistDetail'
import { ArtistDetailPage } from '@/pages/ArtistDetail'
import { AlbumDetailPage } from '@/pages/AlbumDetail'
import { AlbumsPage } from '@/pages/Albums'
import { RequestAccessPage } from '@/pages/RequestAccess'
import { AdminPage } from '@/pages/Admin'
import { AuthCallback } from '@/pages/AuthCallback'
import { PrivacyPolicy } from '@/pages/PrivacyPolicy'
import { TermsOfService } from '@/pages/TermsOfService'
import { LandingPage } from '@/pages/Landing'
import { DataDeletion } from '@/pages/DataDeletion'
import { NotFoundPage } from '@/pages/NotFound'

function RootTrackerLayout() {
  return (
    <>
      <PageTracker />
      <Outlet />
    </>
  )
}

export const router = createBrowserRouter([
  {
    element: <RootTrackerLayout />,
    children: [
      {
        path: '/landing',
        element: <LandingPage />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/req-access',
        element: <RequestAccessPage />,
      },
      {
        path: '/privacy',
        element: <PrivacyPolicy />,
      },
      {
        path: '/terms',
        element: <TermsOfService />,
      },
      {
        path: '/data-deletion',
        element: <DataDeletion />,
      },
      {
        path: '/auth/callback',
        element: <AuthCallback />,
      },
      {
        path: '/admin',
        element: <AdminPage />,
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
              { path: 'albums', element: <AlbumsPage /> },
              { path: 'album', element: <AlbumsPage /> },
              { path: 'album/:id', element: <AlbumDetailPage /> },
              { path: 'queue', element: <QueuePage /> },
              { path: 'settings', element: <SettingsPage /> },
              { path: 'you', element: <YouPage /> },
              { path: '*', element: <NotFoundPage /> },
            ],
          },
        ],
      },
    ],
  },
])
