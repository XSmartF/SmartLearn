import { ThemeProvider } from 'next-themes'
import { Outlet } from 'react-router-dom'

export default function RootLayout() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen">
        <Outlet />
      </div>
    </ThemeProvider>
  )
}
