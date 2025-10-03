import { Loader } from '@/shared/components/ui/loader'
import { AccessRequestCard } from './AccessRequestCard'
import type { AccessRequestDecision, AccessRequestSummary } from '../../types'

interface AccessRequestsPanelProps {
  requests: AccessRequestSummary[]
  loading: boolean
  handledRequests: Record<string, AccessRequestDecision>
  onDecision: (
    requestId: string,
    decision: AccessRequestDecision,
    options?: { notificationId?: string }
  ) => void
  actionRequestId: string | null
}

export function AccessRequestsPanel({
  requests,
  loading,
  handledRequests,
  onDecision,
  actionRequestId,
}: AccessRequestsPanelProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader size="sm" />
      </div>
    )
  }

  if (!requests.length) {
    return (
      <div className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
        Không có yêu cầu truy cập nào đang chờ xử lý.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => (
        <AccessRequestCard
          key={request.id}
          request={request}
          handledStatus={handledRequests[request.id]}
          disabled={actionRequestId === request.id}
          onDecision={(decision) => onDecision(request.id, decision)}
        />
      ))}
    </div>
  )
}
