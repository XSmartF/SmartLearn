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
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Hiệu suất học tập</CardTitle>
          <CardDescription>So sánh thời gian tập trung và các phiên ôn tập hàng tuần</CardDescription>
        </CardHeader>
        <CardContent className="h-[260px]">
          <ChartContainer config={productivityChartConfig} className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={productivity} margin={{ left: 0, right: 0, top: 12, bottom: 0 }}>
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
                <XAxis dataKey="week" tickLine={false} axisLine={false} className="text-xs" />
                <YAxis tickLine={false} axisLine={false} className="text-xs" />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend verticalAlign="top" align="right" content={<ChartLegendContent />} />
                <Area type="monotone" dataKey="focusMinutes" stroke="hsl(var(--primary))" fill="url(#focusGradient)" strokeWidth={2} />
                <Area type="monotone" dataKey="reviewSessions" stroke="hsl(var(--accent))" fill="url(#reviewGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tỷ lệ hoàn thành theo chủ đề</CardTitle>
          <CardDescription>Hiệu suất học tập trung bình {averageCompletion}%</CardDescription>
        </CardHeader>
        <CardContent className="h-[260px]">
          <ChartContainer config={completionChartConfig} className="h-full">
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
                <Legend verticalAlign="bottom" content={<ChartLegendContent />} />
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
