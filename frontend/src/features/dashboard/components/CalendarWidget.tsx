import { memo, useMemo } from 'react';
import { H2 } from '@/shared/components/ui/typography';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';

export interface CalendarWidgetProps {
  monthLabel: string;
  activeDay: number;
}

const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'] as const;

export const CalendarWidget = memo(({ monthLabel, activeDay }: CalendarWidgetProps) => {
  const days = useMemo(() => Array.from({ length: 31 }, (_, i) => i + 1), []);

  return (
    <Card className="h-full">
      <CardHeader className="flex items-center justify-between pb-3">
        <H2 className="text-lg font-semibold">{monthLabel}</H2>
        <div className="flex gap-2">
          <button className="text-xs text-muted-foreground hover:text-foreground" type="button" aria-label="Prev month">
            ‹
          </button>
          <button className="text-xs text-muted-foreground hover:text-foreground" type="button" aria-label="Next month">
            ›
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-7 gap-2 text-center text-xs">
          {daysOfWeek.map((day) => (
            <div key={day} className="text-muted-foreground font-medium">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2 text-center text-sm">
          {days.map((day) => (
            <button
              key={day}
              type="button"
              className={`h-8 w-8 rounded-lg hover:bg-primary/10 transition-colors ${
                day === activeDay ? 'bg-primary text-white' : 'text-foreground'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

CalendarWidget.displayName = 'CalendarWidget';
