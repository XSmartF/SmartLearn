import { Loader2 } from 'lucide-react'
import { H3 } from '@/shared/components/ui/typography'
import { Card, CardContent } from '@/shared/components/ui/card'

export function StudyLoading() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4'>
      <Card className="w-full max-w-md shadow-lg border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
        <CardContent className="p-8 text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center">
            <Loader2 className="h-10 w-10 text-blue-600 dark:text-blue-400 animate-spin" />
          </div>

          <div className="space-y-3">
            <H3 className='text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
              Đang tải dữ liệu...
            </H3>
            <p className='text-muted-foreground'>
              Vui lòng đợi trong giây lát
            </p>
          </div>

          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
