import { useParams, useSearchParams } from 'react-router-dom'
import { Alert, AlertTitle } from '@/shared/components/ui/alert'
import { Loader } from '@/shared/components/ui/loader'
import { useStudySession } from '@/features/study/hooks/useStudySession'
import {
  StudyHeader,
  QuestionCard,
  CardProgressCard,
  StatsCard,
  StudyLoading,
  StudyError,
  StudyFinished
} from '../components'

export default function StudyPage() {
  const { id } = useParams<{ id: string }>();
  const libraryId = id ?? '';
  const [searchParams] = useSearchParams();
  const isReviewSession = searchParams.get('mode') === 'review';

  const session = useStudySession({ libraryId, isReviewSession });

  if (session.status === 'loading') {
    return <StudyLoading />;
  }

  if (session.status === 'error' || !session.library) {
    return <StudyError error={session.errorMessage ?? 'Không tải được dữ liệu học tập'} />;
  }

  if (session.status === 'finished' && session.finished) {
    return <StudyFinished {...session.finished} />;
  }

  if (!session.questionCard) {
    return (
      <div className='py-12 flex items-center justify-center'>
        <Loader label="Đang khởi tạo" />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background'>
      {session.header && <StudyHeader {...session.header} />}
      <div className='container mx-auto px-4 py-6 space-y-6 lg:space-y-8'>
        {session.reviewContext && (
          <Alert className='border-primary bg-primary/10'>
            <AlertTitle className='text-primary flex items-center gap-2'>
              🔁 Phiên ôn tập
            </AlertTitle>
            <div className='mt-2 text-sm text-primary/80'>
              Đang ôn {session.reviewContext.cardIds.length} thẻ đã chọn từ trang ôn tập.
            </div>
            {session.reviewContext.missingCount > 0 && (
              <div className='mt-1 text-xs text-primary/70'>
                {session.reviewContext.missingCount} thẻ không tìm thấy và đã bị bỏ qua.
              </div>
            )}
          </Alert>
        )}

        <div className='space-y-6 lg:space-y-8'>
          <QuestionCard {...session.questionCard} />

          {session.cardProgress && (
            <CardProgressCard
              engine={session.cardProgress.engine}
              showCardAnswers={session.cardProgress.showCardAnswers}
              setShowCardAnswers={session.cardProgress.setShowCardAnswers}
            />
          )}

          {session.stats && (
            <StatsCard engine={session.stats.engine} progress={session.stats.progress} />
          )}
        </div>
      </div>
    </div>
  );
}
