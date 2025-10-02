import { memo, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { ChartContainer, type ChartConfig, ChartTooltipContent, ChartLegendContent } from '@/shared/components/ui/chart';
import type { DashboardProductivityPoint, DashboardTopicCompletion } from '../hooks/useDashboardAnalytics';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis
} from 'recharts';

export interface AnalyticsChartsSectionProps {
  productivity: DashboardProductivityPoint[];
  completion: DashboardTopicCompletion[];
}

const productivityChartConfig: ChartConfig = {
  focusMinutes: {
    label: 'Phút tập trung',
    color: 'hsl(var(--primary))'
  },
  reviewSessions: {
    label: 'Phiên ôn tập',
    color: 'hsl(var(--accent))'
  }
};

export const AnalyticsChartsSection = memo(({ productivity, completion }: AnalyticsChartsSectionProps) => {
  const completionChartConfig = useMemo<ChartConfig>(() => {
    return completion.reduce<ChartConfig>((acc, item) => {
      acc[item.topic] = { label: item.topic, color: item.color };
      return acc;
    }, {});
  }, [completion]);

  const radialData = useMemo(
    () => completion.map((item) => ({ ...item, fill: item.color })),
    [completion]
  );

  const averageCompletion = useMemo(() => {
    if (completion.length === 0) return 0;
    const total = completion.reduce((sum, item) => sum + item.completion, 0);
    return Math.round(total / completion.length);
  }, [completion]);

  return (
    <div className="flex flex-col gap-3 h-full">
      <Card className="flex flex-col flex-1 min-h-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Hiệu suất học tập</CardTitle>
          <CardDescription className="text-[10px]">Thời gian tập trung và phiên ôn tập</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 min-h-0">
          <ChartContainer config={productivityChartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={productivity} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="reviewGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                <XAxis dataKey="week" tickLine={false} axisLine={false} className="text-[9px]" />
                <YAxis tickLine={false} axisLine={false} className="text-[9px]" />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend verticalAlign="top" align="right" content={<ChartLegendContent />} wrapperStyle={{ fontSize: '10px' }} />
                <Area type="monotone" dataKey="focusMinutes" stroke="hsl(var(--primary))" fill="url(#focusGradient)" strokeWidth={1.5} />
                <Area type="monotone" dataKey="reviewSessions" stroke="hsl(var(--accent))" fill="url(#reviewGradient)" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="flex flex-col flex-1 min-h-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Hoàn thành chủ đề</CardTitle>
          <CardDescription className="text-[10px]">Trung bình {averageCompletion}%</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 min-h-0">
          <ChartContainer config={completionChartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                data={radialData}
                innerRadius="20%"
                outerRadius="90%"
                startAngle={180}
                endAngle={0}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <Tooltip content={<ChartTooltipContent indicator="line" />} />
                <Legend verticalAlign="bottom" content={<ChartLegendContent />} wrapperStyle={{ fontSize: '10px' }} />
                <RadialBar background cornerRadius={8} dataKey="completion" />
              </RadialBarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
});

AnalyticsChartsSection.displayName = 'AnalyticsChartsSection';
