import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { SmartImage } from '@/shared/components/ui/smart-image'
import { ArrowRight, Play } from "lucide-react"

interface HeroSectionProps {
  signInWithGoogle: (() => Promise<void>) | undefined;
  loading: boolean;
}

export default function HeroSection({ signInWithGoogle, loading }: HeroSectionProps) {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">Nền tảng học tập #1 Việt Nam</Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight text-balance">
                Nền tảng học tập cá nhân hóa
                <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  SmartLearn
                </span>
              </h1>
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
                <span className="text-yellow-400">⭐</span>
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
  )
}
