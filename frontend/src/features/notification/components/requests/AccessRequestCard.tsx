import { Card, CardContent } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Check, X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { AccessRequestDecision, AccessRequestSummary } from '../../types'

interface AccessRequestCardProps {
  request: AccessRequestSummary
  handledStatus?: AccessRequestDecision
  onDecision: (decision: AccessRequestDecision) => void
  disabled?: boolean
}

function formatTimestamp(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString()
}

export function AccessRequestCard({ request, handledStatus, onDecision, disabled }: AccessRequestCardProps) {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
          <div>
            <span className="font-medium">{request.requesterName ?? request.requesterId}</span>
            <span className="mx-1 text-muted-foreground">muốn truy cập</span>
            <span className="font-medium">{request.libraryTitle ?? request.libraryId}</span>
          </div>
          <span className="text-xs text-muted-foreground">{formatTimestamp(request.createdAt)}</span>
        </div>

        {handledStatus ? (
          <Badge
            variant="outline"
            className={cn(
              'px-3 py-1 text-xs font-medium',
              handledStatus === 'approve'
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-red-50 text-red-700 border-red-200',
            )}
          >
            {handledStatus === 'approve' ? 'Đã chấp nhận' : 'Đã từ chối'}
          </Badge>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" disabled={disabled} onClick={() => onDecision('approve')}>
              <Check className="mr-2 h-4 w-4" /> Chấp nhận
            </Button>
            <Button size="sm" variant="outline" disabled={disabled} onClick={() => onDecision('reject')}>
              <X className="mr-2 h-4 w-4" /> Từ chối
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
