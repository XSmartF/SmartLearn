import * as React from 'react';
import { cn } from '@/shared/lib/utils';
export type ChartConfig = Record<string, { label?: string; color?: string }>;

const ChartContext = React.createContext<ChartConfig | null>(null);

function useChartContext() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error('Chart components must be rendered inside <ChartContainer>.');
  }
  return context;
}

export interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig;
}

export const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ className, children, config, ...props }, ref) => (
    <ChartContext.Provider value={config}>
      <div ref={ref} className={cn('grid gap-4', className)} {...props}>
        {children}
      </div>
    </ChartContext.Provider>
  )
);
ChartContainer.displayName = 'ChartContainer';

export interface ChartTooltipItem {
  dataKey?: string | number;
  name?: string | number;
  value?: number | string;
  color?: string;
}

export interface ChartTooltipContentProps {
  active?: boolean;
  payload?: ChartTooltipItem[];
  label?: string | number;
  indicator?: 'line' | 'dot';
  className?: string;
}

export function ChartTooltipContent({ active, payload, label, indicator = 'dot', className }: ChartTooltipContentProps) {
  const config = useChartContext();
  if (!active || !payload?.length) return null;

  return (
    <div className={cn('rounded-lg border bg-background/95 p-3 shadow-sm text-xs', className)}>
      {label ? <div className="mb-2 font-medium text-foreground">{label}</div> : null}
      <div className="space-y-1">
        {payload.map((item, index) => {
          const key = (item?.dataKey ?? item?.name ?? index).toString();
          const chartItem = config[key] ?? {};
          const color = chartItem.color ?? item?.color ?? 'currentColor';
          return (
            <div key={key} className="flex items-center gap-2 text-muted-foreground">
              {indicator === 'dot' ? (
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
              ) : (
                <span className="h-1 w-4 rounded-sm" style={{ backgroundColor: color }} />
              )}
              <span className="flex-1">{chartItem.label ?? item?.name ?? key}</span>
              <span className="font-semibold text-foreground">{item?.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export interface ChartLegendContentProps {
  className?: string;
  payload?: ChartTooltipItem[];
}

export function ChartLegendContent({ payload, className }: ChartLegendContentProps) {
  const config = useChartContext();
  if (!payload?.length) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-3 text-xs text-muted-foreground', className)}>
      {payload.map((item, index) => {
        const key = (item.dataKey ?? item.value ?? index).toString();
        const chartItem = config[key] ?? {};
        const color = chartItem.color ?? item.color ?? 'currentColor';
        return (
          <div key={key} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
            <span>{chartItem.label ?? item.value ?? key}</span>
          </div>
        );
      })}
    </div>
  );
}
