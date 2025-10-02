import { Outlet } from 'react-router-dom'

export default function DefaultLayout() {
  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="mx-auto w-full lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
