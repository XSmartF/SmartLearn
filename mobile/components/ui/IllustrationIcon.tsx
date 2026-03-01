/**
 * IllustrationIcon – gradient-like coloured icon container
 * matching the web's IllustrationIcon component.
 */
import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Brand, NeuShadow, Radius } from '@/constants/theme';

export type IconVariant = 'primary' | 'success' | 'warning' | 'info' | 'accent';
type IconSize = 'sm' | 'md' | 'lg';

interface IllustrationIconProps {
  icon: keyof typeof MaterialIcons.glyphMap | ReactNode;
  variant?: IconVariant;
  size?: IconSize;
  style?: ViewStyle;
}

const VARIANT_BG: Record<IconVariant, string> = {
  primary: Brand.primary,
  success: Brand.success,
  warning: Brand.warning,
  info: Brand.info,
  accent: Brand.accent,
};

const SIZE_MAP: Record<IconSize, { width: number; radius: number; iconSize: number }> = {
  sm: { width: 40, radius: Radius.sm, iconSize: 20 },
  md: { width: 52, radius: Radius.md, iconSize: 24 },
  lg: { width: 72, radius: Radius.xl, iconSize: 32 },
};

export function IllustrationIcon({ icon, variant = 'primary', size = 'md', style }: IllustrationIconProps) {
  const s = SIZE_MAP[size];
  const content = typeof icon === 'string'
    ? <MaterialIcons name={icon as keyof typeof MaterialIcons.glyphMap} size={s.iconSize} color="#fff" />
    : icon;

  return (
    <View
      style={[
        styles.root,
        {
          width: s.width,
          height: s.width,
          borderRadius: s.radius,
          backgroundColor: VARIANT_BG[variant],
        },
        NeuShadow.sm,
        style,
      ]}
    >
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
