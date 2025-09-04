import React from 'react'
import { cn } from '@/lib/utils'

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

// Core animated spinner (gradient ring + pulsing center + orbiting dots)
export const Loader: React.FC<LoaderProps> = ({ size = 'md', className, label = 'Đang tải' }) => {
  const dimension = {
    sm: 'size-8',
    md: 'size-14',
    lg: 'size-20',
  }[size]

  return (
    <div className={cn('flex flex-col items-center gap-4', className)} role="status" aria-live="polite" aria-label={label}>
      <div className={cn('relative', dimension)}>
        {/* Rotating gradient ring */}
        <div
          className={cn(
            'absolute inset-0 rounded-full border-[3px] border-transparent',
            'before:content-["""] before:absolute before:inset-0 before:rounded-full',
            'before:bg-conic-gradient(from_0deg,#6366f1,#8b5cf6,#ec4899,#6366f1)',
            'before:animate-spin before:[animation-duration:2.4s]',
            'before:mask border-current'
          )}
          style={{ WebkitMask: 'radial-gradient(circle,transparent 55%,#000 56%)' }}
        />
        {/* Inner subtle glow circle */}
        <div className="absolute inset-[18%] rounded-full bg-gradient-to-br from-primary/70 via-primary/30 to-transparent blur-[1px]" />
        {/* Center dot */}
        <div className="absolute inset-[35%] rounded-full bg-primary shadow-[0_0_8px_2px_theme(colors.primary/40)] animate-pulse" />
        {/* Orbiting dots */}
        {[0,1,2].map(i => (
          <div
            key={i}
            className={cn(
              'absolute top-1/2 left-1/2 size-2 -mt-1 -ml-1 rounded-full bg-primary/70 shadow-[0_0_4px_1px_theme(colors.primary/40)]',
              'animate-[spin_3s_linear_infinite]',
              'origin-[0_-130%]'
            )}
            style={{ animationDelay: `${i * 0.3}s` }}
          />
        ))}
      </div>
      <div className="flex flex-col items-center gap-1 text-xs font-medium text-muted-foreground">
        <span className="tracking-wide uppercase">
          {label}
          <span className="inline-flex animate-bounce [animation-duration:1.4s] [animation-delay:0.1s]">.</span>
          <span className="inline-flex animate-bounce [animation-duration:1.4s] [animation-delay:0.25s]">.</span>
          <span className="inline-flex animate-bounce [animation-duration:1.4s] [animation-delay:0.4s]">.</span>
        </span>
        <span className="text-[10px] tracking-wider text-muted-foreground/60">SmartLearn</span>
      </div>
      <span className="sr-only">{label}...</span>
    </div>
  )
}

interface FullScreenLoaderProps extends LoaderProps {
  message?: string
}

export const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({ message = 'Đang tải dữ liệu', size='lg', ...rest }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm">
      <Loader size={size} label={message} {...rest} />
      <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-flex h-2 w-2 animate-ping rounded-full bg-primary/60" />
        <span>Tối ưu trải nghiệm học tập...</span>
      </div>
    </div>
  )
}

export default Loader
