import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { memo, useMemo } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/shared/components/ui/chart";
import type { DashboardProductivitySectionModel } from "@/features/dashboard/types";

interface DashboardProductivityProps {
  model: DashboardProductivitySectionModel;
}

export const DashboardProductivity = memo(({ model }: DashboardProductivityProps) => {
  const chartData = useMemo(() => model.data, [model.data]);
  const legendItems = useMemo(() => Object.entries(model.config), [model.config]);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{model.title}</CardTitle>
        <CardDescription>{model.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-muted-foreground">
          {legendItems.map(([key, item]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color ?? "currentColor" }} />
              <span>{item.label ?? key}</span>
            </div>
          ))}
        </div>
        <div className="relative w-full">
          <ChartContainer config={model.config} className="h-[220px] sm:h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ left: 0, right: 12, top: 4, bottom: 12 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={model.palette.grid} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={6}
                  stroke={model.palette.axis}
                  interval={0}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={4}
                  stroke={model.palette.axis}
                  width={36}
                />
                <Tooltip
                  content={<ChartTooltipContent />}
                  cursor={{ fill: model.palette.grid, fillOpacity: 0.16 }}
                />
                <Bar
                  dataKey="focusMinutes"
                  fill={model.palette.focus}
                  radius={[8, 8, 0, 0]}
                  maxBarSize={32}
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="reviewSessions"
                  fill={model.palette.review}
                  radius={[8, 8, 0, 0]}
                  maxBarSize={32}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
});

DashboardProductivity.displayName = "DashboardProductivity";
