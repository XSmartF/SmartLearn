import { memo } from 'react';
import { H2, P } from '@/shared/components/ui/typography';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import type { DashboardNotification } from '../hooks/useDashboardAnalytics';
import { Bell } from 'lucide-react';

export interface NotificationsWidgetProps {
  notifications: DashboardNotification[];
  onClear?: () => void;
}

export const NotificationsWidget = memo(({ notifications, onClear }: NotificationsWidgetProps) => {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <H2 className="text-lg font-semibold flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Thông báo
        </H2>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-primary hover:underline focus-visible:outline-none"
        >
          Xóa
        </button>
      </CardHeader>
      <CardContent className="space-y-3">
        {notifications.map((notification) => (
          <article
            key={notification.id}
            className="neu-card-flat p-3 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  notification.status === 'new' ? 'bg-primary' : 'bg-muted'
                }`}
              />
              <div>
                <P className="text-sm font-medium">{notification.title}</P>
                <P className="text-xs text-muted-foreground">{notification.description}</P>
              </div>
            </div>
          </article>
        ))}
      </CardContent>
    </Card>
  );
});

NotificationsWidget.displayName = 'NotificationsWidget';
