import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/shared/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { Bell, Check, Filter } from "lucide-react"
import { PageHeader } from '@/shared/components/PageHeader'
import { PageSection } from '@/shared/components/PageSection'
import { userRepository } from '@/shared/lib/repositories/UserRepository'
import { libraryRepository } from '@/shared/lib/repositories/LibraryRepository'
import {
  NotificationSearch,
  NotificationList,
  AccessRequests,
  NotificationQuickActions
} from '../components'

type NotificationItem = { id: string; type: string; title: string; message: string; read: boolean; createdAt: string; data?: Record<string, unknown> }
type NotificationFeedTabKey = 'all' | 'unread' | 'flashcards' | 'reminders' | 'achievements'
type NotificationTabKey = NotificationFeedTabKey | 'requests'

const NOTIFICATION_FEED_TABS: ReadonlyArray<{
  key: NotificationFeedTabKey;
  label: string;
  match: (notification: NotificationItem) => boolean;
}> = [
    {
      key: 'all',
      label: 'Tất cả',
      match: () => true,
    },
    {
      key: 'unread',
      label: 'Chưa đọc',
      match: (notification) => !notification.read,
    },
    {
      key: 'flashcards',
      label: 'Flashcard',
      match: (notification) => notification.type === 'flashcard' || notification.type === 'review',
    },
    {
      key: 'reminders',
      label: 'Nhắc nhở',
      match: (notification) => notification.type === 'reminder' || notification.type === 'streak',
    },
    {
      key: 'achievements',
      label: 'Thành tích',
      match: (notification) => notification.type === 'achievement',
    },
  ]

export default function Notifications() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTab, setSelectedTab] = useState<NotificationTabKey>('all')
  const [accessRequests, setAccessRequests] = useState<{ id: string; libraryId: string; requesterId: string; ownerId: string; status: string; createdAt: string; libraryTitle?: string; requesterName?: string }[]>([])
  const [loadingRequests, setLoadingRequests] = useState(false)
  const [acting, setActing] = useState<string | null>(null)
  const [actingNotif, setActingNotif] = useState<string | null>(null)
  const [actedRequests, setActedRequests] = useState<Record<string, 'approved' | 'rejected'>>({})

  useEffect(() => {
    setLoadingRequests(true);
    let unsub: (() => void) | null = null;
    try {
      unsub = userRepository.listenPendingAccessRequestsForOwner(async (reqs) => {
        const enriched = await Promise.all(reqs.map(async r => {
          let libraryTitle = ''; let requesterName = '';
          try { const meta = await libraryRepository.getLibraryMeta(r.libraryId); libraryTitle = meta?.title || ''; } catch {/* ignore meta */ }
          try { const prof = await userRepository.getUserProfile(r.requesterId); requesterName = prof?.displayName || prof?.email || r.requesterId.slice(0, 6); } catch {/* ignore profile */ }
          return { ...r, libraryTitle, requesterName };
        }));
        setAccessRequests(enriched);
        setLoadingRequests(false);
      });
    } catch { setLoadingRequests(false); }
    return () => { if (unsub) unsub(); };
  }, [])

  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [notifLoading, setNotifLoading] = useState(true)
  useEffect(() => { let unsub: (() => void) | null = null; try { unsub = userRepository.listenUserNotifications(items => { setNotifications(items); setNotifLoading(false); }); } catch { setNotifLoading(false); } return () => { if (unsub) unsub(); }; }, [])

  const filteredNotifications = useMemo(() => {
    if (selectedTab === 'requests') return []
    const activeTab = NOTIFICATION_FEED_TABS.find((tab) => tab.key === selectedTab)
    const searchTerm = searchQuery.trim().toLowerCase()
    return notifications.filter((notification) => {
      const matchesTab = activeTab ? activeTab.match(notification) : true
      if (!matchesTab) return false
      if (!searchTerm) return true
      return (
        notification.title.toLowerCase().includes(searchTerm) ||
        notification.message.toLowerCase().includes(searchTerm)
      )
    })
  }, [notifications, searchQuery, selectedTab])

  const getBadgeForTab = useCallback(
    (key: NotificationFeedTabKey) => {
      switch (key) {
        case 'unread':
          return notifications.filter((notification) => !notification.read).length
        case 'flashcards':
          return notifications.filter((notification) =>
            notification.type === 'flashcard' || notification.type === 'review'
          ).length
        case 'reminders':
          return notifications.filter((notification) =>
            notification.type === 'reminder' || notification.type === 'streak'
          ).length
        case 'achievements':
          return notifications.filter((notification) => notification.type === 'achievement').length
        case 'all':
        default:
          return notifications.length
      }
    },
    [notifications],
  )

  const markAsRead = async (id: string) => { try { await userRepository.markNotificationRead(id); } catch {/* ignore */ } }
  const markAllAsRead = async () => { try { await userRepository.markAllNotificationsRead(); } catch {/* ignore */ } }

  return (
    <div className="space-y-8 sm:space-y-10">
      <PageHeader
        title="Trung tâm thông báo"
        description="Theo dõi hoạt động mới nhất và quản lý các yêu cầu quyền truy cập từ bạn bè và đồng đội."
        icon={<Bell className="h-6 w-6 text-primary" />}
        actions={
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
            <Button variant="outline" onClick={markAllAsRead}>
              <Check className="h-4 w-4 mr-2" />
              Đánh dấu tất cả đã đọc
            </Button>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Cài đặt thông báo
            </Button>
          </div>
        }
      />

      {/** Bỏ phần Tổng quan; chuyển thanh tìm kiếm xuống phần danh sách */}

      <PageSection
        heading="Danh sách thông báo"
        description="Lọc theo danh mục để xử lý nhanh các thông báo quan trọng."
        contentClassName="space-y-6"
      >
        <NotificationSearch searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as NotificationTabKey)} className="space-y-4 sm:space-y-6">
          <div>
            <TabsList className="bg-muted p-1 rounded-full">
              {NOTIFICATION_FEED_TABS.map((tab) => {
                const badgeValue = getBadgeForTab(tab.key)
                return (
                  <TabsTrigger key={tab.key} value={tab.key} className="text-xs sm:text-sm">
                    {tab.label}
                    <span className="ml-1 sm:ml-2 bg-muted text-muted-foreground rounded-full px-1 sm:px-2 py-1 text-xs">
                      {badgeValue}
                    </span>
                  </TabsTrigger>
                )
              })}
              <TabsTrigger value="requests">
                Yêu cầu truy cập
                <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs">{accessRequests.length}</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {NOTIFICATION_FEED_TABS.map((tab) => (
            <TabsContent key={tab.key} value={tab.key} className="space-y-4">
              <NotificationList
                notifications={notifications}
                filteredNotifications={filteredNotifications}
                searchQuery={searchQuery}
                notifLoading={notifLoading}
                onMarkAsRead={markAsRead}
                actingNotif={actingNotif}
                setActingNotif={setActingNotif}
                actedRequests={actedRequests}
                setActedRequests={setActedRequests}
                setAccessRequests={setAccessRequests}
              />
            </TabsContent>
          ))}

          <TabsContent value="requests" className="space-y-4">
            <AccessRequests
              accessRequests={accessRequests}
              loadingRequests={loadingRequests}
              acting={acting}
              setActing={setActing}
              setAccessRequests={setAccessRequests}
            />
          </TabsContent>
        </Tabs>
      </PageSection>

      <PageSection
        heading="Thao tác nhanh"
        description="Bật ngay các tùy chọn phổ biến cho thông báo học tập của bạn."
      >
        <NotificationQuickActions />
      </PageSection>
    </div>
  )
}
