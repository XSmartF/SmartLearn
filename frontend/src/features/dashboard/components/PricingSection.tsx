import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Check } from "lucide-react"

interface PricingSectionProps {
  signInWithGoogle: (() => Promise<void>) | undefined;
  loading: boolean;
}

export default function PricingSection({ signInWithGoogle, loading }: PricingSectionProps) {
  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Chọn gói phù hợp với bạn</h2>
          <p className="text-xl text-gray-600">Bắt đầu miễn phí, nâng cấp khi cần thêm tính năng</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="border-2 border-gray-200 hover:border-blue-300 transition-colors">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold">Miễn phí</CardTitle>
              <div className="text-4xl font-bold text-gray-900 mt-4">
                0đ<span className="text-lg font-normal text-gray-600">/tháng</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Tạo flashcard không giới hạn</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>4 chế độ học cơ bản</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Truy cập thư viện công cộng</span>
                </li>
              </ul>
              <Button className="w-full mt-6" variant="outline" onClick={() => signInWithGoogle && signInWithGoogle()} disabled={loading}>
                {loading ? 'Đang kiểm tra...' : 'Đăng nhập với Google'}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-500 relative hover:border-blue-600 transition-colors">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-blue-500 text-white px-4 py-1">Phổ biến nhất</Badge>
            </div>
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold">SmartLearn Plus</CardTitle>
              <div className="text-4xl font-bold text-gray-900 mt-4">
                99.000đ<span className="text-lg font-normal text-gray-600">/tháng</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Tất cả tính năng miễn phí</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Học không quảng cáo</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Tải hình ảnh và âm thanh</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Chế độ học nâng cao</span>
                </li>
              </ul>
              <Button className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                Nâng cấp ngay
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 hover:border-purple-300 transition-colors">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold">Giáo viên</CardTitle>
              <div className="text-4xl font-bold text-gray-900 mt-4">
                199.000đ<span className="text-lg font-normal text-gray-600">/tháng</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Tất cả tính năng Plus</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Tạo lớp học không giới hạn</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Theo dõi tiến độ học sinh</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Báo cáo chi tiết</span>
                </li>
              </ul>
              <Button className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                Dùng thử 7 ngày
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
