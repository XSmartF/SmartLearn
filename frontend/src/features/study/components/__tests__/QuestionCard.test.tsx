import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { QuestionCard } from '../QuestionCard'
import type { Question, LearnEngine as LearnEngineType, Card as LearnCard, DifficultyMeta } from '../../utils/learnEngine'
import type { ReviewDifficultyChoice } from '@/shared/lib/reviewScheduler'

// Mock dependencies
const mockEngine = {
  serialize: vi.fn(() => ({ asked: 0 })),
  getCardState: vi.fn(() => ({ mastery: 3, wrongCount: 1 }))
} as unknown as LearnEngineType

const mockCards: LearnCard[] = [
  { id: '1', front: 'Hello', back: 'Xin chào', domain: 'english' }
]

const mockQuestion: Question = {
  mode: 'MULTIPLE_CHOICE',
  cardId: '1',
  prompt: 'What is "Hello" in Vietnamese?',
  options: ['Xin chào', 'Tạm biệt', 'Cảm ơn', 'Xin lỗi']
}

const mockDifficultyChoices = [
  { value: 'veryHard' as ReviewDifficultyChoice, label: 'Rất khó', description: 'Tôi không biết gì về thẻ này' },
  { value: 'hard' as ReviewDifficultyChoice, label: 'Khó', description: 'Tôi cần xem lại nhiều lần' },
  { value: 'again' as ReviewDifficultyChoice, label: 'Lại', description: 'Tôi sẽ nhớ lần sau' },
  { value: 'normal' as ReviewDifficultyChoice, label: 'Bình thường', description: 'Tôi đã nhớ tốt' }
]

const defaultProps = {
  currentQuestion: mockQuestion,
  engine: mockEngine,
  cards: mockCards,
  userAnswer: '',
  setUserAnswer: vi.fn(),
  showResult: false,
  lastResult: null,
  selectedOptionIndex: null,
  correctOptionIndex: null,
  autoAdvance: false,
  readLanguage: 'vi-VN',
  speakQuestion: vi.fn(),
  handleAnswer: vi.fn(),
  handleNext: vi.fn(),
  answerSide: 'back' as const,
  difficultyChoices: mockDifficultyChoices,
  onDifficultyChoice: vi.fn(),
  submittingChoice: null
}

