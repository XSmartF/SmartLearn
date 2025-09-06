import { Link } from "react-router-dom"
import { SmartImage } from '@/shared/components/ui/smart-image'
import { Button } from "@/shared/components/ui/button"

interface HeaderSectionProps {
  signInWithGoogle: (() => Promise<void>) | undefined;
  loading: boolean;
}

export default function HeaderSection({ signInWithGoogle, loading }: HeaderSectionProps) {
  return (
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
  )
}
