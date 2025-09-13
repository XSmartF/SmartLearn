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
  readLanguage?: string
}

export default function FlashCard({ cards, onCardUpdate, onComplete, readLanguage = 'en-US' }: FlashCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  const currentCard = cards[currentIndex]

  const speakQuestion = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = readLanguage;
      // Add a small delay to prevent cutting off the beginning
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 200);
    }
  }

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
  }

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    } else {
      onComplete?.()
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
    }
  }

  const handleDifficultySelect = (difficulty: 'easy' | 'medium' | 'hard') => {
    onCardUpdate?.(currentCard.id, difficulty)
    handleNext()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'mastered': return 'bg-success'
      case 'learning': return 'bg-warning' 
      case 'difficult': return 'bg-destructive'
      default: return 'bg-muted'
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
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300" 
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
          <Button variant="ghost" size="icon" onClick={() => speakQuestion(isFlipped ? currentCard.back : currentCard.front)}>
            <Volume2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Star className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Flash Card */}
      <div className="relative h-80">
        <div
          key={isFlipped ? 'back' : 'front'}
        >
          <Card 
            className="cursor-pointer h-full"
            onClick={handleFlip}
          >
            <CardContent className="h-full flex items-center justify-center p-8">
              <div className="text-center space-y-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  {isFlipped ? 'Câu trả lời' : 'Câu hỏi'}
                </div>
                <div className={`text-2xl font-semibold ${isFlipped ? 'text-blue-700' : ''}`}>
                  {isFlipped ? currentCard.back : currentCard.front}
                </div>
                <div className="text-sm text-muted-foreground">
                  {isFlipped ? 'Nhấn để lật lại thẻ' : 'Nhấn để xem câu trả lời'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Flip Indicator */}
        <div 
          className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm rounded-full p-2 shadow-sm"
        >
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
          Tiếp
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Difficulty Selection */}
      {isFlipped && (
        <div className="space-y-4">
          <H3 className="text-center">Đánh giá độ khó</H3>
          <div className="flex justify-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => handleDifficultySelect('easy')}
              className="flex items-center gap-2"
            >
              <Check className="h-4 w-4 text-green-600" />
              Dễ
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleDifficultySelect('medium')}
              className="flex items-center gap-2"
            >
              <Star className="h-4 w-4 text-yellow-600" />
              Trung bình
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleDifficultySelect('hard')}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4 text-red-600" />
              Khó
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
