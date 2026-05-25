import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
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

        {/* Content */}
        <main
          className={`flex-1 overflow-y-auto overflow-x-hidden ${
            currentTrack ? 'pb-[88px] md:pb-[96px]' : ''
          }`}
        >
          <div className="gradient-mesh min-h-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Player */}
      <Player />
    </div>
  )
}
