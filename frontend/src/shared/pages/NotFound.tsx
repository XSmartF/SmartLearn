import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm sm:max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-muted rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl sm:text-2xl">404 - Không tìm thấy trang</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-muted-foreground">
            <p className="mb-2 text-sm sm:text-base">
              Xin lỗi, trang bạn đang tìm kiếm không tồn tại.
            </p>
            <p className="text-xs sm:text-sm">
              Có thể đường dẫn đã bị thay đổi hoặc bạn đã nhập sai địa chỉ.
            </p>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link to="/dashboard">
                <Home className="w-4 h-4 mr-2" />
                Về trang chủ
              </Link>
            </Button>
            <Button variant="outline" onClick={() => window.history.back()} className="w-full">
              Quay lại trang trước
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
