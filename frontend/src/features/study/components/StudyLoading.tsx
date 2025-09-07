import { BookOpen } from 'lucide-react'
import { H3 } from '@/shared/components/ui/typography'

export function StudyLoading() {
  return (
    <div className='space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto'>
      <div className='text-center py-12'>
        <BookOpen className='mx-auto h-16 w-16 text-muted-foreground mb-4'/>
        <H3 className='text-2xl sm:text-3xl font-semibold mb-2'>Đang tải dữ liệu...</H3>
      </div>
    </div>
  )
}
