import { Card, CardContent } from '@/shared/components/ui/card'
import { Loader } from '@/shared/components/ui/loader'

export function StudyLoading() {
  return (
    <div className='min-h-screen bg-background flex items-center justify-center p-4'>
      <Card className="w-full max-w-md shadow-lg border-0 bg-card/95 backdrop-blur-sm">
        <CardContent className="p-8 text-center space-y-6">
          <Loader size="lg" label="Đang tải dữ liệu" />

          <div className="space-y-3">
            <p className='text-muted-foreground'>
              Vui lòng đợi trong giây lát
            </p>
          </div>

          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
