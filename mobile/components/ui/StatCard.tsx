/**
 * StatCard – neumorphic stat card matching web's StatCard.
 * Shows icon · label · value · optional helper text.
 * Accepts `icon` as a MaterialIcons name (string) or a ReactNode.
 */
import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Brand, Colors, NeuShadow, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface StatCardProps {
  icon?: string | ReactNode;
  label: string;
  value: string | number;
  helper?: string;
  tintColor?: string;
  style?: ViewStyle;
}

export function StatCard({ icon, label, value, helper, tintColor = Brand.primary, style }: StatCardProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const isDark = scheme === 'dark';

  const safeValue = typeof value === 'number' && !Number.isFinite(value) ? 0 : value;

  const iconNode =
    typeof icon === 'string'
      ? <MaterialIcons name={icon as keyof typeof MaterialIcons.glyphMap} size={20} color={tintColor} />
      : icon;

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
        },
        isDark ? NeuShadow.dark.sm : NeuShadow.sm,
        style,
      ]}
    >
      {iconNode && (
        <View style={[styles.iconWrap, { backgroundColor: `${tintColor}18` }]}>{iconNode}</View>
      )}
      <Text style={[styles.value, { color: colors.text }]}>{safeValue}</Text>
      {helper ? (
        <Text style={[styles.helper, { color: colors.textSecondary }]}>{helper}</Text>
      ) : null}
      <Text style={[styles.label, { color: colors.textSecondary }]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  helper: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: -2,
  },
});
