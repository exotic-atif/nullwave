import { Disc3, Home, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export function NotFoundPage() {
  return (
    <main className="flex min-h-[65vh] items-center justify-center px-5 py-12">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/[0.08] bg-nw-surface/60 px-6 py-12 text-center shadow-2xl shadow-black/30 backdrop-blur-xl sm:px-12"
      >
        <div className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-nw-accent/10 blur-3xl" />
        <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-nw-accent/20 bg-nw-accent/10 text-nw-accent">
          <Disc3 size={32} />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-nw-accent">404 · Lost in the mix</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-nw-text sm:text-4xl">
          This page isn’t in the library
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-nw-text-secondary">
          The page may have moved, or the link may be out of date. Head home or browse our albums and tracks.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="inline-flex items-center gap-2 rounded-full bg-nw-accent px-5 py-2.5 text-sm font-semibold text-nw-black transition hover:bg-nw-accent-hover">
            <Home size={16} /> Go home
          </Link>
          <Link to="/albums" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-nw-text transition hover:bg-white/[0.08]">
            <Disc3 size={16} /> Browse albums
          </Link>
          <Link to="/search" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-nw-text transition hover:bg-white/[0.08]">
            <Search size={16} /> Search music
          </Link>
        </div>
      </motion.section>
    </main>
  )
}
