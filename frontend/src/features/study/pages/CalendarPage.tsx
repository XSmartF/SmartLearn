import { useState } from "react"
import { H1, H4 } from '@/shared/components/ui/typography';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  MoreVertical,
  BookOpen,
  AlertCircle,
  Check,
  Star,
  Target
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const events = [
    {
      id: 1,
      title: "Ôn tập từ vựng TOEIC",
      description: "Ôn tập 50 thẻ flashcard từ vựng TOEIC đã học",
      startTime: new Date(2024, 8, 3, 14, 0), // September 3, 2024, 14:00
      endTime: new Date(2024, 8, 3, 15, 0),
      type: "review",
      flashcardSet: "Từ vựng Tiếng Anh TOEIC",
      cardCount: 50,
      status: "upcoming"
    },
    {
      id: 2,
      title: "Học flashcard mới: Công thức Hóa học",
      description: "Học 20 thẻ flashcard mới về công thức hóa học cơ bản",
      startTime: new Date(2024, 8, 4, 19, 0), // September 4, 2024, 19:00
      endTime: new Date(2024, 8, 4, 20, 0),
      type: "study",
      flashcardSet: "Công thức Hóa học",
      cardCount: 20,
      status: "upcoming"
    },
    {
      id: 3,
      title: "Deadline: Hoàn thành bộ thẻ Lịch sử",
      description: "Hoàn thành việc học hết bộ thẻ Lịch sử Việt Nam",
      startTime: new Date(2024, 8, 6, 23, 59), // September 6, 2024, 23:59
      endTime: new Date(2024, 8, 6, 23, 59),
      type: "deadline",
      flashcardSet: "Lịch sử Việt Nam",
      cardCount: 25,
      status: "upcoming"
    },
    {
      id: 4,
      title: "Thử thách học tập tuần",
      description: "Tham gia thử thách học 200 thẻ flashcard trong tuần",
      startTime: new Date(2024, 8, 8, 9, 0), // September 8, 2024, 09:00
      endTime: new Date(2024, 8, 8, 12, 0),
      type: "challenge",
      flashcardSet: "Hỗn hợp",
      cardCount: 200,
      status: "upcoming"
    },
    {
      id: 5,
      title: "Ôn tập flashcard yêu thích",
      description: "Ôn tập các thẻ đã đánh dấu yêu thích",
      startTime: new Date(2024, 8, 10, 15, 0), // September 10, 2024, 15:00
      endTime: new Date(2024, 8, 10, 16, 0),
      type: "favorite_review",
      flashcardSet: "Các thẻ yêu thích",
      cardCount: 30,
      status: "upcoming"
    },
    {
      id: 6,
      title: "Tạo flashcard mới",
      description: "Dành thời gian tạo flashcard cho chủ đề mới",
      startTime: new Date(2024, 8, 12, 16, 0), // September 12, 2024, 16:00
      endTime: new Date(2024, 8, 12, 17, 0),
      type: "create",
      flashcardSet: "Chủ đề mới",
      cardCount: 0,
      status: "upcoming"
    }
  ]

  const upcomingEvents = events
    .filter(event => event.startTime >= new Date())
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
    .slice(0, 5)

  const todayEvents = events.filter(event => {
    const today = new Date()
    return event.startTime.toDateString() === today.toDateString()
  })

  const stats = [
    {
      title: "Sự kiện hôm nay",
      value: todayEvents.length.toString(),
      subtitle: "Hoạt động trong ngày"
    },
    {
      title: "Tuần này",
      value: events.filter(event => {
        const weekStart = new Date()
        const weekEnd = new Date()
        weekEnd.setDate(weekStart.getDate() + 7)
        return event.startTime >= weekStart && event.startTime <= weekEnd
      }).length.toString(),
      subtitle: "Sự kiện sắp tới"
    },
    {
      title: "Ôn tập",
      value: events.filter(event => event.type === 'review').length.toString(),
      subtitle: "Cần ôn tập"
    },
    {
      title: "Học mới",
      value: events.filter(event => event.type === 'study').length.toString(),
      subtitle: "Flashcard mới"
    }
  ]

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'review':
        return <AlertCircle className="h-4 w-4" />
      case 'study':
        return <BookOpen className="h-4 w-4" />
      case 'deadline':
        return <Clock className="h-4 w-4" />
      case 'challenge':
        return <Target className="h-4 w-4" />
      case 'favorite_review':
        return <Star className="h-4 w-4" />
      case 'create':
        return <Plus className="h-4 w-4" />
      default:
        return <CalendarIcon className="h-4 w-4" />
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'review':
        return 'border-l-orange-500 bg-orange-50'
      case 'study':
        return 'border-l-blue-500 bg-blue-50'
      case 'deadline':
        return 'border-l-red-500 bg-red-50'
      case 'challenge':
        return 'border-l-purple-500 bg-purple-50'
      case 'favorite_review':
        return 'border-l-yellow-500 bg-yellow-50'
      case 'create':
        return 'border-l-green-500 bg-green-50'
      default:
        return 'border-l-blue-500 bg-blue-50'
    }
  }

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'review':
        return <Badge variant="secondary" className="text-xs">Ôn tập</Badge>
      case 'study':
        return <Badge variant="default" className="text-xs">Học mới</Badge>
      case 'deadline':
        return <Badge variant="destructive" className="text-xs">Deadline</Badge>
      case 'challenge':
        return <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">Thử thách</Badge>
      case 'favorite_review':
        return <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">Yêu thích</Badge>
      case 'create':
        return <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">Tạo mới</Badge>
      default:
        return <Badge variant="outline" className="text-xs">Sự kiện</Badge>
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatShortDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', { 
      month: 'short',
      day: 'numeric'
    })
  }

  // Simple calendar grid (simplified for demo)
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days = []
    
    // Add empty cells for previous month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const hasEventOnDate = (date: Date | null) => {
    if (!date) return false
    return events.some(event => 
      event.startTime.toDateString() === date.toDateString()
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <H1 className="text-3xl font-bold">Lịch học tập</H1>
          <p className="text-muted-foreground">
            Quản lý thời gian biểu và sự kiện học tập
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Thêm sự kiện
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {currentDate.toLocaleDateString('vi-VN', { 
                  year: 'numeric', 
                  month: 'long' 
                })}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Hôm nay
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {generateCalendarDays().map((date, index) => (
                <div
                  key={index}
                  className={`
                    p-2 text-center text-sm cursor-pointer rounded-md transition-colors
                    ${date ? 'hover:bg-muted' : ''}
                    ${date && date.toDateString() === new Date().toDateString() ? 'bg-primary text-primary-foreground' : ''}
                    ${date && selectedDate && date.toDateString() === selectedDate.toDateString() ? 'bg-accent' : ''}
                  `}
                  onClick={() => date && setSelectedDate(date)}
                >
                  {date && (
                    <div className="relative">
                      <span>{date.getDate()}</span>
                      {hasEventOnDate(date) && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Sự kiện sắp tới</CardTitle>
            <CardDescription>
              5 hoạt động gần nhất
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Không có sự kiện nào sắp tới</p>
              </div>
            ) : (
              upcomingEvents.map((event) => (
                <Card key={event.id} className={`border-l-4 ${getEventColor(event.type)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="flex-shrink-0 mt-1">
                          {getEventIcon(event.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <H4 className="text-sm font-semibold truncate">{event.title}</H4>
                            {getEventBadge(event.type)}
                          </div>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {event.description}
                          </p>
                          <div className="space-y-1">
                            <div className="flex items-center text-xs text-muted-foreground">
                              <CalendarIcon className="h-3 w-3 mr-1" />
                              {formatShortDate(event.startTime)}
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatTime(event.startTime)} - {formatTime(event.endTime)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              🎯 {event.cardCount > 0 ? `${event.cardCount} thẻ` : 'Tạo mới'}
                            </div>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Check className="h-4 w-4 mr-2" />
                            Đánh dấu hoàn thành
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Xóa sự kiện
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Today's Events */}
      {todayEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Lịch trình hôm nay</CardTitle>
            <CardDescription>
              {formatDate(new Date())}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayEvents.map((event) => (
                <div key={event.id} className={`p-4 rounded-lg border-l-4 ${getEventColor(event.type)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getEventIcon(event.type)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <H4 className="font-semibold">{event.title}</H4>
                          {getEventBadge(event.type)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{event.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                          <span>🎯 {event.cardCount > 0 ? `${event.cardCount} thẻ` : 'Tạo mới'}</span>
                          <Badge variant="outline" className="text-xs">{event.flashcardSet}</Badge>
                        </div>
                      </div>
                    </div>
                    <Button size="sm">
                      Tham gia
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
