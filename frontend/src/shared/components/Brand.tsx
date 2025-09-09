import { Link } from 'react-router-dom'
import { SmartImage } from '@/shared/components/ui/smart-image'
import { motion } from 'framer-motion'

interface BrandProps { to?: string; className?: string }

export function Brand({ to = '/', className = '' }: BrandProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Link to={to} className={`flex items-center gap-2 font-semibold text-lg text-slate-800 dark:text-slate-100 hover:text-primary transition-colors duration-200 ${className}`}>
        <SmartImage src="/smartlearn.svg" alt="SmartLearn" className="h-6 w-6" rounded />
        <span>SmartLearn</span>
      </Link>
    </motion.div>
  )
}
