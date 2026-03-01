/**
 * MiniAreaChart – lightweight SVG area/line chart for study trends.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Path, Circle, Line, Text as SvgText } from 'react-native-svg';
import { Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface AreaChartPoint {
  label: string;
  value: number;
}

interface MiniAreaChartProps {
  data: AreaChartPoint[];
  color?: string;
  height?: number;
  showDots?: boolean;
  /** Fill gradient id suffix for uniqueness */
  id?: string;
}

export function MiniAreaChart({
  data,
  color = Brand.primary,
  height = 140,
  showDots = true,
  id = 'area',
}: MiniAreaChartProps) {
  const scheme = useColorScheme() ?? 'light';
  const isDark = scheme === 'dark';

  if (data.length < 2) return null;

  const maxVal = Math.max(1, ...data.map((d) => d.value || 0));
  const topPad = 10;
  const bottomPad = 24;
  const leftPad = 8;
  const rightPad = 8;
  const chartW = 320;
  const chartH = height - topPad - bottomPad;
  const step = (chartW - leftPad - rightPad) / (data.length - 1);

  const points = data.map((d, i) => ({
    x: leftPad + i * step,
    y: topPad + chartH - ((d.value || 0) / maxVal) * chartH,
  }));

  // Smooth bezier path
  const pathD =
    points.reduce((acc, p, i) => {
      if (i === 0) return `M${p.x},${p.y}`;
      const prev = points[i - 1];
      const cpx = (prev.x + p.x) / 2;
      return `${acc} C${cpx},${prev.y} ${cpx},${p.y} ${p.x},${p.y}`;
    }, '') ?? '';

  const areaD = `${pathD} L${points[points.length - 1].x},${topPad + chartH} L${points[0].x},${topPad + chartH} Z`;

  const gradientId = `grad_${id}`;

  return (
    <View style={styles.root}>
      <Svg width="100%" height={height} viewBox={`0 0 ${chartW} ${height}`}>
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity={0.35} />
            <Stop offset="1" stopColor={color} stopOpacity={0.03} />
          </LinearGradient>
        </Defs>

        {/* Grid lines */}
        {[0, 0.5, 1].map((ratio) => {
          const y = topPad + chartH * (1 - ratio);
          return (
            <Line
              key={ratio}
              x1={leftPad}
              y1={y}
              x2={chartW - rightPad}
              y2={y}
              stroke={isDark ? Brand.darkBorder : Brand.gray200}
              strokeWidth={1}
              strokeDasharray="4,4"
            />
          );
        })}

        {/* Filled area */}
        <Path d={areaD} fill={`url(#${gradientId})`} />
        {/* Line */}
        <Path d={pathD} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" />

        {/* Dots */}
        {showDots &&
          points.map((p, i) => (
            <Circle key={i} cx={p.x} cy={p.y} r={3.5} fill={color} stroke="#fff" strokeWidth={1.5} />
          ))}

        {/* X labels */}
        {data.map((d, i) => (
          <SvgText
            key={i}
            x={points[i].x}
            y={height - 4}
            textAnchor="middle"
            fontSize={10}
            fontWeight="600"
            fill={isDark ? Brand.gray400 : Brand.gray500}
          >
            {d.label}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
  },
});
