import { Button } from '@/shared/components/ui/button'
import { StudyBreadcrumb } from './StudyBreadcrumb'

interface StudyFinishedProps {
  handleFinish: () => void
  handleResetSession: () => void
}

export function StudyFinished({ handleFinish, handleResetSession }: StudyFinishedProps) {
  return (
    <div className='space-y-6'>
      <StudyBreadcrumb />
      {/* simplified finished view omitted for brevity */}
      <div className='text-center py-12 space-y-4'>
        <h2 className='text-2xl font-bold'>Hoàn thành phiên học!</h2>
        <div className='space-x-4'>
          <Button onClick={handleFinish}>Quay lại thư viện</Button>
          <Button variant='outline' onClick={handleResetSession}>Học lại từ đầu</Button>
        </div>
      </div>
    </div>
  )
}
