import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-nw-surface/60',
        className
      )}
    />
  )
}

/** Skeleton for a track row */
export function TrackRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3 py-2">
      <Skeleton className="w-6 h-4 rounded" />
      <Skeleton className="w-10 h-10 rounded-md flex-shrink-0" />
      <div className="flex-1 min-w-0 space-y-1.5">
        <Skeleton className="h-3.5 w-3/5 rounded" />
        <Skeleton className="h-3 w-2/5 rounded" />
      </div>
      <Skeleton className="h-3 w-10 rounded hidden md:block" />
      <Skeleton className="h-3 w-8 rounded" />
    </div>
  )
}

/** Skeleton for an album card */
export function AlbumCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-3">
      <Skeleton className="aspect-square w-full rounded-xl" />
      <div className="space-y-1.5">
        <Skeleton className="h-3.5 w-4/5 rounded" />
        <Skeleton className="h-3 w-3/5 rounded" />
      </div>
    </div>
  )
}

/** Skeleton for an artist card */
export function ArtistCardSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-3 min-w-[120px]">
      <Skeleton className="w-24 h-24 rounded-full" />
      <Skeleton className="h-3.5 w-16 rounded" />
    </div>
  )
}
