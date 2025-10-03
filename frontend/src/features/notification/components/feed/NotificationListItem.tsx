import type { ComponentType } from 'react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { cn } from '@/shared/lib/utils'
import { Check, MoreVertical, X } from 'lucide-react'
import type {
  AccessRequestDecision,
  NotificationItem,
  NotificationTypeConfigMap,
} from '../../types'

interface NotificationListItemProps {
  notification: NotificationItem
  typeConfig: NotificationTypeConfigMap
  fallbackIcon: ComponentType<{ className?: string }>
  onMarkAsRead: (notificationId: string) => void
  isMarking: boolean
  requestId?: string
  handledRequestStatus?: AccessRequestDecision
  onRequestDecision?: (decision: AccessRequestDecision) => void
  requestActionPending?: boolean
}

function formatTimestamp(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString()
}

export function NotificationListItem({
  notification,
  typeConfig,
  fallbackIcon: FallbackIcon,
  onMarkAsRead,
  isMarking,
  requestId,
  handledRequestStatus,
  onRequestDecision,
  requestActionPending,
}: NotificationListItemProps) {
  const config = typeConfig[notification.type]
  const IconComponent = config?.icon ?? FallbackIcon
  const badgeVariant = config?.badgeVariant ?? 'outline'
  const badgeClassName = config?.badgeClassName

  return (
    <Card
      className={cn(
        'transition-all hover:shadow-md',
        !notification.read && 'border-l-4 border-primary/80 bg-primary/5',
      )}
    >
      <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:gap-4">
        <div
          className={cn(
            'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full',
            notification.read ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground',
          )}
        >
          <IconComponent className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'text-sm font-semibold',
                    notification.read ? 'text-muted-foreground' : 'text-foreground',
                  )}
                >
                  {notification.title}
                </span>
                <Badge
                  variant={badgeVariant}
                  className={cn('text-xs', badgeClassName)}
                >
                  {config?.badgeLabel ?? 'Thông báo'}
                </Badge>
                {!notification.read && (
                  <span className="h-2 w-2 rounded-full bg-primary" aria-hidden />
                )}
              </div>
              <p className={cn('text-sm', notification.read ? 'text-muted-foreground' : 'text-foreground')}>
                {notification.message}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatTimestamp(notification.createdAt)}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!notification.read && (
                    <DropdownMenuItem onClick={() => onMarkAsRead(notification.id)} disabled={isMarking}>
                      <Check className="mr-2 h-4 w-4" />
                      Đánh dấu đã đọc
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {requestId && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {handledRequestStatus ? (
                <Badge
                  variant="outline"
                  className={cn(
                    'px-3 py-1 text-xs font-medium',
                    handledRequestStatus === 'approve'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-red-50 text-red-700 border-red-200',
                  )}
                >
                  {handledRequestStatus === 'approve' ? 'Đã chấp nhận' : 'Đã từ chối'}
                </Badge>
              ) : (
                <>
                  <Button
                    size="sm"
                    disabled={requestActionPending}
                    onClick={() => onRequestDecision?.('approve')}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Chấp nhận
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={requestActionPending}
                    onClick={() => onRequestDecision?.('reject')}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Từ chối
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
