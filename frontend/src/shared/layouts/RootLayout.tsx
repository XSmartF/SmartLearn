import DocumentTitle from '@/shared/components/DocumentTitle'
import { ThemeProvider } from 'next-themes'
import { Outlet } from 'react-router-dom'

export default function RootLayout() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen">
        <DocumentTitle />
        <Outlet />
      </div>
    </ThemeProvider>
  )
}
