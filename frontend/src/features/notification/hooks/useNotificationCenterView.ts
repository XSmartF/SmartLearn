import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { libraryRepository } from '@/shared/lib/repositories/LibraryRepository'
import { userRepository } from '@/shared/lib/repositories/UserRepository'
import {
  NOTIFICATION_FEED_TABS,
  NOTIFICATION_FALLBACK_ICON,
  NOTIFICATION_QUICK_ACTIONS,
  NOTIFICATION_TYPE_CONFIG,
} from '../constants'
import type {
  AccessRequestDecision,
  AccessRequestSummary,
  NotificationFeedTabId,
  NotificationItem,
  NotificationTabId,
  NotificationTabWithCount,
} from '../types'

export interface NotificationSummaryMetrics {
  unreadCount: number
  flashcardCount: number
  requestCount: number
  last24HoursCount: number
}

export interface UseNotificationCenterViewOptions {
  defaultTabId?: NotificationTabId
}

export interface UseNotificationCenterViewResult {
  searchQuery: string
  setSearchQuery: (value: string) => void
  activeTab: NotificationTabId
  setActiveTab: (tabId: NotificationTabId) => void
  tabs: NotificationTabWithCount[]
  notifications: NotificationItem[]
  filteredNotifications: NotificationItem[]
  notificationsLoading: boolean
  notificationActionId: string | null
  markingAllNotifications: boolean
  handleMarkAsRead: (notificationId: string) => Promise<void>
  handleMarkAllAsRead: () => Promise<void>
  typeConfig: typeof NOTIFICATION_TYPE_CONFIG
  typeFallbackIcon: typeof NOTIFICATION_FALLBACK_ICON
  notificationAccessRequestMap: Record<string, string>
  requests: AccessRequestSummary[]
  requestsLoading: boolean
  handledRequests: Record<string, AccessRequestDecision>
  requestActionId: string | null
  handleRequestDecision: (
    requestId: string,
    decision: AccessRequestDecision,
    options?: { notificationId?: string }
  ) => Promise<void>
  summary: NotificationSummaryMetrics
  quickActions: typeof NOTIFICATION_QUICK_ACTIONS
}

function normalizeSearch(value: string): string {
  return value.trim().toLowerCase()
}

async function enrichAccessRequest(request: AccessRequestSummary): Promise<AccessRequestSummary> {
  const [libraryMeta, requesterProfile] = await Promise.all([
    libraryRepository
      .getLibraryMeta(request.libraryId)
      .catch(() => null),
    userRepository
      .getUserProfile(request.requesterId)
      .catch(() => null),
  ])

  return {
    ...request,
    libraryTitle: libraryMeta?.title ?? request.libraryTitle ?? request.libraryId,
    requesterName:
      requesterProfile?.displayName ??
      requesterProfile?.email ??
      request.requesterName ??
      request.requesterId.slice(0, 6),
  }
}

function computeTabCounts(
  notifications: NotificationItem[],
): Record<NotificationFeedTabId, number> {
  const counts = NOTIFICATION_FEED_TABS.reduce<Record<NotificationFeedTabId, number>>((acc, tab) => {
    acc[tab.id] = notifications.filter(tab.filter).length
    return acc
  }, {} as Record<NotificationFeedTabId, number>)

  counts.all = notifications.length
  return counts
}

function getAccessRequestIdFromNotification(notification: NotificationItem): string | null {
  if (notification.type !== 'access_request') return null
  const data = notification.data as { requestId?: unknown } | undefined
  if (!data || typeof data.requestId !== 'string') return null
  return data.requestId
}

function computeSummaryMetrics(
  notifications: NotificationItem[],
  tabCounts: Record<NotificationFeedTabId, number>,
  requestsCount: number,
): NotificationSummaryMetrics {
  const now = Date.now()
  const last24HoursCount = notifications.filter((notification) => {
    const createdAt = Date.parse(notification.createdAt)
    if (Number.isNaN(createdAt)) return false
    return now - createdAt <= 24 * 60 * 60 * 1000
  }).length

  return {
    unreadCount: tabCounts.unread ?? 0,
    flashcardCount: tabCounts.flashcards ?? 0,
    requestCount: requestsCount,
    last24HoursCount,
  }
}

