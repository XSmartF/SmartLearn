import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { userRepository } from '@/shared/lib/repositories/UserRepository'

interface AccessRequest {
  id: string
  libraryId: string
  requesterId: string
  ownerId: string
  status: string
  createdAt: string
  libraryTitle?: string
  requesterName?: string
}

interface AccessRequestsProps {
  accessRequests: AccessRequest[]
  loadingRequests: boolean
  acting: string | null
  setActing: (id: string | null) => void
  setAccessRequests: React.Dispatch<React.SetStateAction<AccessRequest[]>>
}

export function AccessRequests({
  accessRequests,
  loadingRequests,
  acting,
  setActing,
  setAccessRequests
}: AccessRequestsProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          Yêu cầu truy cập ({accessRequests.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loadingRequests && (
          <div className="text-xs text-muted-foreground">Đang tải...</div>
        )}
        {!loadingRequests && accessRequests.length === 0 && (
          <div className="text-xs text-muted-foreground">Không có yêu cầu.</div>
        )}
        {accessRequests.map(r => (
          <div key={r.id} className="border rounded-md p-3 flex flex-col gap-2 text-sm">
            <div>
              <span className="font-medium">{r.requesterName}</span> muốn truy cập thư viện{' '}
              <span className="font-medium">{r.libraryTitle || r.libraryId}</span>
            </div>
            <div className="text-[11px] text-muted-foreground">
              Gửi lúc: {new Date(r.createdAt).toLocaleString()}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
              <Button
                size="sm"
                disabled={acting === r.id}
                onClick={async () => {
                  setActing(r.id)
                  try {
                    await userRepository.actOnAccessRequest(r.id, true)
                    setAccessRequests(prev => prev.filter(x => x.id !== r.id))
                  } finally {
                    setActing(null)
                  }
                }}
              >
                Chấp nhận
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={acting === r.id}
                onClick={async () => {
                  setActing(r.id)
                  try {
                    await userRepository.actOnAccessRequest(r.id, false)
                    setAccessRequests(prev => prev.filter(x => x.id !== r.id))
                  } finally {
                    setActing(null)
                  }
                }}
              >
                Từ chối
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
