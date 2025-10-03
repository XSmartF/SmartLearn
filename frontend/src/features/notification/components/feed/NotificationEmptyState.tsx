import { Card, CardContent } from '@/shared/components/ui/card'
import { Bell } from 'lucide-react'
import { H3 } from '@/shared/components/ui/typography'

interface NotificationEmptyStateProps {
  searchTerm: string
}

export function NotificationEmptyState({ searchTerm }: NotificationEmptyStateProps) {
  const hasSearch = Boolean(searchTerm.trim())

  return (
    <Card>
      <CardContent className="p-8 text-center space-y-3">
        <Bell className="h-12 w-12 text-muted-foreground mx-auto" />
        <H3 className="text-lg font-semibold">{hasSearch ? 'Không tìm thấy kết quả' : 'Bạn đã xem hết'}</H3>
        <p className="text-sm text-muted-foreground">
          {hasSearch
            ? 'Không có thông báo phù hợp với từ khóa bạn đã nhập.'
            : 'Tuyệt vời! Mọi thông báo của bạn đã được xử lý.'}
        </p>
      </CardContent>
    </Card>
  )
}
