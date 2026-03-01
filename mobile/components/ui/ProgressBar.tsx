/**
 * ProgressBar – animated horizontal progress bar with label.
 */
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { Brand, Colors, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ProgressBarProps {
  /** 0 – 100 */
  value: number;
  label?: string;
  showPercent?: boolean;
  color?: string;
  height?: number;
  style?: ViewStyle;
}

export function ProgressBar({
  value,
  label,
  showPercent = true,
  color = Brand.primary,
  height = 8,
  style,
}: ProgressBarProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const isDark = scheme === 'dark';
  const animated = useRef(new Animated.Value(0)).current;
  const safeValue = Number.isFinite(value) ? value : 0;
  const clamped = Math.min(100, Math.max(0, safeValue));

  useEffect(() => {
    Animated.spring(animated, {
      toValue: clamped,
      useNativeDriver: false,
      friction: 12,
      tension: 40,
    }).start();
  }, [clamped, animated]);

  const width = animated.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.root, style]}>
      {(label || showPercent) && (
        <View style={styles.labelRow}>
          {label ? <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text> : null}
          {showPercent ? (
            <Text style={[styles.percent, { color: colors.text }]}>{Math.round(clamped)}%</Text>
          ) : null}
        </View>
      )}
      <View style={[styles.track, { height, backgroundColor: isDark ? Brand.darkSurface : Brand.gray200 }]}>
        <Animated.View style={[styles.fill, { width, height, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  percent: {
    fontSize: 12,
    fontWeight: '700',
  },
  track: {
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: Radius.full,
  },
});
