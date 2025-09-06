import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"

interface NotificationStatsProps {
  notifications: { id: string; type: string; title: string; message: string; read: boolean; createdAt: string; data?: Record<string, unknown> }[]
  accessRequests: { id: string; libraryId: string; requesterId: string; ownerId: string; status: string; createdAt: string; libraryTitle?: string; requesterName?: string }[]
}

export function NotificationStats({ notifications, accessRequests }: NotificationStatsProps) {
  const stats = [
    { title: 'Chưa đọc', value: notifications.filter(n => !n.read).length.toString(), subtitle: 'Thông báo mới' },
    { title: 'Yêu cầu truy cập', value: accessRequests.length.toString(), subtitle: 'Đang chờ' },
    { title: '24h qua', value: notifications.filter(n => Date.now() - Date.parse(n.createdAt) < 24 * 3600 * 1000).length.toString(), subtitle: 'Trong 24h' },
    { title: 'Flashcard', value: notifications.filter(n => n.type === 'flashcard' || n.type === 'review').length.toString(), subtitle: 'Liên quan học tập' }
  ]

  return (
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
  )
}
