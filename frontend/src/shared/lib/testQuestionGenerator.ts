// Dynamically loaded test question generator to reduce initial Test route bundle size.
// It encapsulates question construction logic formerly inline in Test page.

export type TestQuestionType = 'multiple-choice' | 'true-false' | 'fill-blank'

export interface TestConfigLite {
  libraryId: string
  questionTypes: TestQuestionType[]
  questionCount: number
  timeLimit: number | null
  showAnswerImmediately: boolean
  selectedCardIds: string[] | null
}

export interface CardLite {
  id: string
  front: string
  back: string
}

export interface GeneratedQuestion {
  id: number
  type: TestQuestionType
  question: string
  options?: string[]
  correctAnswer: string
}

export function generateQuestions(config: TestConfigLite, cards: CardLite[]): GeneratedQuestion[] {
  const pool = config.selectedCardIds && config.selectedCardIds.length
    ? cards.filter(c => config.selectedCardIds!.includes(c.id))
    : cards
  const shuffledPool = [...pool].sort(() => Math.random() - 0.5)
  const need = config.questionCount
  const baseCards = shuffledPool.slice(0, Math.min(need, shuffledPool.length))
  const questions: GeneratedQuestion[] = []
  for (let i = 0; i < need; i++) {
    const card = baseCards[i % baseCards.length]
    const qType = config.questionTypes[i % config.questionTypes.length]
    if (qType === 'multiple-choice') {
      const wrongOptions = cards.filter(c => c.id !== card.id).sort(() => Math.random() - 0.5).slice(0, 3).map(c => c.back)
      const opts = [card.back, ...wrongOptions].sort(() => Math.random() - 0.5)
      questions.push({ id: i, type: qType, question: card.front, correctAnswer: card.back, options: opts })
    } else if (qType === 'true-false') {
      const showCorrect = Math.random() < 0.5 || cards.length < 2
      let shownAnswer = card.back
      if (!showCorrect) {
        const other = cards.filter(c => c.id !== card.id)
        if (other.length) shownAnswer = other[Math.floor(Math.random() * other.length)].back
      }
      const statement = `${card.front} = ${shownAnswer}`
      questions.push({ id: i, type: qType, question: statement, correctAnswer: showCorrect ? 'Đúng' : 'Sai', options: ['Đúng', 'Sai'] })
    } else { // fill-blank
      questions.push({ id: i, type: qType, question: card.front, correctAnswer: card.back })
    }
  }
  return questions
}
