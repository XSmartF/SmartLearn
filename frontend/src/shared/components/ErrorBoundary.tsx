import React from 'react'
import { useRouteError, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { AlertTriangle, Home, RotateCcw } from 'lucide-react'

interface RouteError {
  status?: number
  statusText?: string
  message?: string
}

export function ErrorBoundary() {
  const error = useRouteError()
  
  console.error('Route Error:', error)

  const getErrorMessage = () => {
    if (error instanceof Error) {
      return error.message
    }
    if (typeof error === 'string') {
      return error
    }
    if (error && typeof error === 'object') {
      const routeError = error as RouteError
      return routeError.statusText || routeError.message || 'Unknown error'
    }
    return 'Đã xảy ra lỗi không mong muốn'
  }

  const getErrorStatus = () => {
    if (error && typeof error === 'object') {
      const routeError = error as RouteError
      return routeError.status
    }
    return null
  }

  const handleReload = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-xl">
            {getErrorStatus() ? `Lỗi ${getErrorStatus()}` : 'Đã xảy ra lỗi'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-muted-foreground">
            <p className="mb-2">{getErrorMessage()}</p>
            <p className="text-sm">
              Chúng tôi xin lỗi vì sự bất tiện này. Vui lòng thử lại hoặc quay về trang chủ.
            </p>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button onClick={handleReload} className="w-full">
              <RotateCcw className="w-4 h-4 mr-2" />
              Tải lại trang
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link to="/dashboard">
                <Home className="w-4 h-4 mr-2" />
                Về trang chủ
              </Link>
            </Button>
          </div>
          
          {process.env.NODE_ENV === 'development' && error instanceof Error && (
            <details className="mt-4 p-2 bg-gray-100 rounded text-xs">
              <summary className="cursor-pointer font-medium">Chi tiết lỗi (Development)</summary>
              <pre className="mt-2 whitespace-pre-wrap">{error.stack}</pre>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Component ErrorBoundary class-based để bắt lỗi trong component children
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ComponentErrorBoundary extends React.Component<
  React.PropsWithChildren,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Component Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-xl">Component Error</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-muted-foreground">
                <p className="mb-2">
                  {this.state.error?.message || 'Đã xảy ra lỗi trong component'}
                </p>
                <p className="text-sm">
                  Vui lòng tải lại trang hoặc liên hệ với nhà phát triển.
                </p>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button onClick={() => window.location.reload()} className="w-full">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Tải lại trang
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/dashboard">
                    <Home className="w-4 h-4 mr-2" />
                    Về trang chủ
                  </Link>
                </Button>
              </div>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 p-2 bg-gray-100 rounded text-xs">
                  <summary className="cursor-pointer font-medium">Chi tiết lỗi (Development)</summary>
                  <pre className="mt-2 whitespace-pre-wrap">{this.state.error.stack}</pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
