import { useEffect, useState } from 'react'

/**
 * Lightweight media-query hook that mirrors Tailwind's breakpoint logic.
 * Falls back to `false` during SSR to avoid hydration mismatches.
 */
export function useMediaQuery(query: string): boolean {
  const getMatches = () => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false)

  const [matches, setMatches] = useState<boolean>(getMatches)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mql = window.matchMedia(query)

    const handleChange = (event: MediaQueryListEvent) => setMatches(event.matches)

    // Update immediately in case the first render happened before hydration
    setMatches(mql.matches)
    mql.addEventListener('change', handleChange)
    return () => mql.removeEventListener('change', handleChange)
  }, [query])

  return matches
}
