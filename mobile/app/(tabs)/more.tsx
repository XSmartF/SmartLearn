import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Screen, SectionCard, DarkCard } from '@/shared/ui/screen';
import { useSession } from '@/shared/auth/session';
import { useI18n } from '@/shared/i18n';
import { Brand, Colors, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { IllustrationIcon } from '@/components/ui/IllustrationIcon';
import { CircularProgress } from '@/components/ui/CircularProgress';

const MENU_ITEMS: {
  key: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  route: string;
  variant: 'primary' | 'success' | 'warning' | 'info' | 'accent';
}[] = [
  { key: 'more_menu_review', icon: 'rate-review', color: Brand.chart3, route: '/review', variant: 'success' },
  { key: 'more_menu_test', icon: 'fact-check', color: Brand.chart4, route: '/test', variant: 'warning' },
  { key: 'more_menu_games', icon: 'sports-esports', color: Brand.chart5, route: '/games', variant: 'accent' },
  { key: 'more_menu_notifications', icon: 'notifications', color: Brand.chart2, route: '/notifications', variant: 'info' },
  { key: 'more_menu_settings', icon: 'settings', color: Brand.gray500, route: '/settings', variant: 'primary' },
  { key: 'more_menu_profile', icon: 'person', color: Brand.chart3, route: '/profile', variant: 'success' },
];

export default function MoreTabScreen() {
  const router = useRouter();
  const { signOut, user } = useSession();
  const { t } = useI18n();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const isDark = scheme === 'dark';

  return (
    <Screen>
      {/* Profile hero */}
      <Animated.View entering={FadeInDown.duration(500).springify()}>
        <DarkCard style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={[styles.avatarLarge, { borderColor: Brand.primaryLight }]}>
              <MaterialIcons name="person" size={32} color={Brand.primaryLight} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.displayName}>{user?.displayName || 'SmartLearner'}</Text>
              <Text style={styles.email}>{user?.email || ''}</Text>
            </View>
            <CircularProgress value={75} size={50} strokeWidth={5} color={Brand.primaryLight} label="" />
          </View>
        </DarkCard>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).duration(500).springify()}>
        <SectionCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('more_title')}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('more_subtitle')}</Text>
        </SectionCard>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(500).springify()}>
        <SectionCard>
          {MENU_ITEMS.map((item, idx) => (
            <Animated.View key={item.key} entering={FadeInRight.delay(250 + idx * 60).duration(350)}>
              <Pressable
                onPress={() => router.push(item.route as any)}
                style={({ pressed }) => [
                  styles.menuItem,
                  {
                    backgroundColor: isDark ? Brand.darkSurface : Brand.white,
                    borderColor: isDark ? Brand.darkBorder : Brand.lightBorder,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <IllustrationIcon icon={item.icon} variant={item.variant} size="sm" />
                <Text style={[styles.menuText, { color: colors.text }]}>{t(item.key as any)}</Text>
                <MaterialIcons name="chevron-right" size={20} color={Brand.gray400} />
              </Pressable>
            </Animated.View>
          ))}

          {/* Sign out */}
          <Animated.View entering={FadeInRight.delay(550).duration(350)}>
            <Pressable
              onPress={() => signOut().catch(console.error)}
              style={({ pressed }) => [
                styles.menuItem,
                { backgroundColor: `${Brand.error}08`, borderColor: `${Brand.error}25` },
                pressed && styles.pressed,
              ]}
            >
              <IllustrationIcon icon="logout" variant="warning" size="sm" />
              <Text style={[styles.menuText, { color: Brand.error }]}>{t('more_menu_sign_out')}</Text>
              <MaterialIcons name="chevron-right" size={20} color={Brand.error} />
            </Pressable>
          </Animated.View>
        </SectionCard>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileCard: { borderRadius: Radius.xl, padding: 20, gap: 8 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatarLarge: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: Brand.darkSurface,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3,
  },
  displayName: { fontSize: 20, fontWeight: '800', color: '#fff' },
  email: { fontSize: 13, color: Brand.gray300, fontWeight: '600', marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  subtitle: { fontSize: 13, lineHeight: 18 },
  menuItem: {
    borderWidth: 1, borderRadius: Radius.lg,
    paddingHorizontal: 14, paddingVertical: 13,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  menuText: { flex: 1, fontWeight: '700', fontSize: 14 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
});
