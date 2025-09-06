"use client"

import { useEffect } from "react"
import { H1, H2, H3 } from '@/shared/components/ui/typography';
import { SmartImage } from '@/shared/components/ui/smart-image'
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Star, Users, BookOpen, Trophy, ArrowRight, Check, Play, Globe, Smartphone, Brain } from "lucide-react"
import { useAuth } from "@/shared/hooks/useAuthRedux"
import { useNavigate, Link } from "react-router-dom"
export default function LandingPage() {
  const { user, signInWithGoogle, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) navigate('/dashboard')
  }, [user, loading, navigate])

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2 group">
              <SmartImage src="/smartlearn.svg" className="w-8 h-8" alt="SmartLearn" rounded />
              <span className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">SmartLearn</span>
            </Link>


            <div className="flex items-center space-x-4">
              <Button
                onClick={() => signInWithGoogle && signInWithGoogle()}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                disabled={loading}
              >
                {loading ? 'Đang kiểm tra...' : 'Đăng nhập với Google'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">Nền tảng học tập #1 Việt Nam</Badge>
                <H1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight text-balance">
                  Nền tảng học tập cá nhân hóa
                  <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    SmartLearn
                  </span>
                </H1>
                <p className="text-xl text-gray-600 leading-relaxed text-pretty">
                  Tạo flashcard, luyện kiểm tra, theo dõi tiến độ với AI thích ứng. Cải thiện mỗi ngày và đạt mục tiêu học nhanh hơn cùng SmartLearn.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg"
                  onClick={() => signInWithGoogle && signInWithGoogle()}
                  disabled={loading}
                >
                  {loading ? 'Đang kiểm tra...' : 'Đăng nhập với Google'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-4 text-lg border-gray-300 hover:border-blue-300 bg-transparent"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Xem demo
                </Button>
              </div>

              <div className="flex items-center space-x-8 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    <SmartImage src="/vietnamese-student-girl.png" alt="User" className="w-8 h-8 border-2 border-white" rounded="rounded-full" />
                    <SmartImage src="/vietnamese-office-worker-man.jpg" alt="User" className="w-8 h-8 border-2 border-white" rounded="rounded-full" />
                    <SmartImage src="/vietnamese-teacher-woman.jpg" alt="User" className="w-8 h-8 border-2 border-white" rounded="rounded-full" />
                  </div>
                  <span>60M+ học sinh</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>4.8/5 đánh giá</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10">
                <SmartImage
                  src="/modern-vietnamese-learning-app-interface-mockup.jpg"
                  alt="SmartLearn App Interface"
                  className="w-full h-auto rounded-2xl shadow-2xl"
                  rounded
                />
              </div>
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full blur-3xl opacity-20"></div>
              <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full blur-3xl opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <H2 className="text-3xl lg:text-4xl font-bold text-gray-900">Vì sao chọn SmartLearn?</H2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Các công cụ học tập được thiết kế để giúp bạn ghi nhớ lâu hơn và học hiệu quả hơn
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold">Flashcard thông minh</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600">
                  Tạo và học với flashcard tương tác. AI sẽ giúp bạn tập trung vào những từ khó nhất.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold">Học thích ứng</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600">
                  Hệ thống AI điều chỉnh độ khó theo khả năng của bạn để tối ưu hóa việc học.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold">Học nhóm</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600">
                  Tạo lớp học, chia sẻ tài liệu và theo dõi tiến độ của cả nhóm.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold">Học mọi lúc mọi nơi</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600">
                  Đồng bộ trên tất cả thiết bị. Học offline khi không có mạng.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold">Theo dõi tiến độ</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600">
                  Xem báo cáo chi tiết về quá trình học và những điểm cần cải thiện.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold">Thư viện khổng lồ</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600">
                  Truy cập hàng triệu bộ học liệu được tạo bởi cộng đồng trên toàn thế giới.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>


      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <H2 className="text-3xl lg:text-4xl font-bold text-gray-900">Chọn gói phù hợp với bạn</H2>
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

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <H2 className="text-3xl lg:text-4xl font-bold text-white">Sẵn sàng bắt đầu hành trình học tập?</H2>
            <p className="text-xl text-blue-100">
              Tham gia cộng đồng học tập sử dụng SmartLearn để tăng tốc ghi nhớ và làm chủ kiến thức.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg" onClick={() => signInWithGoogle && signInWithGoogle()} disabled={loading}>
                {loading ? 'Đang kiểm tra...' : 'Đăng nhập với Google'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg bg-transparent"
              >
                Tìm hiểu thêm
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">Q</span>
                </div>
                <span className="text-xl font-bold">SmartLearn</span>
              </div>
              <p className="text-gray-400">
                Nền tảng học tập cá nhân hóa giúp bạn xây dựng thói quen và tiến bộ bền vững.
              </p>
            </div>

            <div>
              <H3 className="font-semibold mb-4">Sản phẩm</H3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    Flashcard
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    Kiểm tra
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    Lớp học
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    Ứng dụng di động
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <H3 className="font-semibold mb-4">Hỗ trợ</H3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    Trung tâm trợ giúp
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    Liên hệ
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    Cộng đồng
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <H3 className="font-semibold mb-4">Công ty</H3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    Về chúng tôi
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    Tuyển dụng
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    Báo chí
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    Điều khoản
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 SmartLearn. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
