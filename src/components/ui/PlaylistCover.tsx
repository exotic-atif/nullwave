import { ListMusic } from 'lucide-react'

interface PlaylistCoverProps {
  coverUrls: string[]
  className?: string
}

export function PlaylistCover({ coverUrls, className = '' }: PlaylistCoverProps) {
  // If we have an explicitly set cover URL, just use that
  if (coverUrls.length === 1 && !coverUrls[0].includes('http')) {
    // Actually we only pass valid URLs here, let's assume they are valid
  }

  // Deduplicate URLs and take up to 4
  const uniqueUrls = Array.from(new Set(coverUrls)).slice(0, 4)

  if (uniqueUrls.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-nw-elevated text-nw-text-tertiary ${className}`}>
        <ListMusic size={32} />
      </div>
    )
  }

  if (uniqueUrls.length === 1) {
    return (
      <div className={`relative ${className}`}>
        <img src={uniqueUrls[0]} alt="Playlist Cover" className="w-full h-full object-cover" />
      </div>
    )
  }

  if (uniqueUrls.length === 2) {
    return (
      <div className={`flex ${className}`}>
        <div className="w-1/2 h-full">
          <img src={uniqueUrls[0]} alt="Cover 1" className="w-full h-full object-cover" />
        </div>
        <div className="w-1/2 h-full">
          <img src={uniqueUrls[1]} alt="Cover 2" className="w-full h-full object-cover" />
        </div>
      </div>
    )
  }

  if (uniqueUrls.length === 3) {
    return (
      <div className={`flex flex-wrap ${className}`}>
        <div className="w-1/2 h-full">
          <img src={uniqueUrls[0]} alt="Cover 1" className="w-full h-full object-cover" />
        </div>
        <div className="w-1/2 h-full flex flex-col">
          <img src={uniqueUrls[1]} alt="Cover 2" className="w-full h-1/2 object-cover" />
          <img src={uniqueUrls[2]} alt="Cover 3" className="w-full h-1/2 object-cover" />
        </div>
      </div>
    )
  }

  // 4 or more
  return (
    <div className={`grid grid-cols-2 grid-rows-2 ${className}`}>
      <img src={uniqueUrls[0]} alt="Cover 1" className="w-full h-full object-cover" />
      <img src={uniqueUrls[1]} alt="Cover 2" className="w-full h-full object-cover" />
      <img src={uniqueUrls[2]} alt="Cover 3" className="w-full h-full object-cover" />
      <img src={uniqueUrls[3]} alt="Cover 4" className="w-full h-full object-cover" />
    </div>
  )
}
