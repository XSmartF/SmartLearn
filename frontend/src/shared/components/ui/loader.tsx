import React from 'react'
import { cn } from '@/shared/lib/utils'
import './loader.css'

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

// Capybara animated loader
export const Loader: React.FC<LoaderProps> = ({ size = 'md', className, label = 'Đang tải' }) => {
  const scaleClass = {
    sm: 'scale-50',
    md: 'scale-75',
    lg: 'scale-100',
  }[size]

  return (
    <div className={cn('flex flex-col items-center gap-4', className)} role="status" aria-live="polite" aria-label={label}>
      <div className={cn('capybaraloader', scaleClass)}>
        <div className="capybara">
          <div className="capyhead">
            <div className="capyear">
              <div className="capyear2"></div>
            </div>
            <div className="capyear"></div>
            <div className="capymouth">
              <div className="capylips"></div>
              <div className="capylips"></div>
            </div>
            <div className="capyeye"></div>
            <div className="capyeye"></div>
          </div>
          <div className="capyleg"></div>
          <div className="capyleg2"></div>
          <div className="capyleg2"></div>
          <div className="capy"></div>
        </div>
        <div className="loader">
          <div className="loaderline"></div>
        </div>
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
