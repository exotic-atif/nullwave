import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Radio, Play, Shield, Sparkles, Music, Lock, ChevronRight } from 'lucide-react'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-nw-black text-nw-text font-sans overflow-x-hidden selection:bg-nw-accent/30 selection:text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-nw-accent/[0.04] blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-nw-accent-glow/[0.03] blur-[120px]" />
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: 'linear-gradient(rgba(56,189,248,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-6 lg:px-12 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nw-accent to-nw-accent-glow flex items-center justify-center shadow-lg shadow-nw-accent-glow/20">
            <Radio size={20} className="text-white" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">Nullwave | By Atif Arman</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-nw-text-secondary hover:text-white transition-colors">
            Sign In
          </Link>
          <Link to="/req-access" className="text-sm font-medium bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-full transition-all">
            Request Access
          </Link>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="pt-24 pb-32 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-nw-accent/10 border border-nw-accent/20 text-nw-accent text-xs font-semibold uppercase tracking-wider mb-8"
          >
            <Sparkles size={14} />
            Invite Only Beta
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-display font-extrabold tracking-tight leading-tight max-w-4xl"
          >
            Stream the unseen. <br/>
            <span className="bg-gradient-to-r from-nw-accent via-nw-accent-glow to-purple-500 bg-clip-text text-transparent">
              Experience the wave.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 text-lg md:text-xl text-nw-text-secondary max-w-2xl leading-relaxed"
          >
            NullWave is an exclusive, invite-only music streaming platform designed for the ultimate auditory experience. No ads, just pure, uninterrupted music.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-12 flex flex-col sm:flex-row items-center gap-4"
          >
            <Link to="/req-access" className="group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-nw-accent hover:bg-nw-accent-hover text-white rounded-full font-bold transition-all glow-accent">
              Request Access
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="w-full sm:w-auto flex items-center justify-center px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full font-bold transition-all">
              Sign In to Account
            </Link>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-nw-surface/30 border-y border-white/5 px-6 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Crafted for Audiophiles</h2>
              <p className="text-nw-text-secondary max-w-2xl mx-auto">Everything you need to immerse yourself in sound, wrapped in a breathtaking interface.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-8 rounded-3xl bg-nw-surface/50 border border-nw-border hover:border-nw-accent/30 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-nw-accent/10 flex items-center justify-center mb-6">
                  <Play className="text-nw-accent" />
                </div>
                <h3 className="text-xl font-bold mb-3">Uninterrupted Playback</h3>
                <p className="text-nw-text-secondary leading-relaxed">Enjoy your favorite tracks without a single advertisement. Seamless, continuous listening.</p>
              </div>
              
              <div className="p-8 rounded-3xl bg-nw-surface/50 border border-nw-border hover:border-purple-500/30 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6">
                  <Music className="text-purple-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">Curated Playlists</h3>
                <p className="text-nw-text-secondary leading-relaxed">Build your library, share playlists, and discover new artists in a highly personalized ecosystem.</p>
              </div>

              <div className="p-8 rounded-3xl bg-nw-surface/50 border border-nw-border hover:border-green-500/30 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center mb-6">
                  <Lock className="text-green-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">Exclusive Access</h3>
                <p className="text-nw-text-secondary leading-relaxed">A tight-knit community of music lovers. Access is strictly by invite or admin approval.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Google Data Usage Section (Compliance) */}
        <section className="py-24 px-6 lg:px-12 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-6">
            <Shield size={32} className="text-nw-muted" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Data Privacy & Authentication</h2>
          <p className="text-nw-text-secondary leading-relaxed mb-8">
            NullWave integrates with Google OAuth to provide a secure, seamless login experience. We only request access to your basic profile (Name and Profile Picture) and Email address. This data is strictly used to create your secure NullWave identity and verify your invite status. We never sell or share your data with third parties.
          </p>
          <div className="flex justify-center gap-6">
            <Link to="/privacy" className="text-sm font-medium text-nw-accent hover:underline">Read Privacy Policy</Link>
            <Link to="/terms" className="text-sm font-medium text-nw-accent hover:underline">Read Terms of Service</Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 px-6 lg:px-12 text-center">
        <p className="text-xs text-nw-text-tertiary">
          &copy; {new Date().getFullYear()} Nullwave | By Atif Arman. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