export function useNotificationCenterView({
  defaultTabId = 'all',
}: UseNotificationCenterViewOptions = {}): UseNotificationCenterViewResult {
  const [searchQuery, setSearchQuery] = useState('')
  const deferredSearch = useDeferredValue(searchQuery)
  const normalizedSearch = useMemo(() => normalizeSearch(deferredSearch), [deferredSearch])

  const [activeTab, setActiveTab] = useState<NotificationTabId>(defaultTabId)

  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [notificationsLoading, setNotificationsLoading] = useState(true)
  const [notificationActionId, setNotificationActionId] = useState<string | null>(null)
  const [markingAllNotifications, setMarkingAllNotifications] = useState(false)

  const [requests, setRequests] = useState<AccessRequestSummary[]>([])
  const [requestsLoading, setRequestsLoading] = useState(false)
  const [requestActionId, setRequestActionId] = useState<string | null>(null)
  const [handledRequests, setHandledRequests] = useState<Record<string, AccessRequestDecision>>({})

  useEffect(() => {
    let unsubscribe: (() => void) | undefined
    let active = true

    setNotificationsLoading(true)
    try {
      unsubscribe = userRepository.listenUserNotifications((items) => {
        if (!active) return
        setNotifications(items)
        setNotificationsLoading(false)
      })
    } catch (error) {
      console.error('Không thể theo dõi thông báo người dùng:', error)
      toast.error('Không thể tải thông báo. Vui lòng thử lại sau.')
      if (active) setNotificationsLoading(false)
    }

    return () => {
      active = false
      if (unsubscribe) unsubscribe()
    }
  }, [])

  useEffect(() => {
    let unsubscribe: (() => void) | undefined
    let cancelled = false

    setRequestsLoading(true)
    try {
      unsubscribe = userRepository.listenPendingAccessRequestsForOwner(async (entries) => {
        if (cancelled) return

        try {
          const enriched = await Promise.all(entries.map((entry) => enrichAccessRequest(entry)))
          if (!cancelled) {
            setRequests(enriched)
            setRequestsLoading(false)
          }
        } catch (error) {
          console.error('Không thể làm giàu dữ liệu yêu cầu truy cập:', error)
          if (!cancelled) {
            toast.error('Không thể tải yêu cầu truy cập')
            setRequests([])
            setRequestsLoading(false)
          }
        }
      })
    } catch (error) {
      console.error('Không thể theo dõi yêu cầu truy cập:', error)
      toast.error('Không thể tải yêu cầu truy cập')
      setRequests([])
      setRequestsLoading(false)
    }

    return () => {
      cancelled = true
      if (unsubscribe) unsubscribe()
    }
  }, [])

  const tabCounts = useMemo(() => computeTabCounts(notifications), [notifications])

  const tabs = useMemo<NotificationTabWithCount[]>(
    () => NOTIFICATION_FEED_TABS.map((tab) => ({ ...tab, count: tabCounts[tab.id] ?? 0 })),
    [tabCounts],
  )

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'requests') return []

    const tab = NOTIFICATION_FEED_TABS.find((option) => option.id === activeTab) ?? NOTIFICATION_FEED_TABS[0]
    const shouldFilterBySearch = normalizedSearch.length > 0

    return notifications.filter((notification) => {
      if (!tab.filter(notification)) return false
      if (!shouldFilterBySearch) return true
      const titleMatches = notification.title.toLowerCase().includes(normalizedSearch)
      const messageMatches = notification.message.toLowerCase().includes(normalizedSearch)
      return titleMatches || messageMatches
    })
  }, [activeTab, normalizedSearch, notifications])

  const summary = useMemo(
    () => computeSummaryMetrics(notifications, tabCounts, requests.length),
    [notifications, requests.length, tabCounts],
  )

  const notificationAccessRequestMap = useMemo(() => {
    return notifications.reduce<Record<string, string>>((acc, notification) => {
      const requestId = getAccessRequestIdFromNotification(notification)
      if (requestId) {
        acc[notification.id] = requestId
      }
      return acc
    }, {})
  }, [notifications])

  const handleMarkAsRead = useCallback(async (notificationId: string) => {
    setNotificationActionId(notificationId)
    try {
      await userRepository.markNotificationRead(notificationId)
    } catch (error) {
      console.error('Không thể đánh dấu thông báo đã đọc:', error)
      toast.error('Không thể đánh dấu thông báo đã đọc')
    } finally {
      setNotificationActionId((current) => (current === notificationId ? null : current))
    }
  }, [])

  const handleMarkAllAsRead = useCallback(async () => {
    setMarkingAllNotifications(true)
    try {
      await userRepository.markAllNotificationsRead()
    } catch (error) {
      console.error('Không thể đánh dấu tất cả thông báo:', error)
      toast.error('Không thể đánh dấu tất cả thông báo')
    } finally {
      setMarkingAllNotifications(false)
    }
  }, [])

  const handleRequestDecision = useCallback(
    async (requestId: string, decision: AccessRequestDecision, options?: { notificationId?: string }) => {
      setRequestActionId(requestId)
      try {
        await userRepository.actOnAccessRequest(requestId, decision === 'approve')
        setHandledRequests((prev) => ({ ...prev, [requestId]: decision }))
        setRequests((prev) => prev.filter((item) => item.id !== requestId))

        if (options?.notificationId) {
          await handleMarkAsRead(options.notificationId)
        }
      } catch (error) {
        console.error('Không thể cập nhật yêu cầu truy cập:', error)
        toast.error('Không thể xử lý yêu cầu truy cập')
      } finally {
        setRequestActionId((current) => (current === requestId ? null : current))
      }
    },
    [handleMarkAsRead],
  )

  return {
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    tabs,
    notifications,
    filteredNotifications,
    notificationsLoading,
    notificationActionId,
    markingAllNotifications,
    handleMarkAsRead,
    handleMarkAllAsRead,
    typeConfig: NOTIFICATION_TYPE_CONFIG,
    typeFallbackIcon: NOTIFICATION_FALLBACK_ICON,
  notificationAccessRequestMap,
    requests,
    requestsLoading,
    handledRequests,
    requestActionId,
    handleRequestDecision,
    summary,
    quickActions: NOTIFICATION_QUICK_ACTIONS,
  }
}
