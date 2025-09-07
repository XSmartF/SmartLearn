import { useState, useEffect } from "react"
import { H1 } from '@/shared/components/ui/typography';
import { Button } from "@/shared/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { 
  Check, 
  Filter
} from "lucide-react"
import { userRepository } from '@/shared/lib/repositories/UserRepository'
import { libraryRepository } from '@/shared/lib/repositories/LibraryRepository'
import {
  NotificationStats,
  NotificationSearch,
  NotificationList,
  AccessRequests,
  NotificationQuickActions
} from '../components'

export default function Notifications() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTab, setSelectedTab] = useState('all')
  const [accessRequests, setAccessRequests] = useState<{ id: string; libraryId: string; requesterId: string; ownerId: string; status: string; createdAt: string; libraryTitle?: string; requesterName?: string }[]>([])
  const [loadingRequests, setLoadingRequests] = useState(false)
  const [acting, setActing] = useState<string|null>(null)
  const [actingNotif, setActingNotif] = useState<string|null>(null)
  const [actedRequests, setActedRequests] = useState<Record<string, 'approved' | 'rejected'>>({})

  useEffect(()=>{ 
    setLoadingRequests(true);
    let unsub: (()=>void)|null = null;
    try {
  unsub = userRepository.listenPendingAccessRequestsForOwner(async (reqs)=>{
        const enriched = await Promise.all(reqs.map(async r=>{
          let libraryTitle = ''; let requesterName='';
          try { const meta = await libraryRepository.getLibraryMeta(r.libraryId); libraryTitle = meta?.title || ''; } catch{/* ignore meta */}
          try { const prof = await userRepository.getUserProfile(r.requesterId); requesterName = prof?.displayName || prof?.email || r.requesterId.slice(0,6); } catch{/* ignore profile */}
          return { ...r, libraryTitle, requesterName };
        }));
        setAccessRequests(enriched);
        setLoadingRequests(false);
      });
    } catch { setLoadingRequests(false); }
    return ()=>{ if(unsub) unsub(); };
  }, [])

  const [notifications, setNotifications] = useState<{ id: string; type: string; title: string; message: string; read: boolean; createdAt: string; data?: Record<string, unknown> }[]>([])
  const [notifLoading, setNotifLoading] = useState(true)
  useEffect(()=>{ let unsub: (()=>void)|null=null; try { unsub = userRepository.listenUserNotifications(items=>{ setNotifications(items); setNotifLoading(false); }); } catch { setNotifLoading(false); } return ()=>{ if(unsub) unsub(); }; }, [])

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesTab = selectedTab === 'all' || 
                      (selectedTab === 'unread' && !notification.read) ||
                      (selectedTab === 'flashcards' && (notification.type === 'flashcard' || notification.type === 'review')) ||
                      (selectedTab === 'reminders' && (notification.type === 'reminder' || notification.type === 'streak')) ||
                      (selectedTab === 'achievements' && notification.type === 'achievement')
    
    return matchesSearch && matchesTab
  })

  const markAsRead = async (id: string) => { try { await userRepository.markNotificationRead(id); } catch {/* ignore */} }
  const markAllAsRead = async () => { try { await userRepository.markAllNotificationsRead(); } catch {/* ignore */} }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <H1 className="text-2xl sm:text-3xl font-bold">Thông báo</H1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Theo dõi các hoạt động và cập nhật mới nhất
          </p>
        </div>
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
      </div>

      {/* Stats */}
      <NotificationStats notifications={notifications} accessRequests={accessRequests} />

      {/* Search */}
      <NotificationSearch searchQuery={searchQuery} onSearchChange={setSearchQuery} />

    {/* Notification Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4 sm:space-y-6">
        <div className="overflow-x-auto">
          <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground min-w-max">
            <TabsTrigger value="all" className="text-xs sm:text-sm">
              Tất cả
              <span className="ml-1 sm:ml-2 bg-muted text-muted-foreground rounded-full px-1 sm:px-2 py-1 text-xs">{notifications.length}</span>
            </TabsTrigger>
            <TabsTrigger value="unread">
              Chưa đọc
              <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs">{notifications.filter(n => !n.read).length}</span>
            </TabsTrigger>
            <TabsTrigger value="flashcards">Flashcard</TabsTrigger>
            <TabsTrigger value="reminders">Nhắc nhở</TabsTrigger>
            <TabsTrigger value="achievements">Thành tích</TabsTrigger>
            <TabsTrigger value="requests">Yêu cầu truy cập ({accessRequests.length})</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={selectedTab} className="space-y-4">
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

      {/* Quick Actions */}
      <NotificationQuickActions />
    </div>
  )
}
