import { H1 } from '@/shared/components/ui/typography'
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { ArrowLeft, Clock } from "lucide-react"
import { Link } from "react-router-dom"

interface TestHeaderProps {
  libraryTitle: string
  currentQuestionIndex: number
  totalQuestions: number
  timeLeft: number | null
  testCompleted: boolean
}

export default function TestHeader({
  libraryTitle,
  currentQuestionIndex,
  totalQuestions,
  timeLeft,
  testCompleted
}: TestHeaderProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between">
        <Link to={`/dashboard/library/${libraryTitle ? 'library-id' : ''}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>

        <div className="text-center">
          <H1 className="text-xl sm:text-2xl font-bold">Kiểm tra: {libraryTitle}</H1>
          {!testCompleted && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mt-2">
              <Badge variant="outline" className="text-xs">
                Câu {currentQuestionIndex + 1} / {totalQuestions}
              </Badge>
              {timeLeft !== null && (
                <Badge variant="outline" className="flex items-center space-x-1 text-xs">
                  <Clock className="h-3 w-3" />
                  <span>{formatTime(timeLeft)}</span>
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="w-10" /> {/* Spacer for centering */}
      </div>
    </div>
  )
}
