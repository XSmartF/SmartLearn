/**
 * CircularProgress – animated SVG donut/ring progress.
 * Used for mastery %, completion %, etc.
 */
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Brand, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface CircularProgressProps {
  /** 0 – 100 */
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  showValue?: boolean;
  style?: ViewStyle;
}

export function CircularProgress({
  value,
  size = 100,
  strokeWidth = 10,
  color = Brand.primary,
  label,
  showValue = true,
  style,
}: CircularProgressProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const isDark = scheme === 'dark';
  const safeValue = Number.isFinite(value) ? value : 0;
  const clamped = Math.min(100, Math.max(0, safeValue));

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - clamped / 100);
  const center = size / 2;

  return (
    <View style={[styles.root, style]}>
      <Svg width={size} height={size}>
        {/* Background ring */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={isDark ? Brand.darkSurface : Brand.gray200}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress ring */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      {showValue && (
        <View style={[styles.labelOverlay, { width: size, height: size }]}>
          <Text style={[styles.value, { color: colors.text }]}>{Math.round(clamped)}%</Text>
          {label && <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 20,
    fontWeight: '800',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
});
