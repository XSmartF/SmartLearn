import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { H3 } from '@/shared/components/ui/typography'
import { StudyBreadcrumb } from './StudyBreadcrumb'

interface StudyErrorProps {
  error: string
}

export function StudyError({ error }: StudyErrorProps) {
  return (
    <div className='space-y-6'>
      <StudyBreadcrumb />
      <Card className='max-w-xl mx-auto'>
        <CardContent className='py-12 text-center space-y-4'>
          <H3 className='font-semibold'>Lỗi tải dữ liệu</H3>
          <p className='text-muted-foreground'>{error}</p>
          <Button onClick={() => window.location.reload()}>Thử lại</Button>
        </CardContent>
      </Card>
    </div>
  )
}
