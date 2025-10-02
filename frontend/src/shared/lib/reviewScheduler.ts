import { getFirebaseAuth } from './firebaseClient'
import { queueSetDoc } from './firestoreQueue'
import type { StudyEvent } from '@/features/study/types/calendar'

export type ReviewDifficultyChoice = 'veryHard' | 'hard' | 'again' | 'normal'

interface ScheduleParams {
  cardId: string
  libraryId: string
  cardFront: string
  cardBack?: string
  libraryTitle?: string
  choice: ReviewDifficultyChoice
}

interface ReminderParams {
  cardId: string
}

type ChoiceConfig = {
  label: string
  offsetMinutes: number
  durationMinutes: number
  note: string
}

const CHOICE_CONFIG: Record<ReviewDifficultyChoice, ChoiceConfig> = {
  veryHard: {
    label: 'Rất khó',
    offsetMinutes: 7,
    durationMinutes: 15,
    note: 'Ôn ngay sau khi bạn đánh giá cực khó.'
  },
  hard: {
    label: 'Khó',
    offsetMinutes: 45,
    durationMinutes: 20,
    note: 'Lặp lại trong cùng buổi học để củng cố.'
  },
  again: {
    label: 'Ôn lại',
    offsetMinutes: 12 * 60,
    durationMinutes: 25,
    note: 'Đặt lịch lại trong ngày để xem bạn còn nhớ không.'
  },
  normal: {
    label: 'Bình thường',
    offsetMinutes: 3 * 24 * 60,
    durationMinutes: 30,
    note: 'Đưa thẻ về lịch ôn tiêu chuẩn.'
  }
}

const pendingSchedules = new Map<string, number>()

function ensureUserId(): string | null {
  const user = getFirebaseAuth().currentUser
  return user ? user.uid : null
}

function buildDocId(userId: string, cardId: string) {
  return `${userId}__review__${cardId}`
}

function buildTitle(front: string) {
  const trimmed = front.trim().replace(/\s+/g, ' ')
  return trimmed.length > 60 ? `${trimmed.slice(0, 57)}…` : trimmed
}

export function scheduleAutoReview(params: ScheduleParams) {
  const userId = ensureUserId()
  if (!userId) return

  const config = CHOICE_CONFIG[params.choice]
  const now = Date.now()
  const start = new Date(now + config.offsetMinutes * 60_000)
  const end = new Date(start.getTime() + config.durationMinutes * 60_000)
  const docId = buildDocId(userId, params.cardId)

  const startMs = start.getTime()
  const existing = pendingSchedules.get(docId)
  if (existing && Math.abs(existing - startMs) < 60_000) {
    return
  }
  pendingSchedules.set(docId, startMs)

  const eventData: Partial<StudyEvent> & {
    userId: string
    cardId: string
    libraryId: string
    title: string
    description: string
    startTime: Date
    endTime: Date
    type: 'review'
    flashcardSet: string
    cardCount: number
    status: StudyEvent['status']
    autoScheduled: true
    lastChoice: ReviewDifficultyChoice
    createdAt: unknown
    updatedAt: unknown
  } = {
    userId,
    cardId: params.cardId,
    libraryId: params.libraryId,
    title: `Ôn lại: ${buildTitle(params.cardFront)}`,
    description: `${config.note}${params.cardBack ? `\nĐáp án: ${params.cardBack}` : ''}`,
    startTime: start,
    endTime: end,
    type: 'review',
    flashcardSet: params.libraryTitle || params.libraryId,
    cardCount: 1,
    status: start.getTime() < now ? 'overdue' : 'upcoming',
    autoScheduled: true,
    lastChoice: params.choice,
    createdAt: '__SERVER_TIMESTAMP__',
    updatedAt: '__SERVER_TIMESTAMP__'
  }

  queueSetDoc(`calendar_events/${docId}`, eventData, true)
}

export function markReviewRemembered({ cardId }: ReminderParams) {
  const userId = ensureUserId()
  if (!userId) return
  const docId = buildDocId(userId, cardId)
  pendingSchedules.delete(docId)

  queueSetDoc(
    `calendar_events/${docId}`,
    {
      status: 'completed',
      updatedAt: '__SERVER_TIMESTAMP__',
      completedAt: '__SERVER_TIMESTAMP__'
    },
    true
  )
}

export function clearPendingReview({ cardId }: ReminderParams) {
  const userId = ensureUserId()
  if (!userId) return
  const docId = buildDocId(userId, cardId)
  pendingSchedules.delete(docId)

  queueSetDoc(
    `calendar_events/${docId}`,
    {
      status: 'upcoming',
      updatedAt: '__SERVER_TIMESTAMP__'
    },
    true
  )
}
