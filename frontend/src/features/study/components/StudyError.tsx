import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { H3 } from '@/shared/components/ui/typography'

interface StudyErrorProps {
  error: string
}

export function StudyError({ error }: StudyErrorProps) {
  return (
    <div className='space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto'>
      <Card className='w-full max-w-xl mx-auto'>
        <CardContent className='py-12 text-center space-y-4'>
          <H3 className='text-xl sm:text-2xl font-semibold'>Lỗi tải dữ liệu</H3>
          <p className='text-muted-foreground'>{error}</p>
          <Button onClick={() => window.location.reload()}>Thử lại</Button>
        </CardContent>
      </Card>
    </div>
  )
}
