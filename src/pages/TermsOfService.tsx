import { motion } from 'framer-motion'
import { FileText, UserCheck, AlertTriangle, HelpCircle } from 'lucide-react'

export function TermsOfService() {
  return (
    <div className="min-h-screen bg-nw-bg text-nw-text font-sans p-6 lg:p-12 pb-24 lg:pb-12 max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="space-y-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Terms of Service
          </h1>
          <p className="text-sm text-nw-muted">Last Updated: July 4, 2026</p>
        </div>

        <div className="p-6 md:p-8 rounded-3xl bg-nw-surface border border-nw-border space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-nw-accent">
              <FileText size={24} />
              <h2 className="text-xl font-bold text-white">Agreement to Terms</h2>
            </div>
            <p className="text-nw-text-secondary leading-relaxed">
              By accessing or using nullwave ("the Application"), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the Application.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-orange-400">
              <UserCheck size={24} />
              <h2 className="text-xl font-bold text-white">User Accounts & Authentication</h2>
            </div>
            <p className="text-nw-text-secondary leading-relaxed">
              When you create an account with us, whether manually or via third-party authentication like Google OAuth, you guarantee that the information you provide is accurate and current.
            </p>
            <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
              <p className="text-nw-text-secondary text-sm">
                <strong className="text-white">Account Security:</strong> You are responsible for safeguarding your login credentials and for any activities or actions under your account.
              </p>
              <p className="text-nw-text-secondary text-sm">
                <strong className="text-white">Google Account Integration:</strong> By connecting your Google account, you authorize us to access your basic profile information to establish your nullwave identity.
              </p>
              <p className="text-nw-text-secondary text-sm">
                <strong className="text-white">Invite-Only Access:</strong> nullwave operates on an invite-only/approval basis. Creating an account or requesting access does not guarantee immediate entry to the Application.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle size={24} />
              <h2 className="text-xl font-bold text-white">Acceptable Use</h2>
            </div>
            <p className="text-nw-text-secondary leading-relaxed">
              You agree not to use the Application for any unlawful purpose or in any way that interrupts, damages, or impairs the service. We reserve the right to suspend or terminate your account immediately, without prior notice or liability, for any reason, including without limitation if you breach the Terms.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-blue-400">
              <HelpCircle size={24} />
              <h2 className="text-xl font-bold text-white">Changes to Terms</h2>
            </div>
            <p className="text-nw-text-secondary leading-relaxed">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Application after those revisions become effective, you agree to be bound by the revised terms.
            </p>
          </section>

          <section className="space-y-4 border-t border-white/10 pt-8">
            <h2 className="text-xl font-bold text-white">Contact Us</h2>
            <p className="text-nw-text-secondary leading-relaxed">
              If you have any questions about these Terms, please contact us at:
              <br />
              <a href="mailto:mratif00007@gmail.com" className="text-nw-accent hover:underline font-bold mt-2 inline-block">
                mratif00007@gmail.com
              </a>
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  )
}
