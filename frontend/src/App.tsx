import './App.css'
import { Suspense } from 'react'
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider } from './components/AuthProvider'
import { ErrorBoundary, ComponentErrorBoundary } from './components/ErrorBoundary'
import { useAuth } from './components/authContext'

// Helper: tạo lazy route nhanh
const lazyLayout = (path: string) => async () => {
  const mod = await import(/* @vite-ignore */ path)
  return { Component: mod.default }
}
const lazyPage = (path: string) => async () => {
  const mod = await import(/* @vite-ignore */ path)
  return { Component: mod.default }
}

// AuthGuard bọc các route cần đăng nhập và cung cấp Outlet để render con
const AuthGuard: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-4 text-sm">Đang kiểm tra đăng nhập...</div>;
  if (!user) return <Navigate to="/" replace />;
  return <Outlet />; // quan trọng: phải có Outlet để render các route con
};

// Định nghĩa router với handle để tạo breadcrumb động (tiếng Việt)
const router = createBrowserRouter([
  // Removed separate login/register pages (Google one-click only)
  {
    path: "/",
    lazy: lazyLayout('./layouts/RootLayout'),
    errorElement: <ErrorBoundary />,
    handle: { breadcrumb: 'Trang chủ' },
    children: [
      {
        path: "/",
        lazy: lazyLayout('./layouts/DefaultLayout'),
        errorElement: <ErrorBoundary />,
        handle: { breadcrumb: 'Trang chủ' },
        children: [
          {
            index: true,
            lazy: lazyPage('./pages/Home'),
            errorElement: <ErrorBoundary />,
            handle: { breadcrumb: 'Trang chủ' }
          }
        ]
      },
      {
        path: "/dashboard",
        element: <AuthGuard />, // AuthGuard tự render <Outlet />
        children: [
          {
            path: '',
            lazy: lazyLayout('./layouts/DashboardLayout'),
            handle: { breadcrumb: 'Bảng điều khiển' },
            children: [
          {
            index: true,
            lazy: lazyPage('./pages/DashboardHome'),
            errorElement: <ErrorBoundary />,
            handle: { breadcrumb: 'Tổng quan' }
          },
          {
            path: "my-library",
            lazy: lazyPage('./pages/MyLibrary'),
            errorElement: <ErrorBoundary />,
            handle: { breadcrumb: 'Thư viện của tôi' }
          },
          {
            path: "library/:id",
            lazy: lazyPage('./pages/LibraryDetail'),
            errorElement: <ErrorBoundary />,
            // Có thể cập nhật bằng tiêu đề thư viện thực tế nếu dùng loader
            handle: { breadcrumb: (match: { params: Record<string, string> }) => `Thư viện #${match.params.id}` }
          },
          {
            path: "study/:id",
            lazy: lazyPage('./pages/StudyPage'),
            errorElement: <ErrorBoundary />,
            handle: { breadcrumb: 'Học tập' }
          },
          {
            path: "test-setup/:id",
            lazy: lazyPage('./pages/TestSetup'),
            errorElement: <ErrorBoundary />,
            handle: { breadcrumb: 'Chuẩn bị kiểm tra' }
          },
          {
            path: "test/:id",
            lazy: lazyPage('./pages/Test'),
            errorElement: <ErrorBoundary />,
            handle: { breadcrumb: 'Làm kiểm tra' }
          },
          {
            path: "notifications",
            lazy: lazyPage('./pages/Notifications'),
            errorElement: <ErrorBoundary />,
            handle: { breadcrumb: 'Thông báo' }
          },
          {
            path: "calendar",
            lazy: lazyPage('./pages/CalendarPage'),
            errorElement: <ErrorBoundary />,
            handle: { breadcrumb: 'Lịch' }
          },
          {
            path: "settings",
            lazy: lazyPage('./pages/Settings'),
            errorElement: <ErrorBoundary />,
            handle: { breadcrumb: 'Cài đặt' }
          },
          {
            path: "profile",
            lazy: lazyPage('./pages/Profile'),
            errorElement: <ErrorBoundary />,
            handle: { breadcrumb: 'Hồ sơ' }
          },
          {
            path: "test-error",
            lazy: lazyPage('./pages/TestError'),
            errorElement: <ErrorBoundary />,
            handle: { breadcrumb: 'Trang lỗi thử nghiệm' }
          },
          // Giữ route cũ để tương thích
          {
            path: "old",
            lazy: lazyPage('./pages/Dashboard'),
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
    path: "*",
    lazy: lazyPage('./pages/NotFound'),
    errorElement: <ErrorBoundary />,
    handle: { breadcrumb: 'Không tìm thấy' }
  }
])

function App() {
  return (
    <AuthProvider>
      <ComponentErrorBoundary>
        <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Đang tải...</div>}>
          <RouterProvider router={router} />
        </Suspense>
      </ComponentErrorBoundary>
    </AuthProvider>
  )
}

export default App
