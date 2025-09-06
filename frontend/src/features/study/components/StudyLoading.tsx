import { BookOpen } from 'lucide-react'
import { H3 } from '@/shared/components/ui/typography'
import { StudyBreadcrumb } from './StudyBreadcrumb'

export function StudyLoading() {
  return (
    <div className='space-y-6'>
      <StudyBreadcrumb />
      <div className='text-center py-12'>
        <BookOpen className='mx-auto h-16 w-16 text-muted-foreground mb-4'/>
        <H3 className='text-2xl font-semibold mb-2'>Đang tải dữ liệu...</H3>
      </div>
    </div>
  )
}
