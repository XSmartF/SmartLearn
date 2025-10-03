import { useId } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ChartContainer, ChartLegendContent, ChartTooltipContent } from "@/shared/components/ui/chart";
import type { DashboardProductivitySectionModel } from "@/features/dashboard/types";

interface DashboardProductivityProps {
  model: DashboardProductivitySectionModel;
}

export function DashboardProductivity({ model }: DashboardProductivityProps) {
  const focusGradientId = useId();
  const reviewGradientId = useId();

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{model.title}</CardTitle>
        <CardDescription>{model.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-[320px]">
        <ChartContainer config={model.config} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={model.data} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id={focusGradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={model.palette.focus} stopOpacity={0.5} />
                  <stop offset="95%" stopColor={model.palette.focus} stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id={reviewGradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={model.palette.review} stopOpacity={0.45} />
                  <stop offset="95%" stopColor={model.palette.review} stopOpacity={0.08} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={model.palette.grid} />
              <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={6} stroke={model.palette.axis} />
              <YAxis tickLine={false} axisLine={false} tickMargin={4} stroke={model.palette.axis} />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend verticalAlign="top" align="right" content={<ChartLegendContent />} wrapperStyle={{ fontSize: "12px", paddingBottom: "8px" }} iconSize={10} />
              <Area type="monotone" dataKey="focusMinutes" stroke={model.palette.focus} fill={`url(#${focusGradientId})`} strokeWidth={2} />
              <Area type="monotone" dataKey="reviewSessions" stroke={model.palette.review} fill={`url(#${reviewGradientId})`} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
