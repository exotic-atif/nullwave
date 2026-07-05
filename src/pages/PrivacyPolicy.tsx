import { motion } from 'framer-motion'
import { Shield, Lock, Database, ArrowLeft } from 'lucide-react'
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
              Welcome to NullWave ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy applies to all information collected through our application, website, and related services (collectively, the "Services").
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
            <div className="flex items-center gap-3 text-nw-accent">
              <Database size={24} />
              <h2 className="text-xl font-bold text-white">Google, GitHub, and Facebook OAuth Data Usage</h2>
            </div>
            <div className="text-nw-text-secondary leading-relaxed space-y-4 ml-9">
              <p>
                Our application utilizes Google, GitHub, and Facebook (Meta) OAuth for secure authentication and identity linking. When you choose to log in or link your account via these providers, we access specific data in accordance with their respective API Services User Data Policies:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-white">1. Data Collected:</strong> We collect your email address, name (or display name), and profile picture URL. We do not access your contacts, private messages, or any other sensitive information.
                </li>
                <li>
                  <strong className="text-white">2. Data Usage:</strong> Your social data is strictly used to create your nullwave account identity, verify your email, and personalize your profile. We do not use this data for targeted advertising.
                </li>
                <li>
                  <strong className="text-white">3. Data Storage & Protection:</strong> Your data is securely stored in our encrypted database. We do not sell, rent, or trade your data to third parties.
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-nw-accent">
              <Lock size={24} />
              <h2 className="text-xl font-bold text-white">Your Rights & Data Deletion</h2>
            </div>
            <div className="text-nw-text-secondary leading-relaxed space-y-4 ml-9">
              <p>
                You have the right to request access to the personal data we hold about you, request corrections, or request complete deletion of your account and data. You can revoke our access to your connected accounts at any time through your respective Google, GitHub, or Facebook Account Security Settings.
              </p>
              <p>
                <strong className="text-white">Account Unlinking & Deletion Requests:</strong> If you wish to unlink a specific third-party account (like Facebook) or request full deletion of all your data stored on NullWave, please visit our <Link to="/data-deletion" className="text-nw-accent hover:underline">Data Deletion</Link> page or email us directly with your registered email and username.
              </p>
            </div>
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
