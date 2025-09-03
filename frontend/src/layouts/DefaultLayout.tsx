import { Outlet } from 'react-router-dom'

export default function DefaultLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Outlet />
    </div>
  )
}
