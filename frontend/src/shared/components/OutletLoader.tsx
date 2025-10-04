import { useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigation } from 'react-router-dom'
import { cn } from '@/shared/lib/utils'
import { Loader } from '@/shared/components/ui/loader'

interface OutletLoaderProps {
  className?: string
}

export function OutletLoader({ className }: OutletLoaderProps) {
  const location = useLocation()
  const navigation = useNavigation()
  const [isRouteTransitioning, setRouteTransitioning] = useState(false)

  useEffect(() => {
    setRouteTransitioning(true)
    const timeout = window.setTimeout(() => setRouteTransitioning(false), 240)
    return () => window.clearTimeout(timeout)
  }, [location.key])

  const isLoading = useMemo(
    () => navigation.state === 'loading' || navigation.state === 'submitting' || isRouteTransitioning,
    [navigation.state, isRouteTransitioning],
  )

  return (
    <div className={cn('relative', className)} aria-busy={isLoading}>
      <div className={cn('transition-opacity duration-200', isLoading ? 'opacity-70' : 'opacity-100')}>
        <Outlet />
      </div>
      <div
        className={cn(
          'absolute inset-0 flex justify-center transition-all duration-200',
          isLoading ? 'opacity-100 pointer-events-auto' : 'pointer-events-none opacity-0'
        )}
        aria-hidden={!isLoading}
      >
        <div className="absolute inset-0 bg-background/95" aria-hidden="true" />
        <div className="relative z-10 mt-20 flex w-full justify-center sm:mt-28">
          <Loader size="md" label="Đang tải nội dung" />
        </div>
      </div>
    </div>
  )
}
