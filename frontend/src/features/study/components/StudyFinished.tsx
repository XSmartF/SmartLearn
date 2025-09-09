import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Trophy, RotateCcw, Home } from 'lucide-react'

interface StudyFinishedProps {
  handleFinish: () => void
  handleResetSession: () => void
}

export function StudyFinished({ handleFinish, handleResetSession }: StudyFinishedProps) {
  return (
    <div className='min-h-screen bg-background flex items-center justify-center p-4'>
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
        <CardContent className="p-8 text-center space-y-8">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
            <Trophy className="h-12 w-12 text-white" />
          </div>

          <div className="space-y-3">
            <h2 className='text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent'>
              Hoàn thành!
            </h2>
            <p className='text-muted-foreground text-lg'>
              Bạn đã hoàn thành phiên học tập này
            </p>
          </div>

          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Button
              onClick={handleFinish}
              size="lg"
              className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
            >
              <Home className="h-5 w-5 mr-2" />
              Quay lại thư viện
            </Button>
            <Button
              variant='outline'
              onClick={handleResetSession}
              size="lg"
              className="h-12 px-8 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Học lại từ đầu
            </Button>
          </div>

          <div className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            🎉 Chúc mừng! Tiếp tục học tập để củng cố kiến thức của bạn.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
