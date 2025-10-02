import { memo } from 'react';
import { H2, P } from '@/shared/components/ui/typography';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import type { DashboardTask } from '../hooks/useDashboardAnalytics';
import { cn } from '@/shared/lib/utils';

export interface TasksWidgetProps {
  tasks: DashboardTask[];
  onShare?: () => void;
}

const themeToClass: Record<DashboardTask['theme'], string> = {
  primary: 'bg-primary',
  warning: 'bg-warning',
  info: 'bg-info'
};

export const TasksWidget = memo(({ tasks, onShare }: TasksWidgetProps) => {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <H2 className="text-lg font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-success" />
          Nhiệm vụ hôm nay
        </H2>
        <button
          type="button"
          onClick={onShare}
          className="text-xs text-primary hover:underline focus-visible:outline-none"
        >
          Chia sẻ
        </button>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.map((task) => (
          <label
            key={task.id}
            className="flex items-center gap-3 p-3 neu-card-flat hover:shadow-md transition-shadow cursor-pointer"
          >
            <input type="checkbox" className="w-5 h-5 rounded-md" />
            <div className="flex-1">
              <P className="text-sm font-medium">{task.title}</P>
              <div className="flex items-center gap-2 mt-1">
                <P className="text-xs text-muted-foreground">{task.timeRange}</P>
                <div className="flex-1 bg-muted rounded-full h-1.5">
                  <div
                    className={cn('h-1.5 rounded-full', themeToClass[task.theme])}
                    style={{ width: `${task.progress * 100}%` }}
                  />
                </div>
                <P className="text-xs font-medium">{Math.round(task.progress * 100)}%</P>
              </div>
            </div>
          </label>
        ))}
      </CardContent>
    </Card>
  );
});

TasksWidget.displayName = 'TasksWidget';
