import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Brand, NeuShadow, Radius } from '@/constants/theme';

interface ScreenProps {
  children: ReactNode;
  contentStyle?: ViewStyle;
  /** Use a dark surface regardless of system theme */
  forceDark?: boolean;
  /** Disable decorative orbs */
  plain?: boolean;
}

export function Screen({ children, contentStyle, forceDark, plain }: ScreenProps) {
  const systemScheme = useColorScheme();
  const scheme = forceDark ? 'dark' : (systemScheme ?? 'light');
  const colors = Colors[scheme];
  const isDark = scheme === 'dark';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {!plain && (
        <>
          {/* Decorative gradient orbs – purple theme */}
          <View
            pointerEvents="none"
            style={[
              styles.orb,
              {
                top: -90,
                right: -70,
                width: 220,
                height: 220,
                backgroundColor: Brand.primary,
                opacity: isDark ? 0.08 : 0.14,
              },
            ]}
          />
          <View
            pointerEvents="none"
            style={[
              styles.orb,
              {
                bottom: -70,
                left: -90,
                width: 200,
                height: 200,
                backgroundColor: Brand.accent,
                opacity: isDark ? 0.06 : 0.10,
              },
            ]}
          />
          <View
            pointerEvents="none"
            style={[
              styles.orb,
              {
                top: '40%',
                left: -40,
                width: 100,
                height: 100,
                backgroundColor: Brand.chart2,
                opacity: isDark ? 0.04 : 0.06,
              },
            ]}
          />
        </>
      )}

      <ScrollView
        contentContainerStyle={[styles.content, contentStyle]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function SectionCard({
  children,
  style,
}: {
  children: ReactNode;
  style?: ViewStyle;
}) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const isDark = scheme === 'dark';

  return (
    <View
      style={[
        styles.card,
        isDark ? NeuShadow.dark.sm : NeuShadow.sm,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** A card rendered with the primary-tinted glass styling */
export function GlassCard({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const scheme = useColorScheme() ?? 'light';
  const isDark = scheme === 'dark';

  return (
    <View
      style={[
        styles.card,
        isDark ? NeuShadow.dark.md : NeuShadow.md,
        {
          backgroundColor: isDark ? Brand.darkCard : '#FFFFFF',
          borderColor: isDark ? Brand.darkBorder : `${Brand.primary}18`,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** A card that is always rendered with dark styling (for hero sections, etc.) */
export function DarkCard({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return (
    <View
      style={[
        styles.card,
        NeuShadow.dark.md,
        { backgroundColor: Brand.darkCard, borderColor: Brand.darkBorder },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  content: {
    gap: 14,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 110,
  },
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: 16,
    gap: 12,
  },
});
