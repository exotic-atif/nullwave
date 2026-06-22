import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { MobileNavBar } from './MobileNavBar'
import { Player } from '../player/Player'
import { useState } from 'react'
import { usePlayerStore } from '@/store'

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const currentTrack = usePlayerStore((s) => s.currentTrack)

  return (
    <div className="h-screen flex bg-nw-black overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Content — extra pb on mobile for bottom nav + player */}
        <main
          className={`flex-1 overflow-y-auto overflow-x-hidden ${
            currentTrack ? 'md:pb-[96px]' : 'md:pb-0'
          }`}
          style={{
            paddingBottom: typeof window !== 'undefined' && window.innerWidth < 768 
              ? (currentTrack 
                  ? 'calc(144px + env(safe-area-inset-bottom))' 
                  : 'calc(72px + env(safe-area-inset-bottom))')
              : undefined
          }}
        >
          <div className="gradient-mesh min-h-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNavBar />

      {/* Player */}
      <Player />
    </div>
  )
}
