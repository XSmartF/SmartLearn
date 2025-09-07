import { Button } from '@/shared/components/ui/button'

interface StudyFinishedProps {
  handleFinish: () => void
  handleResetSession: () => void
}

export function StudyFinished({ handleFinish, handleResetSession }: StudyFinishedProps) {
  return (
    <div className='space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto'>
      {/* simplified finished view omitted for brevity */}
      <div className='text-center py-12 space-y-4'>
        <h2 className='text-2xl sm:text-3xl font-bold'>Hoàn thành phiên học!</h2>
        <div className='flex flex-col sm:flex-row justify-center gap-4'>
          <Button onClick={handleFinish}>Quay lại thư viện</Button>
          <Button variant='outline' onClick={handleResetSession}>Học lại từ đầu</Button>
        </div>
      </div>
    </div>
  )
}
