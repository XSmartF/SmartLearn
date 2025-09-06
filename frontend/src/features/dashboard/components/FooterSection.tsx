import { Link } from "react-router-dom"

export default function FooterSection() {
  return (
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
            <h3 className="font-semibold mb-4">Sản phẩm</h3>
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
            <h3 className="font-semibold mb-4">Hỗ trợ</h3>
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
            <h3 className="font-semibold mb-4">Công ty</h3>
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
  )
}
