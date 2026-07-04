import { motion } from 'framer-motion'
import { Shield, Lock, Eye, Database, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export function PrivacyPolicy() {
  return (
    <div className="h-screen overflow-y-auto bg-nw-bg text-nw-text font-sans">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-12 pb-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <Link to="/login" className="inline-flex items-center gap-2 text-nw-muted hover:text-white transition-colors mb-4 text-sm font-medium">
              <ArrowLeft size={16} />
              Back to Login
            </Link>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Privacy Policy
            </h1>
            <p className="text-sm text-nw-muted">Last Updated: July 4, 2026</p>
          </div>

          <div className="p-5 sm:p-8 rounded-3xl bg-nw-surface border border-nw-border space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-nw-accent">
              <Shield size={24} />
              <h2 className="text-xl font-bold text-white">Introduction</h2>
            </div>
            <p className="text-nw-text-secondary leading-relaxed">
              Welcome to nullwave ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy applies to all information collected through our application, website, and related services (collectively, the "Services").
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-purple-400">
              <Database size={24} />
              <h2 className="text-xl font-bold text-white">Information We Collect</h2>
            </div>
            <p className="text-nw-text-secondary leading-relaxed">
              We collect personal information that you voluntarily provide to us when you register on the Services. The personal information that we collect depends on the context of your interactions with us and the Services. 
            </p>
            <ul className="list-disc list-inside text-nw-text-secondary space-y-2 ml-4">
              <li><strong>Personal Data:</strong> Names, email addresses, and profile pictures.</li>
              <li><strong>Usage Data:</strong> Music preferences, playlists, and interaction history.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-blue-400">
              <Lock size={24} />
              <h2 className="text-xl font-bold text-white">Google OAuth Data Usage</h2>
            </div>
            <p className="text-nw-text-secondary leading-relaxed">
              Our application utilizes Google OAuth for secure authentication. When you choose to log in or link your account via Google, we access specific data in accordance with Google's API Services User Data Policy:
            </p>
            <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
              <p className="text-nw-text-secondary text-sm">
                <strong className="text-white">1. Data Accessed:</strong> We only request the minimum required scopes—specifically your basic profile information (Name and Profile Picture) and your primary email address.
              </p>
              <p className="text-nw-text-secondary text-sm">
                <strong className="text-white">2. Data Usage:</strong> Your Google data is strictly used to create your nullwave account identity, verify your email, and personalize your profile. We do not use this data for targeted advertising.
              </p>
              <p className="text-nw-text-secondary text-sm">
                <strong className="text-white">3. Data Storage & Protection:</strong> Your Google data is securely stored in our encrypted database. We do not sell, rent, or trade your Google data to third parties.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-green-400">
              <Eye size={24} />
              <h2 className="text-xl font-bold text-white">Your Rights & Choices</h2>
            </div>
            <p className="text-nw-text-secondary leading-relaxed">
              You have the right to request access to the personal data we hold about you, request corrections, or request deletion of your account. You can completely revoke our access to your Google account at any time through your Google Account Security Settings.
            </p>
          </section>

          <section className="space-y-4 border-t border-white/10 pt-8">
            <h2 className="text-xl font-bold text-white">Contact Us</h2>
            <p className="text-nw-text-secondary leading-relaxed">
              If you have questions or comments about this Privacy Policy, you may email us at:
              <br />
              <a href="mailto:mratif00007@gmail.com" className="text-nw-accent hover:underline font-bold mt-2 inline-block">
                mratif00007@gmail.com
              </a>
            </p>
          </section>
        </div>
      </motion.div>
      </div>
    </div>
  )
}
