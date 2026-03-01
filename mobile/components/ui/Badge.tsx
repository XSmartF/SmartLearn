/**
 * Badge – mirrors web's 7-variant badge with neumorphic shadow.
 */
import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type ViewStyle, type TextStyle } from 'react-native';
import { Brand, NeuShadow, Radius } from '@/constants/theme';

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'warning' | 'success' | 'info' | 'outline';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'sm' | 'md';
}

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  default: { bg: `${Brand.primary}18`, text: Brand.primary, border: `${Brand.primary}30` },
  secondary: { bg: `${Brand.secondary}20`, text: Brand.gray600, border: `${Brand.secondary}30` },
  destructive: { bg: `${Brand.error}15`, text: Brand.error, border: `${Brand.error}25` },
  warning: { bg: `${Brand.warning}15`, text: '#92400e', border: `${Brand.warning}30` },
  success: { bg: `${Brand.success}15`, text: Brand.success, border: `${Brand.success}25` },
  info: { bg: `${Brand.info}15`, text: Brand.info, border: `${Brand.info}25` },
  outline: { bg: 'transparent', text: Brand.gray500, border: Brand.lightBorder },
};

export function Badge({ children, variant = 'default', style, textStyle, size = 'sm' }: BadgeProps) {
  const v = VARIANT_STYLES[variant];
  const isSmall = size === 'sm';
  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: v.bg,
          borderColor: v.border,
          paddingHorizontal: isSmall ? 8 : 12,
          paddingVertical: isSmall ? 3 : 5,
        },
        NeuShadow.sm,
        style,
      ]}
    >
      {typeof children === 'string' ? (
        <Text style={[styles.text, { color: v.text, fontSize: isSmall ? 11 : 13 }, textStyle]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  text: {
    fontWeight: '700',
  },
});
