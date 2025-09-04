import { useEffect } from 'react'
import { useTheme } from 'next-themes'
import { idbGetItem, idbSetItem } from '@/lib/indexedDB'

const THEME_KEY = 'ui:theme'

export function usePersistentTheme() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  // Load persisted theme on first mount
  useEffect(() => {
    let active = true
    idbGetItem<string>(THEME_KEY).then(stored => {
      if (active && stored && stored !== theme) {
        setTheme(stored)
      }
    })
    return () => { active = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Persist whenever user changes theme (skip system fallback)
  useEffect(() => {
    if (theme) {
      idbSetItem(THEME_KEY, theme)
    }
  }, [theme])

  return { theme, setTheme, resolvedTheme }
}
