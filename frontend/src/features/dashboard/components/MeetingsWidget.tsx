import { memo } from 'react';
import { H2, P } from '@/shared/components/ui/typography';
import { Card, CardContent, CardFooter, CardHeader } from '@/shared/components/ui/card';
import type { DashboardMeeting } from '../hooks/useDashboardAnalytics';
import { Button } from '@/shared/components/ui/button';

export interface MeetingsWidgetProps {
  meetings: DashboardMeeting[];
}

export const MeetingsWidget = memo(({ meetings }: MeetingsWidgetProps) => (
  <Card className="h-full">
    <CardHeader>
      <H2 className="text-lg font-semibold">Cuộc họp hội đồng</H2>
    </CardHeader>
    <CardContent className="space-y-3">
      {meetings.map((meeting) => (
        <article key={meeting.id} className="neu-card-flat p-3 space-y-2">
          <div>
            <P className="text-sm font-medium mb-1">{meeting.title}</P>
            <P className="text-xs text-muted-foreground">
              {meeting.participants} • {meeting.attendees}
            </P>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="text-xs font-semibold">
              {meeting.action}
            </Button>
            <Button size="sm" className="text-xs font-semibold">
              {meeting.highlight}
            </Button>
          </div>
        </article>
      ))}
    </CardContent>
    <CardFooter />
  </Card>
));

MeetingsWidget.displayName = 'MeetingsWidget';
