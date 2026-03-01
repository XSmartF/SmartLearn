/**
 * MiniBarChart – lightweight SVG bar chart for dashboard.
 * Shows grouped bars for focusMinutes + reviewSessions (web parity).
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Rect, Text as SvgText, Line } from 'react-native-svg';
import { Brand, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface BarChartDataPoint {
  label: string;
  value1: number;
  value2: number;
}

interface MiniBarChartProps {
  data: BarChartDataPoint[];
  color1?: string;
  color2?: string;
  legend1?: string;
  legend2?: string;
  height?: number;
}

export function MiniBarChart({
  data,
  color1 = Brand.primary,
  color2 = Brand.chart2,
  legend1 = 'Focus',
  legend2 = 'Review',
  height = 180,
}: MiniBarChartProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const isDark = scheme === 'dark';

  if (!data.length) return null;

  const maxVal = Math.max(1, ...data.map((d) => Math.max(d.value1 || 0, d.value2 || 0)));
  const chartWidth = data.length * 56;
  const barW = 14;
  const gap = 4;
  const topPad = 8;
  const bottomPad = 24;
  const chartH = height - topPad - bottomPad;

  return (
    <View style={styles.root}>
      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: color1 }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>{legend1}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: color2 }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>{legend2}</Text>
        </View>
      </View>

      <Svg width="100%" height={height} viewBox={`0 0 ${chartWidth} ${height}`}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = topPad + chartH * (1 - ratio);
          return (
            <Line
              key={ratio}
              x1={0}
              y1={y}
              x2={chartWidth}
              y2={y}
              stroke={isDark ? Brand.darkBorder : Brand.gray200}
              strokeWidth={1}
              strokeDasharray="4,4"
            />
          );
        })}

        {data.map((d, i) => {
          const cx = i * 56 + 28;
          const h1 = ((d.value1 || 0) / maxVal) * chartH;
          const h2 = ((d.value2 || 0) / maxVal) * chartH;
          const y1 = topPad + chartH - h1;
          const y2 = topPad + chartH - h2;

          return (
            <React.Fragment key={i}>
              <Rect x={cx - barW - gap / 2} y={y1} width={barW} height={h1} rx={6} ry={6} fill={color1} opacity={0.9} />
              <Rect x={cx + gap / 2} y={y2} width={barW} height={h2} rx={6} ry={6} fill={color2} opacity={0.9} />
              <SvgText
                x={cx}
                y={height - 4}
                textAnchor="middle"
                fontSize={10}
                fontWeight="600"
                fill={isDark ? Brand.gray400 : Brand.gray500}
              >
                {d.label}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 6,
  },
  legend: {
    flexDirection: 'row',
    gap: 14,
    paddingLeft: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
