import type { LucideIcon } from 'lucide-react'

export type NotificationPriority = 'low' | 'normal' | 'high'

export type NotificationType =
  | 'flashcard'
  | 'review'
  | 'achievement'
  | 'share'
  | 'streak'
  | 'reminder'
  | 'suggestion'
  | 'system'
  | 'access_request'
  | 'access_request_approved'
  | 'access_request_rejected'
  | (string & {})

export interface NotificationPayload {
  [key: string]: unknown
}

export interface NotificationItem {
  id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: string
  priority?: NotificationPriority
  data?: NotificationPayload
}

export type NotificationFeedTabId =
  | 'all'
  | 'unread'
  | 'flashcards'
  | 'reminders'
  | 'achievements'

export type NotificationTabId = NotificationFeedTabId | 'requests'

export interface NotificationTabOption {
  id: NotificationFeedTabId
  label: string
  description?: string
  filter: (notification: NotificationItem) => boolean
}

export interface NotificationTabWithCount extends NotificationTabOption {
  count: number
}

export interface NotificationTypeVisualConfig {
  icon: LucideIcon
  badgeLabel: string
  badgeVariant: 'default' | 'secondary' | 'outline' | 'destructive'
  badgeClassName?: string
}

export type NotificationTypeConfigMap = Record<string, NotificationTypeVisualConfig>

export interface NotificationTabMetric {
  id: NotificationFeedTabId
  count: number
}

export interface AccessRequestSummary {
  id: string
  libraryId: string
  requesterId: string
  ownerId: string
  status: string
  createdAt: string
  libraryTitle?: string
  requesterName?: string
}

export type AccessRequestDecision = 'approve' | 'reject'

export interface NotificationQuickActionItem {
  id: string
  label: string
  icon: LucideIcon
  description?: string
}
