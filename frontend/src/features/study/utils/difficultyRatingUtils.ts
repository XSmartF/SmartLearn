/**
 * Utility functions for difficulty rating validation and state management
 */

import type { DifficultyMeta } from '../utils/learnEngine'
import type { ReviewDifficultyChoice } from '@/shared/lib/reviewScheduler'

/**
 * Validates if a difficulty rating is required based on card state
 */
export function validateRatingRequirement(difficultyMeta: DifficultyMeta | null): {
  isRequired: boolean
  isLocked: boolean
  hasExistingChoice: boolean
  canModify: boolean
} {
  if (!difficultyMeta) {
    return {
      isRequired: false,
      isLocked: false,
      hasExistingChoice: false,
      canModify: true
    }
  }

  const isRequired = difficultyMeta.shouldPrompt ?? false
  const hasExistingChoice = Boolean(difficultyMeta.lastChoice)
  const canModify = difficultyMeta.canAdjust ?? true
  const isLocked = !isRequired && !canModify

  return {
    isRequired,
    isLocked,
    hasExistingChoice,
    canModify
  }
}

/**
 * Gets the appropriate message for the current rating state
 */
export function getRatingStateMessage(
  validation: ReturnType<typeof validateRatingRequirement>,
  difficultyMeta: DifficultyMeta | null
): {
  type: 'warning' | 'success' | 'info' | null
  message: string
  showPreviousChoice: boolean
} {
  if (validation.isRequired) {
    return {
      type: 'info',
      message: 'SmartLearn gợi ý bạn tự đánh giá lại thẻ này để thuật toán hiểu chính xác cảm nhận của bạn. Bạn vẫn có thể bỏ qua và tiếp tục học.',
      showPreviousChoice: Boolean(difficultyMeta?.lastChoice)
    }
  }

  if (validation.hasExistingChoice) {
    if (!validation.canModify) {
      return {
        type: 'info',
        message: 'Đánh giá gần nhất của bạn đang được sử dụng. Hãy tiếp tục luyện tập, hệ thống sẽ hỏi lại sau một vài câu.',
        showPreviousChoice: true
      }
    }
    return {
      type: 'success',
      message: 'SmartLearn đã lưu mức độ bạn chọn. Bạn có thể cập nhật lại bất cứ lúc nào.',
      showPreviousChoice: false
    }
  }

  return {
    type: null,
    message: '',
    showPreviousChoice: false
  }
}

/**
 * Determines the visual styling class for the rating panel
 */
export function getRatingPanelStyling(
  validation: ReturnType<typeof validateRatingRequirement>,
  activeDifficultyChoice: ReviewDifficultyChoice | null
): string {
  const baseClasses = 'mt-4 rounded-xl border p-4 transition-all duration-200'
  
  if (validation.isRequired) {
    return `${baseClasses} border-info/50 bg-info/5 ring-1 ring-info/40`
  }
  
  if (activeDifficultyChoice) {
    return `${baseClasses} border-success/50 bg-success/5 ring-1 ring-success/30`
  }
  
  return `${baseClasses} border-border/40 bg-muted/10`
}

/**
 * Validates a difficulty choice submission
 */
export function validateDifficultySubmission(
  choice: ReviewDifficultyChoice,
  validation: ReturnType<typeof validateRatingRequirement>
): { isValid: boolean; reason?: string } {
  if (!validation.canModify && !validation.isRequired) {
    return {
      isValid: false,
      reason: 'Bạn vừa đánh giá thẻ này. Học thêm vài câu rồi hãy cập nhật lại nhé!'
    }
  }

  if (!choice || !['veryHard', 'hard', 'again', 'normal'].includes(choice)) {
    return {
      isValid: false,
      reason: 'Invalid difficulty choice'
    }
  }

  return { isValid: true }
}

/**
 * Debug utility to log rating state for troubleshooting
 */
export function debugRatingState(
  difficultyMeta: DifficultyMeta | null,
  activeDifficultyChoice: ReviewDifficultyChoice | null,
  submittingChoice: ReviewDifficultyChoice | null
): void {
  if (process.env.NODE_ENV !== 'development') return

  const validation = validateRatingRequirement(difficultyMeta)
  console.group('🎯 Difficulty Rating State Debug')
  console.log('📊 Difficulty Meta:', difficultyMeta)
  console.log('✅ Active Choice:', activeDifficultyChoice)
  console.log('⏳ Submitting:', submittingChoice)
  console.log('🔒 Validation:', validation)
  console.log('📝 State Message:', getRatingStateMessage(validation, difficultyMeta))
  console.groupEnd()
}