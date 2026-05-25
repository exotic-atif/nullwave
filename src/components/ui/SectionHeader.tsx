import { motion } from 'framer-motion'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-end justify-between mb-5"
    >
      <div>
        <h2 className="text-xl md:text-2xl font-display font-bold text-nw-text tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-nw-text-tertiary mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </motion.div>
  )
}
