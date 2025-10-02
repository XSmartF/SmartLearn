import { Link } from 'react-router-dom'
import { SmartImage } from '@/shared/components/ui/smart-image'
import { Sparkles } from 'lucide-react'

interface BrandProps { to?: string; className?: string }

export function Brand({ to = '/', className = '' }: BrandProps) {
  return (
    <Link 
      to={to} 
      className={`group flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-sidebar-accent/50 transition-all duration-300 ${className}`}
    >
      <div className="relative">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[var(--neu-shadow-sm)] group-hover:shadow-[var(--neu-shadow)] transition-all duration-300 group-hover:scale-105">
          <SmartImage 
            src="/smartlearn.svg" 
            alt="SmartLearn" 
            className="h-6 w-6 brightness-0 invert" 
            rounded 
          />
        </div>
        <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-success animate-pulse-soft" />
      </div>
      <div className="flex flex-col">
        <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          SmartLearn
        </span>
        <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
          <Sparkles className="h-2.5 w-2.5" />
          Học thông minh hơn
        </span>
      </div>
    </Link>
  )
}
