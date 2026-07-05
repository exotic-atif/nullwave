import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, Trash2, Mail, ShieldAlert } from 'lucide-react'

export function DataDeletion() {
  return (
    <div className="min-h-[100dvh] bg-nw-black text-white relative overflow-x-hidden flex flex-col items-center p-4 sm:p-8 py-12">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-nw-accent/20 via-nw-black to-nw-black pointer-events-none opacity-50" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl relative z-10 my-auto"
      >
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-nw-text-secondary hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <div className="bg-[#121212] border border-white/5 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <Trash2 size={28} className="text-red-400" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-white mb-1">Data Deletion Request</h1>
              <p className="text-sm text-nw-text-tertiary">Threads API & Account Unlinking</p>
            </div>
          </div>

          <div className="space-y-6 text-nw-text-secondary leading-relaxed text-sm">
            <p>
              At <strong className="text-white">NullWave</strong>, we take your privacy and data sovereignty seriously. If you have linked your Threads or other third-party accounts, you have the right to request the unlinking of these accounts and the deletion of your associated data at any time.
            </p>

            <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-6">
              <h3 className="text-white font-semibold flex items-center gap-2 mb-3">
                <ShieldAlert size={18} className="text-amber-500" />
                How to request deletion
              </h3>
              <p className="mb-4">
                To request the deletion of your NullWave account data, or to unlink your Threads profile, please send an email to our support and development team.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center p-4 bg-black/40 rounded-xl border border-white/5">
                <Mail className="text-nw-accent shrink-0 hidden sm:block" size={24} />
                <div>
                  <p className="text-xs text-nw-text-tertiary uppercase tracking-wider mb-1">Email us at</p>
                  <a href="mailto:mratif00007@gmail.com?subject=Data%20Deletion%20Request" className="text-white font-medium hover:text-nw-accent transition-colors text-lg">
                    mratif00007@gmail.com
                  </a>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-white font-medium">Please include the following in your email:</h4>
              <ul className="list-disc list-inside space-y-1.5 text-nw-text-tertiary ml-2">
                <li>Your registered NullWave email address.</li>
                <li>Your Threads username (if requesting Threads unlinking).</li>
                <li>Whether you want a complete account deletion or just third-party unlinking.</li>
              </ul>
            </div>

            <p className="text-xs text-nw-text-tertiary mt-8 border-t border-white/5 pt-6">
              We process all data deletion requests within 7 business days. You will receive a confirmation email once your data has been permanently removed from our servers.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
