import type { ComponentType } from 'react'
import { Loader } from '@/shared/components/ui/loader'
import { NotificationEmptyState } from './NotificationEmptyState'
import { NotificationListItem } from './NotificationListItem'
import type {
  AccessRequestDecision,
  NotificationItem,
  NotificationTypeConfigMap,
} from '../../types'

interface NotificationListProps {
  notifications: NotificationItem[]
  filteredNotifications: NotificationItem[]
  searchTerm: string
  isLoading: boolean
  typeConfig: NotificationTypeConfigMap
  fallbackIcon: ComponentType<{ className?: string }>
  notificationActionId: string | null
  onMarkAsRead: (notificationId: string) => void
  notificationAccessRequestMap: Record<string, string>
  handledRequests: Record<string, AccessRequestDecision>
  onRequestDecision: (
    requestId: string,
    decision: AccessRequestDecision,
    options?: { notificationId?: string }
  ) => void
  requestActionId: string | null
}

export function NotificationList({
  notifications,
  filteredNotifications,
  searchTerm,
  isLoading,
  typeConfig,
  fallbackIcon,
  notificationActionId,
  onMarkAsRead,
  notificationAccessRequestMap,
  handledRequests,
  onRequestDecision,
  requestActionId,
}: NotificationListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader size="sm" />
      </div>
    )
  }

  if (notifications.length === 0 || filteredNotifications.length === 0) {
    return <NotificationEmptyState searchTerm={searchTerm} />
  }

  return (
    <div className="space-y-3">
      {filteredNotifications.map((notification) => {
        const requestId = notificationAccessRequestMap[notification.id]
        const handledStatus = requestId ? handledRequests[requestId] : undefined
        const requestActionPending = requestId ? requestActionId === requestId : false

        return (
          <NotificationListItem
            key={notification.id}
            notification={notification}
            typeConfig={typeConfig}
            fallbackIcon={fallbackIcon}
            onMarkAsRead={onMarkAsRead}
            isMarking={notificationActionId === notification.id}
            requestId={requestId}
            handledRequestStatus={handledStatus}
            onRequestDecision={requestId ? (decision) => onRequestDecision(requestId, decision, { notificationId: notification.id }) : undefined}
            requestActionPending={requestActionPending}
          />
        )
      })}
    </div>
  )
}
