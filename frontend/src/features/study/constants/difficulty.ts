import type { ReviewDifficultyChoice } from '@/shared/lib/reviewScheduler'

export type DifficultyChoiceDescriptor = {
  value: ReviewDifficultyChoice
  label: string
  description: string
}

export const STUDY_DIFFICULTY_CHOICES: DifficultyChoiceDescriptor[] = [
  { value: 'veryHard', label: 'Rất khó', description: 'Gặp nhiều lỗi liên tiếp - cần ôn ngay.' },
  { value: 'hard', label: 'Khó', description: 'Vẫn còn bối rối, cần hỏi lại sớm.' },
  { value: 'again', label: 'Ôn lại', description: 'Để ôn trong ngày hôm nay.' },
  { value: 'normal', label: 'Đã nhớ', description: 'Đưa thẻ về lịch ôn tiêu chuẩn.' }
]