describe('QuestionCard Difficulty Rating', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should show cooldown panel when already rated and no re-rating required', () => {
    const difficultyMeta: DifficultyMeta = {
      shouldPrompt: false,
      wrongCount: 1,
      wrongStreak: 1,
      mastery: 3,
      lastChoice: 'hard',
      canAdjust: false
    }

  render(<QuestionCard {...defaultProps} difficultyMeta={difficultyMeta} />)

  // Rating buttons should be hidden while locked
  expect(screen.queryByRole('button', { name: /^Khó/ })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /^Bình thường/ })).not.toBeInTheDocument()

    // Should show cooldown message and previous choice reminder
    expect(
      screen.getByText('Đánh giá gần nhất của bạn đang được sử dụng. Hãy tiếp tục luyện tập, hệ thống sẽ hỏi lại sau một vài câu.')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Đánh giá gần nhất của bạn đang được lưu. Thuật toán vẫn tự điều chỉnh lộ trình cho thẻ này.')
    ).toBeInTheDocument()
    expect(screen.getByText(/Lần đánh giá gần nhất của bạn: Khó/)).toBeInTheDocument()
    expect(screen.getByText('Mức hiện tại: Khó')).toBeInTheDocument()

    // Success message should not appear while locked
    expect(
      screen.queryByText('SmartLearn đã lưu mức độ bạn chọn. Bạn có thể cập nhật lại bất cứ lúc nào.')
    ).not.toBeInTheDocument()
  })

  test('should unlock rating buttons when re-rating is required', () => {
    const difficultyMeta: DifficultyMeta = {
      shouldPrompt: true,
      wrongCount: 4,
      wrongStreak: 4,
      mastery: 1,
      lastChoice: 'hard',
      canAdjust: true
    }

    render(<QuestionCard {...defaultProps} difficultyMeta={difficultyMeta} />)

    // All buttons should be enabled when re-rating required
      const hardButton = screen.getByRole('button', { name: /^Khó/ })
      const normalButton = screen.getByRole('button', { name: /^Bình thường/ })
    
    expect(hardButton).not.toBeDisabled()
    expect(normalButton).not.toBeDisabled()

    // Should show prompt message
    expect(
      screen.getByText('SmartLearn gợi ý bạn tự đánh giá lại thẻ này để thuật toán hiểu chính xác cảm nhận của bạn. Bạn vẫn có thể bỏ qua và tiếp tục học.')
    ).toBeInTheDocument()
    
    // Should show previous choice
    expect(screen.getByText(/Lần đánh giá gần nhất của bạn: Khó/)).toBeInTheDocument()

    // Should not show locked message
    expect(screen.queryByText('Bạn chỉ có thể thay đổi mức độ khi hệ thống yêu cầu đánh giá lại.')).not.toBeInTheDocument()
  })

  test('should call onDifficultyChoice when rating button clicked and not locked', () => {
    const onDifficultyChoice = vi.fn()
    const difficultyMeta: DifficultyMeta = {
      shouldPrompt: true,
      wrongCount: 4,
      wrongStreak: 4,
      mastery: 1,
      lastChoice: 'hard',
      canAdjust: true
    }

    render(<QuestionCard {...defaultProps} difficultyMeta={difficultyMeta} onDifficultyChoice={onDifficultyChoice} />)

      const normalButton = screen.getByRole('button', { name: /^Bình thường/ })
    fireEvent.click(normalButton!)

    expect(onDifficultyChoice).toHaveBeenCalledWith('normal')
  })

  test('should hide rating controls while locked', () => {
    const onDifficultyChoice = vi.fn()
    const difficultyMeta: DifficultyMeta = {
      shouldPrompt: false,
      wrongCount: 1,
      wrongStreak: 0,
      mastery: 3,
      lastChoice: 'normal',
      canAdjust: false
    }

    render(<QuestionCard {...defaultProps} difficultyMeta={difficultyMeta} onDifficultyChoice={onDifficultyChoice} />)

    expect(screen.queryByRole('button', { name: /^Rất khó/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Khó/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Lại/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Bình thường/ })).not.toBeInTheDocument()
    expect(onDifficultyChoice).not.toHaveBeenCalled()
  })

  test('should show appropriate styling for different states', () => {
    const { rerender } = render(<QuestionCard {...defaultProps} difficultyMeta={{
      shouldPrompt: true,
      wrongCount: 4,
      wrongStreak: 4,
      mastery: 1,
      canAdjust: true
    }} />)

    // Required state should show warning styling
    const ratingPanel = document.querySelector('div.mt-4.rounded-xl.border')
    expect(ratingPanel?.className).toContain('border-info/50')

    // Completed state should show success styling
    rerender(<QuestionCard {...defaultProps} difficultyMeta={{
      shouldPrompt: false,
      wrongCount: 1,
      wrongStreak: 0,
      mastery: 3,
      lastChoice: 'normal',
      canAdjust: true
    }} />)

    const successPanel = document.querySelector('div.mt-4.rounded-xl.border')
    expect(successPanel?.className).toContain('border-success/50')
  })

  test('should handle submitting state correctly', () => {
    const difficultyMeta: DifficultyMeta = {
      shouldPrompt: true,
      wrongCount: 4,
      wrongStreak: 4,
      mastery: 1,
      canAdjust: true
    }

    render(<QuestionCard {...defaultProps} difficultyMeta={difficultyMeta} submittingChoice="hard" />)

    // Submitting button should show loading text
    expect(screen.getByText('Đang lưu...')).toBeInTheDocument()

    // Other buttons should be disabled during submission
      const normalButton = screen.getByRole('button', { name: /^Bình thường/ })
    expect(normalButton).toBeDisabled()
  })
})

describe('QuestionCard Integration', () => {
  test('should maintain rating state consistency across question changes', async () => {
    const difficultyMeta: DifficultyMeta = {
      shouldPrompt: false,
      wrongCount: 1,
      wrongStreak: 0,
      mastery: 3,
      lastChoice: 'normal',
      canAdjust: false
    }

    const { rerender } = render(<QuestionCard {...defaultProps} difficultyMeta={difficultyMeta} />)

  // Should hide controls initially
  expect(screen.queryByRole('button', { name: /^Bình thường/ })).not.toBeInTheDocument()

  // Change to different question but same card
    const newQuestion: Question = {
      ...mockQuestion,
      prompt: 'Different prompt for same card'
    }

    rerender(<QuestionCard {...defaultProps} currentQuestion={newQuestion} difficultyMeta={difficultyMeta} />)

  // Should remain locked for same card
  expect(screen.queryByRole('button', { name: /^Bình thường/ })).not.toBeInTheDocument()
  })

  test('should handle edge case when no previous rating exists', () => {
    const difficultyMeta: DifficultyMeta = {
      shouldPrompt: false,
      wrongCount: 0,
      wrongStreak: 0,
      mastery: 2,
      canAdjust: true
    }

    render(<QuestionCard {...defaultProps} difficultyMeta={difficultyMeta} />)

    // Should not be locked when no previous choice
  const normalButton = screen.getByRole('button', { name: /^Bình thường/ })
    expect(normalButton).not.toBeDisabled()

    // Should not show cooldown message when there is no previous choice
    expect(
      screen.queryByText('Đánh giá gần nhất của bạn đang được sử dụng. Hãy tiếp tục luyện tập, hệ thống sẽ hỏi lại sau một vài câu.')
    ).not.toBeInTheDocument()
  })
})