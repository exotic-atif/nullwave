import { useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ScrollableRowProps {
  children: React.ReactNode
  className?: string
}

export function ScrollableRow({ children, className = '' }: ScrollableRowProps) {
  const rowRef = useRef<HTMLDivElement>(null)
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(true)

  const handleScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current
      setShowLeft(scrollLeft > 10)
      setShowRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  // Check initial state once children are mounted
  useEffect(() => {
    handleScroll()
    window.addEventListener('resize', handleScroll)
    return () => window.removeEventListener('resize', handleScroll)
  }, [children])

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { clientWidth } = rowRef.current
      // Scroll by 75% of the container width for a smooth chunk
      const scrollAmount = direction === 'left' ? -(clientWidth * 0.75) : clientWidth * 0.75
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <div className={`relative group ${className}`}>
      {/* Left Fade Edge */}
      <div 
        className={`absolute left-0 top-0 bottom-4 w-12 bg-gradient-to-r from-nw-surface to-transparent z-10 pointer-events-none transition-opacity duration-300 ${showLeft ? 'opacity-100' : 'opacity-0'}`} 
      />
      {/* Left Arrow (Only visible on PC hover if there is content to scroll) */}
      {showLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white rounded-r-2xl shadow-[4px_0_12px_rgba(0,0,0,0.5)] opacity-0 group-hover:opacity-100 transition-all duration-200 hidden lg:flex items-center justify-center translate-x-[-100%] group-hover:translate-x-0"
          aria-label="Scroll left"
        >
          <ChevronLeft size={28} />
        </button>
      )}

      {/* Scrollable Container */}
      <div 
        ref={rowRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-none snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>

      {/* Right Arrow (Only visible on PC hover if there is content to scroll) */}
      {showRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white rounded-l-2xl shadow-[-4px_0_12px_rgba(0,0,0,0.5)] opacity-0 group-hover:opacity-100 transition-all duration-200 hidden lg:flex items-center justify-center translate-x-[100%] group-hover:translate-x-0"
          aria-label="Scroll right"
        >
          <ChevronRight size={28} />
        </button>
      )}

      {/* Right Fade Edge */}
      <div 
        className={`absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-nw-surface to-transparent z-10 pointer-events-none transition-opacity duration-300 ${showRight ? 'opacity-100' : 'opacity-0'}`} 
      />
    </div>
  )
}
