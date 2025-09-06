import { useState } from "react"
import { H3 } from '@/shared/components/ui/typography';
import { Card, CardContent } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Volume2,
  Star,
  X,
  Check,
  RotateCw
} from "lucide-react"

interface FlashCardData {
  id: string
  front: string
  back: string
  status: 'mastered' | 'learning' | 'difficult'
  difficulty: 'easy' | 'medium' | 'hard'
  reviewCount?: number
  lastReview?: string
}

interface FlashCardProps {
  cards: FlashCardData[]
  onCardUpdate?: (cardId: string, status: 'easy' | 'medium' | 'hard') => void
  onComplete?: () => void
}

export default function FlashCard({ cards, onCardUpdate, onComplete }: FlashCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)

  const currentCard = cards[currentIndex]

  if (!currentCard) {
    return (
      <div className="text-center py-8">
  <H3 className="text-lg font-semibold mb-2">Không có thẻ nào để học</H3>
        <p className="text-muted-foreground">Thêm thẻ mới để bắt đầu học</p>
      </div>
    )
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
    setShowAnswer(!showAnswer)
  }

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
      setShowAnswer(false)
    } else {
      onComplete?.()
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
      setShowAnswer(false)
    }
  }

  const handleDifficultySelect = (difficulty: 'easy' | 'medium' | 'hard') => {
    onCardUpdate?.(currentCard.id, difficulty)
    handleNext()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'mastered': return 'bg-green-500'
      case 'learning': return 'bg-yellow-500' 
      case 'difficult': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const progress = ((currentIndex + 1) / cards.length) * 100

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Tiến độ học</span>
          <span>{currentIndex + 1} / {cards.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Card Status */}
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getStatusColor(currentCard.status)}`} />
          {currentCard.status === 'mastered' ? 'Thành thạo' :
           currentCard.status === 'learning' ? 'Đang học' : 'Khó'}
        </Badge>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Volume2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Star className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Flash Card */}
      <div className="relative h-80">
        <Card 
          className={`absolute inset-0 cursor-pointer transition-all duration-700 transform-gpu ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          style={{ 
            transformStyle: 'preserve-3d',
            perspective: '1000px'
          }}
          onClick={handleFlip}
        >
          {/* Front Side */}
          <CardContent 
            className={`h-full flex items-center justify-center p-8 ${
              isFlipped ? 'opacity-0' : 'opacity-100'
            }`}
            style={{ 
              backfaceVisibility: 'hidden',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }}
          >
            <div className="text-center space-y-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                Câu hỏi
              </div>
              <div className="text-2xl font-semibold">
                {currentCard.front}
              </div>
              <div className="text-sm text-muted-foreground">
                Nhấn để xem câu trả lời
              </div>
            </div>
          </CardContent>

          {/* Back Side */}
          <CardContent 
            className={`absolute inset-0 h-full flex items-center justify-center p-8 bg-blue-50 ${
              isFlipped ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ 
              backfaceVisibility: 'hidden',
              transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(-180deg)'
            }}
          >
            <div className="text-center space-y-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                Câu trả lời
              </div>
              <div className="text-2xl font-semibold text-blue-700">
                {currentCard.back}
              </div>
              <div className="text-sm text-muted-foreground">
                Nhấn để lật lại thẻ
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flip Indicator */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-sm">
          <RotateCw className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Trước
        </Button>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleFlip}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <Button 
          variant="outline" 
          onClick={handleNext}
          disabled={currentIndex === cards.length - 1}
        >
          Sau
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Answer Difficulty (Only show when flipped) */}
      {isFlipped && (
        <div className="space-y-3">
          <div className="text-center text-sm text-muted-foreground">
            Độ khó của thẻ này đối với bạn?
          </div>
          <div className="flex justify-center gap-3">
            <Button 
              variant="outline" 
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => handleDifficultySelect('hard')}
            >
              <X className="h-4 w-4 mr-2" />
              Khó
            </Button>
            <Button 
              variant="outline" 
              className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
              onClick={() => handleDifficultySelect('medium')}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Bình thường
            </Button>
            <Button 
              variant="outline" 
              className="text-green-600 border-green-200 hover:bg-green-50"
              onClick={() => handleDifficultySelect('easy')}
            >
              <Check className="h-4 w-4 mr-2" />
              Dễ
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
