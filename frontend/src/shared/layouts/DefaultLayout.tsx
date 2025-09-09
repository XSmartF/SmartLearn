import { Outlet } from 'react-router-dom'

export default function DefaultLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Outlet />
    </div>
  )
}
