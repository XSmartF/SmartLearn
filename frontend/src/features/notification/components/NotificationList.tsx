import { Card, CardContent } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Loader } from '@/shared/components/ui/loader'
import { H3 } from '@/shared/components/ui/typography'
import {
  Bell,
  Check,
  MoreVertical,
  BookOpen,
  Award,
  AlertCircle,
  MessageSquare,
  Calendar,
  Star,
  X
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { userRepository } from '@/shared/lib/repositories/UserRepository'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
  data?: Record<string, unknown>
}

interface NotificationListProps {
  notifications: Notification[]
  filteredNotifications: Notification[]
  searchQuery: string
  notifLoading: boolean
  onMarkAsRead: (id: string) => void
  actingNotif: string | null
  setActingNotif: (id: string | null) => void
  actedRequests: Record<string, 'approved' | 'rejected'>
  setActedRequests: React.Dispatch<React.SetStateAction<Record<string, 'approved' | 'rejected'>>>
  setAccessRequests: React.Dispatch<React.SetStateAction<{ id: string; libraryId: string; requesterId: string; ownerId: string; status: string; createdAt: string; libraryTitle?: string; requesterName?: string }[]>>
}

export function NotificationList({
  filteredNotifications,
  searchQuery,
  notifLoading,
  onMarkAsRead,
  actingNotif,
  setActingNotif,
  actedRequests,
  setActedRequests,
  setAccessRequests
}: NotificationListProps) {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    flashcard: BookOpen,
    review: AlertCircle,
    achievement: Award,
    share: MessageSquare,
    streak: Calendar,
    reminder: Star,
    suggestion: BookOpen,
    system: Bell,
    access_request: MessageSquare,
    access_request_approved: Check,
    access_request_rejected: X
  }

  const getNotificationIcon = (notification: { type: string }) => {
    const IconComponent = iconMap[notification.type] || Bell
    return <IconComponent className="h-5 w-5" />
  }

  const getNotificationBadge = (type: string, priority?: string) => {
    if (priority === 'high') {
      return <Badge variant="destructive" className="text-xs">Urgent</Badge>
    }

    switch (type) {
      case 'flashcard':
        return <Badge variant="default" className="text-xs">Flashcard</Badge>
      case 'review':
        return <Badge variant="secondary" className="text-xs">Ôn tập</Badge>
      case 'achievement':
        return <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">Thành tích</Badge>
      case 'share':
        return <Badge variant="outline" className="text-xs">Chia sẻ</Badge>
      case 'streak':
        return <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">Streak</Badge>
      case 'reminder':
        return <Badge variant="outline" className="text-xs">Nhắc nhở</Badge>
      case 'suggestion':
        return <Badge variant="outline" className="text-xs">Gợi ý</Badge>
      case 'system':
        return <Badge variant="outline" className="text-xs">Hệ thống</Badge>
      default:
        return <Badge variant="outline" className="text-xs">Khác</Badge>
    }
  }

  if (notifLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center">
          <Loader size="sm" />
        </CardContent>
      </Card>
    )
  }

  if (filteredNotifications.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <H3 className="text-lg font-semibold mb-2">Không có thông báo</H3>
          <p className="text-muted-foreground">
            {searchQuery ? 'Không tìm thấy thông báo phù hợp với từ khóa tìm kiếm.' : 'Bạn đã xem hết tất cả thông báo.'}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {filteredNotifications.map((notification) => (
        <Card
          key={notification.id}
          className={`transition-all hover:shadow-md ${
            !notification.read ? 'border-l-4 border-l-primary bg-primary/5' : ''
          }`}
        >
          <CardContent className="p-4">
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-start sm:space-y-0 sm:space-x-4">
              <div className={`flex-shrink-0 p-2 rounded-full ${
                !notification.read ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {getNotificationIcon(notification)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col space-y-2 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-semibold ${
                      !notification.read ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {notification.title}
                    </span>
                    {getNotificationBadge(notification.type, undefined)}
                    {!notification.read && (
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {!notification.read && (
                          <DropdownMenuItem onClick={() => onMarkAsRead(notification.id)}>
                            <Check className="h-4 w-4 mr-2" />
                            Đánh dấu đã đọc
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <p className={`text-sm ${
                  !notification.read ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {notification.message}
                </p>

                {notification.type === 'access_request' && (() => {
                  const d = notification.data as (undefined | { requestId?: unknown })
                  return typeof d?.requestId === 'string'
                })() ? (
                  (() => {
                    const d = notification.data as { requestId?: unknown } | undefined
                    const requestId = typeof d?.requestId === 'string' ? d.requestId : ''
                    if (!requestId) return null
                    return (
                      <div className="flex gap-2 mt-3">
                        {actedRequests[requestId] ? (
                          <span className={`text-xs px-2 py-1 rounded border ${
                            actedRequests[requestId] === 'approved'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {actedRequests[requestId] === 'approved' ? 'Đã chấp nhận' : 'Đã từ chối'}
                          </span>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              disabled={actingNotif === notification.id}
                              onClick={async () => {
                                setActingNotif(notification.id)
                                try {
                                  await userRepository.actOnAccessRequest(requestId, true)
                                  setActedRequests(prev => ({ ...prev, [requestId]: 'approved' }))
                                  setAccessRequests(prev => prev.filter(r => r.id !== requestId))
                                  onMarkAsRead(notification.id)
                                } finally { setActingNotif(null) }
                              }}
                            >
                              Chấp nhận
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={actingNotif === notification.id}
                              onClick={async () => {
                                setActingNotif(notification.id)
                                try {
                                  await userRepository.actOnAccessRequest(requestId, false)
                                  setActedRequests(prev => ({ ...prev, [requestId]: 'rejected' }))
                                  setAccessRequests(prev => prev.filter(r => r.id !== requestId))
                                  onMarkAsRead(notification.id)
                                } finally { setActingNotif(null) }
                              }}
                            >
                              Từ chối
                            </Button>
                          </>
                        )}
                      </div>
                    )
                  })()
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
