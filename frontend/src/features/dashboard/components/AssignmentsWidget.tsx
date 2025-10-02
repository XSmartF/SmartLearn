import { memo } from 'react';
import { H2, P } from '@/shared/components/ui/typography';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { Target, Clock } from 'lucide-react';
import type { DashboardAssignment } from '../hooks/useDashboardAnalytics';

export interface AssignmentsWidgetProps {
  assignments: DashboardAssignment[];
  onEdit?: () => void;
}

export const AssignmentsWidget = memo(({ assignments, onEdit }: AssignmentsWidgetProps) => {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <H2 className="text-lg font-semibold flex items-center gap-2">
          <Target className="w-5 h-5 text-accent" />
          Nhiệm vụ
        </H2>
        <button
          type="button"
          onClick={onEdit}
          className="text-xs text-primary hover:underline focus-visible:outline-none"
        >
          Sửa
        </button>
      </CardHeader>
      <CardContent className="space-y-3">
        {assignments.map((assignment) => (
          <article key={assignment.id} className="neu-card-flat p-3">
            <div className="flex items-center justify-between mb-2">
              <Badge
                variant={assignment.priority === 'urgent' ? 'destructive' : assignment.priority === 'in-progress' ? 'success' : 'secondary'}
              >
                {assignment.statusLabel}
              </Badge>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
            <P className="text-sm font-medium mb-1">{assignment.title}</P>
            <P className="text-xs text-muted-foreground">{assignment.dueTime}</P>
          </article>
        ))}
      </CardContent>
    </Card>
  );
});

AssignmentsWidget.displayName = 'AssignmentsWidget';
