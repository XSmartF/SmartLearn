import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import type { NotificationQuickActionItem } from '../../types'

interface NotificationQuickActionsProps {
  actions: NotificationQuickActionItem[]
}

export function NotificationQuickActions({ actions }: NotificationQuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Cài đặt thông báo nhanh</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.id}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2"
              >
                <Icon className="h-6 w-6" />
                <div className="text-center space-y-1">
                  <span className="text-sm font-medium block">{action.label}</span>
                  {action.description && (
                    <span className="text-xs text-muted-foreground block">{action.description}</span>
                  )}
                </div>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
