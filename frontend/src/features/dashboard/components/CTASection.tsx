import { Button } from "@/shared/components/ui/button"
import { ArrowRight } from "lucide-react"

interface CTASectionProps {
  signInWithGoogle: (() => Promise<void>) | undefined;
  loading: boolean;
}

export default function CTASection({ signInWithGoogle, loading }: CTASectionProps) {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white">Sẵn sàng bắt đầu hành trình học tập?</h2>
          <p className="text-xl text-blue-100">
            Tham gia cộng đồng học tập sử dụng SmartLearn để tăng tốc ghi nhớ và đạt mục tiêu học nhanh hơn.
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
  )
}
