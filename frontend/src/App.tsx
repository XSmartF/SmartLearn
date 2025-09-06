import './App.css'
import { Suspense, useEffect } from 'react'
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom'
import { ErrorBoundary, ComponentErrorBoundary } from './shared/components/ErrorBoundary'
import { useAuth } from './shared/hooks/useAuthRedux'
import { FullScreenLoader } from '@/shared/components/ui/loader'
import { ROUTES } from './shared/constants/routes'

// AuthGuard bọc các route cần đăng nhập và cung cấp Outlet để render con
const AuthGuard: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader message="Đang kiểm tra đăng nhập" size="lg" />;
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />;
  return <Outlet />; // quan trọng: phải có Outlet để render các route con
};

// Định nghĩa router với handle để tạo breadcrumb động (tiếng Việt)
const router = createBrowserRouter([
  // Route login
  {
    path: ROUTES.LOGIN,
    lazy: async () => {
      const mod = await import('./features/auth/pages/AuthPage')
      return { Component: mod.default }
    },
    errorElement: <ErrorBoundary />,
    handle: { breadcrumb: 'Đăng nhập' }
  },
  // Main app routes
  {
    path: ROUTES.HOME,
    lazy: async () => {
      const mod = await import('./shared/layouts/RootLayout')
      return { Component: mod.default }
    },
    errorElement: <ErrorBoundary />,
    handle: { breadcrumb: 'Trang chủ' },
    children: [
      {
        path: ROUTES.HOME,
        element: <AuthGuard />, // AuthGuard tự render <Outlet />
        children: [
          {
            path: '',
            lazy: async () => {
              const mod = await import('./shared/layouts/DashboardLayout')
              return { Component: mod.default }
            },
            handle: { breadcrumb: 'Bảng điều khiển' },
            children: [
          {
            index: true,
            lazy: async () => {
              const mod = await import('./features/dashboard/pages/DashboardPage')
              return { Component: mod.default }
            },
            errorElement: <ErrorBoundary />,
            handle: { breadcrumb: 'Tổng quan' }
          },
          {
            path: ROUTES.MY_LIBRARY,
            lazy: async () => {
              const mod = await import('./features/library/pages/MyLibrary')
              return { Component: mod.default }
            },
            errorElement: <ErrorBoundary />,
            handle: { breadcrumb: 'Thư viện của tôi' }
          },
          {
            path: ROUTES.LIBRARY_DETAIL,
            lazy: async () => {
              const mod = await import('./features/library/pages/LibraryDetail')
              return { Component: mod.default }
            },
            errorElement: <ErrorBoundary />,
            // Loader để lấy tiêu đề thư viện cho breadcrumb
            loader: async ({ params }) => {
              if (!params.id) return null
              try {
                const { libraryRepository } = await import('@/shared/lib/repositories/LibraryRepository')
        const meta = await libraryRepository.getLibraryMeta(params.id)
        return { library: meta }
              } catch {
        return { library: null }
              }
            },
      handle: { breadcrumb: (match: { params: Record<string,string>; data?: { library?: { title?: string|null } | null } }) => match.data?.library?.title || `Thư viện #${match.params.id}` }
          },
          {
            path: ROUTES.STUDY,
            lazy: async () => {
              const mod = await import('./features/study/pages/StudyPage')
              return { Component: mod.default }
            },
            errorElement: <ErrorBoundary />,
            handle: { breadcrumb: 'Học tập' }
          },
          {
            path: ROUTES.TEST_SETUP,
            lazy: async () => {
              const mod = await import('./features/test/pages/TestSetup')
              return { Component: mod.default }
            },
            errorElement: <ErrorBoundary />,
            handle: { breadcrumb: 'Chuẩn bị kiểm tra' }
          },
          {
            path: ROUTES.TEST,
            lazy: async () => {
              const mod = await import('./features/test/pages/Test')
              return { Component: mod.default }
            },
            errorElement: <ErrorBoundary />,
            handle: { breadcrumb: 'Làm kiểm tra' }
          },
          {
            path: ROUTES.NOTIFICATIONS,
            lazy: async () => {
              const mod = await import('./features/notification/pages/Notifications')
              return { Component: mod.default }
            },
            errorElement: <ErrorBoundary />,
            handle: { breadcrumb: 'Thông báo' }
          },
          {
            path: ROUTES.CALENDAR,
            lazy: async () => {
              const mod = await import('./features/study/pages/CalendarPage')
              return { Component: mod.default }
            },
            errorElement: <ErrorBoundary />,
            handle: { breadcrumb: 'Lịch' }
          },
          {
            path: ROUTES.SETTINGS,
            lazy: async () => {
              const mod = await import('./features/dashboard/pages/Settings')
              return { Component: mod.default }
            },
            errorElement: <ErrorBoundary />,
            handle: { breadcrumb: 'Cài đặt' }
          },
          {
            path: ROUTES.PROFILE,
            lazy: async () => {
              const mod = await import('./features/dashboard/pages/Profile')
              return { Component: mod.default }
            },
            errorElement: <ErrorBoundary />,
            handle: { breadcrumb: 'Hồ sơ' }
          },
          {
            path: ROUTES.TEST_ERROR,
            lazy: async () => {
              const mod = await import('./features/test/pages/TestError')
              return { Component: mod.default }
            },
            errorElement: <ErrorBoundary />,
            handle: { breadcrumb: 'Trang lỗi thử nghiệm' }
          },
          // Giữ route cũ để tương thích
          {
            path: ROUTES.OLD_DASHBOARD,
            lazy: async () => {
              const mod = await import('./features/dashboard/pages/DashboardPage')
              return { Component: mod.default }
            },
            errorElement: <ErrorBoundary />,
            handle: { breadcrumb: 'Phiên bản cũ' }
          }
            ]
          }
        ]
      }
    ]
  },
  // Route 404
  {
    path: ROUTES.NOT_FOUND,
    lazy: async () => {
      const mod = await import('./shared/pages/NotFound')
      return { Component: mod.default }
    },
    errorElement: <ErrorBoundary />,
    handle: { breadcrumb: 'Không tìm thấy' }
  }
])

function App() {
  // Idle prefetch of learn engine only (test generator prefetched in TestSetup page now)
  useEffect(() => {
    const prefetchLearn = () => { import('@/features/study/utils/learnEngine').catch(()=>{}) }
    interface WIdle { requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number }
    const w = window as unknown as WIdle
    if (typeof w.requestIdleCallback === 'function') w.requestIdleCallback(prefetchLearn, { timeout: 3000 })
    else setTimeout(prefetchLearn, 2000)
  }, [])

  return (
      <ComponentErrorBoundary>
        <Suspense fallback={<FullScreenLoader message="Đang tải nội dung" size="lg" /> }>
          <RouterProvider router={router} />
        </Suspense>
      </ComponentErrorBoundary>
  )
}

export default App
