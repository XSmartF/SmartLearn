import { Link } from 'react-router-dom'
import { SmartImage } from '@/components/ui/smart-image'

interface BrandProps { to?: string; className?: string }

export function Brand({ to = '/', className = '' }: BrandProps) {
  return (
    <Link to={to} className={`flex items-center gap-2 font-semibold text-lg text-slate-800 dark:text-slate-100 ${className}`}>
      <SmartImage src="/smartlearn.svg" alt="SmartLearn" className="h-6 w-6" rounded />
      <span>SmartLearn</span>
    </Link>
  )
}
