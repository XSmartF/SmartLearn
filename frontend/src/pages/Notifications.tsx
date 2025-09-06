import { useState, useEffect } from "react"
import { H1, H3 } from '@/shared/components/ui/typography';
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { 
  Bell, 
  BellRing, 
  Check, 
  Search, 
  Filter, 
  MoreVertical,
  X,
  Star,
  MessageSquare,
  Calendar,
  BookOpen,
  Award,
  AlertCircle
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { userRepository } from '@/shared/lib/repositories/UserRepository'
import { libraryRepository } from '@/shared/lib/repositories/LibraryRepository'

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

  const stats = [
    { title: 'Chưa đọc', value: notifications.filter(n=>!n.read).length.toString(), subtitle: 'Thông báo mới' },
    { title: 'Yêu cầu truy cập', value: accessRequests.length.toString(), subtitle: 'Đang chờ' },
    { title: '24h qua', value: notifications.filter(n=> Date.now()-Date.parse(n.createdAt) < 24*3600*1000).length.toString(), subtitle: 'Trong 24h' },
    { title: 'Flashcard', value: notifications.filter(n=> n.type==='flashcard' || n.type==='review').length.toString(), subtitle: 'Liên quan học tập' }
  ]

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
  };
  const getNotificationIcon = (notification: { type: string }) => {
    const IconComponent = iconMap[notification.type] || Bell;
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <H1 className="text-3xl font-bold">Thông báo</H1>
          <p className="text-muted-foreground">
            Theo dõi các hoạt động và cập nhật mới nhất
          </p>
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
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
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
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

      {/* Search */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm thông báo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

    {/* Notification Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <div className="overflow-x-auto">
          <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground min-w-max">
            <TabsTrigger value="all">
              Tất cả
              <span className="ml-2 bg-muted text-muted-foreground rounded-full px-2 py-1 text-xs">{notifications.length}</span>
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
          {notifLoading ? (
            <Card><CardContent className="p-6 text-sm text-muted-foreground">Đang tải...</CardContent></Card>
          ) : filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <H3 className="text-lg font-semibold mb-2">Không có thông báo</H3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Không tìm thấy thông báo phù hợp với từ khóa tìm kiếm.' : 'Bạn đã xem hết tất cả thông báo.'}
                </p>
              </CardContent>
            </Card>
          ) : (
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
                            <span className="text-xs text-muted-foreground">{new Date(notification.createdAt).toLocaleString()}</span>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                {!notification.read && (
                                  <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
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
                            const d = notification.data as (undefined | { requestId?: unknown });
                            return typeof d?.requestId === 'string';
                          })() ? (
                            (() => {
                              const d = notification.data as { requestId?: unknown } | undefined;
                              const requestId = typeof d?.requestId === 'string' ? d.requestId : '';
                              if(!requestId) return null;
                              return (
                                <div className="flex gap-2 mt-3">
                                  {actedRequests[requestId] ? (
                                    <span className={`text-xs px-2 py-1 rounded border ${actedRequests[requestId]==='approved' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                      {actedRequests[requestId] === 'approved' ? 'Đã chấp nhận' : 'Đã từ chối'}
                                    </span>
                                  ) : (
                                    <>
                                      <Button
                                        size="sm"
                                        disabled={actingNotif === notification.id}
                                        onClick={async ()=>{
                                          setActingNotif(notification.id);
                                          try {
                                            await userRepository.actOnAccessRequest(requestId, true);
                                            setActedRequests(prev=> ({ ...prev, [requestId]: 'approved' }));
                                            setAccessRequests(prev=> prev.filter(r=> r.id !== requestId));
                                            await markAsRead(notification.id);
                                          } finally { setActingNotif(null); }
                                        }}
                                      >Chấp nhận</Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={actingNotif === notification.id}
                                        onClick={async ()=>{
                                          setActingNotif(notification.id);
                                          try {
                                            await userRepository.actOnAccessRequest(requestId, false);
                                            setActedRequests(prev=> ({ ...prev, [requestId]: 'rejected' }));
                                            setAccessRequests(prev=> prev.filter(r=> r.id !== requestId));
                                            await markAsRead(notification.id);
                                          } finally { setActingNotif(null); }
                                        }}
                                      >Từ chối</Button>
                                    </>
                                  )}
                                </div>
                              );
                            })()
                          ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Yêu cầu truy cập ({accessRequests.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingRequests && <div className="text-xs text-muted-foreground">Đang tải...</div>}
              {!loadingRequests && accessRequests.length === 0 && <div className="text-xs text-muted-foreground">Không có yêu cầu.</div>}
              {accessRequests.map(r => (
                <div key={r.id} className="border rounded-md p-3 flex flex-col gap-2 text-sm">
                  <div><span className="font-medium">{r.requesterName}</span> muốn truy cập thư viện <span className="font-medium">{r.libraryTitle || r.libraryId}</span></div>
                  <div className="text-[11px] text-muted-foreground">Gửi lúc: {new Date(r.createdAt).toLocaleString()}</div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
                    <Button size="sm" disabled={acting===r.id} onClick={async()=>{ setActing(r.id); try { await userRepository.actOnAccessRequest(r.id, true); setAccessRequests(prev=> prev.filter(x=>x.id!==r.id)); } finally { setActing(null); }}}>Chấp nhận</Button>
                    <Button size="sm" variant="outline" disabled={acting===r.id} onClick={async()=>{ setActing(r.id); try { await userRepository.actOnAccessRequest(r.id, false); setAccessRequests(prev=> prev.filter(x=>x.id!==r.id)); } finally { setActing(null); }}}>Từ chối</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cài đặt thông báo nhanh</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <BellRing className="h-6 w-6" />
              <span className="text-sm">Thông báo email</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Calendar className="h-6 w-6" />
              <span className="text-sm">Nhắc nhở ôn tập</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <BookOpen className="h-6 w-6" />
              <span className="text-sm">Cập nhật flashcard</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <MessageSquare className="h-6 w-6" />
              <span className="text-sm">Chia sẻ bộ thẻ</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
