import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import type { NotificationSummaryMetrics } from '../../hooks/useNotificationCenterView'

interface NotificationSummaryStatsProps {
  summary: NotificationSummaryMetrics
}

const SUMMARY_ITEMS: Array<{ key: keyof NotificationSummaryMetrics; title: string; subtitle: string }> = [
  { key: 'unreadCount', title: 'Chưa đọc', subtitle: 'Thông báo mới' },
  { key: 'requestCount', title: 'Yêu cầu truy cập', subtitle: 'Đang chờ xử lý' },
  { key: 'last24HoursCount', title: '24 giờ qua', subtitle: 'Thông báo gần đây' },
  { key: 'flashcardCount', title: 'Flashcard', subtitle: 'Liên quan học tập' },
]

export function NotificationSummaryStats({ summary }: NotificationSummaryStatsProps) {
  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
      {SUMMARY_ITEMS.map((item) => (
        <Card key={item.key}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">{item.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{summary[item.key]}</div>
            <p className="text-xs text-muted-foreground">{item.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
