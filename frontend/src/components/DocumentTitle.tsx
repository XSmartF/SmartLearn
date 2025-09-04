import { useEffect } from 'react'
import { useMatches, type UIMatch } from 'react-router-dom'

// Component dùng để cập nhật document.title theo route hiện tại
export default function DocumentTitle() {
  const matches = useMatches() as UIMatch<object, { breadcrumb?: string | ((ctx: { params: Record<string,string> }) => string) }>[]

  useEffect(() => {
    let pageTitle: string | undefined
    for (const m of matches) {
      const handle = m.handle
      if (handle?.breadcrumb) {
        try {
          const value = typeof handle.breadcrumb === 'function'
            ? handle.breadcrumb({ params: m.params as Record<string,string> })
            : handle.breadcrumb
          if (value) pageTitle = value
        } catch {
          /* ignore */
        }
      }
    }
    document.title = pageTitle ? `${pageTitle} | SmartLearn` : 'SmartLearn'
  }, [matches])

  return null
}
