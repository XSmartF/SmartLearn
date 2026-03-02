import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

import type { MobileDashboardSnapshot } from '@/shared/models/app';
import { dashboardRepository } from '@/shared/services';
import { useI18n } from '@/shared/i18n';
import { useSession } from '@/shared/auth/session';
import { Brand, Colors, NeuShadow, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Screen, SectionCard, GlassCard } from '@/shared/ui/screen';

import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { IllustrationIcon } from '@/components/ui/IllustrationIcon';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { MiniBarChart } from '@/components/ui/MiniBarChart';
import { MiniAreaChart } from '@/components/ui/MiniAreaChart';

/* ── mock chart data (mirrors web DashboardProductivity) ──────── */
const WEEKLY_DATA = [
  { label: 'T2', value1: 25, value2: 15 },
  { label: 'T3', value1: 40, value2: 20 },
  { label: 'T4', value1: 30, value2: 35 },
  { label: 'T5', value1: 55, value2: 25 },
  { label: 'T6', value1: 45, value2: 30 },
  { label: 'T7', value1: 35, value2: 40 },
  { label: 'CN', value1: 60, value2: 20 },
];

const TREND_DATA = [
  { label: 'W1', value: 30 },
  { label: 'W2', value: 45 },
  { label: 'W3', value: 38 },
  { label: 'W4', value: 55 },
  { label: 'W5', value: 48 },
  { label: 'W6', value: 65 },
];

export default function DashboardScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { user } = useSession();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const isDark = scheme === 'dark';
  const [snapshot, setSnapshot] = useState<MobileDashboardSnapshot | null>(null);

  useEffect(() => {
    let cancelled = false;
    dashboardRepository.getDashboardSnapshot().then((data) => {
      if (!cancelled) setSnapshot(data);
    });
    return () => { cancelled = true; };
  }, []);

  const greeting = user?.displayName
    ? t('dashboard_greeting', { name: user.displayName })
    : t('dashboard_greeting_default');

  const masteryPercent = snapshot
    ? Math.min(100, Math.round(((snapshot.totalCards - snapshot.dueCards) / Math.max(snapshot.totalCards, 1)) * 100)) || 0
    : 0;

  return (
    <Screen>
      {/* ── Hero Card ─────────────────────────────────── */}
      <Animated.View entering={FadeInDown.duration(500).springify()}>
        <View style={[styles.heroCard, { backgroundColor: isDark ? Brand.darkCard : Brand.primary }]}>
          <View style={styles.heroRow}>
            <View style={[styles.avatarCircle, { borderColor: isDark ? Brand.primaryLight : '#fff' }]}>
              <MaterialIcons name="person" size={24} color={isDark ? Brand.primaryLight : '#fff'} />
            </View>
            <View style={styles.heroTextCol}>
              <Text style={styles.heroGreeting}>{greeting}</Text>
              <Text style={[styles.heroBrand, { color: isDark ? Brand.primaryLight : Brand.secondary }]}>
                SmartLearn
              </Text>
            </View>
            <Pressable
              onPress={() => router.push('/notifications')}
              style={[styles.notifBtn, { backgroundColor: isDark ? Brand.darkSurface : `${Brand.white}25` }]}
            >
              <MaterialIcons name="notifications-none" size={22} color="#fff" />
              {snapshot && snapshot.unreadNotifications > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>{snapshot.unreadNotifications}</Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* Illustration area */}
          <View style={[styles.illustrationRow, { backgroundColor: isDark ? Brand.darkSurface : `${Brand.white}15` }]}>
            <IllustrationIcon icon="laptop-mac" variant="primary" size="lg" />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.illustrationTitle}>{t('dashboard_level_up')}</Text>
              <Text style={styles.illustrationSub}>{t('dashboard_continue')}</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* ── 7-Day Productivity Chart ──────────────────── */}
      <Animated.View entering={FadeInDown.delay(100).duration(500).springify()}>
        <GlassCard>
          <View style={styles.sectionHeader}>
            <IllustrationIcon icon="bar-chart" variant="info" size="sm" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('dashboard_productivity')}</Text>
          </View>
          <MiniBarChart
            data={WEEKLY_DATA}
            color1={Brand.chart1}
            color2={Brand.chart2}
            legend1={t('dashboard_chart_focus')}
            legend2={t('dashboard_chart_review')}
          />
        </GlassCard>
      </Animated.View>

      {/* ── Mastery + Weekly Goal Row ─────────────────── */}
      <Animated.View entering={FadeInDown.delay(200).duration(500).springify()}>
        <View style={styles.dualRow}>
          {/* Mastery ring */}
          <SectionCard style={styles.dualCard}>
            <Text style={[styles.miniTitle, { color: colors.text }]}>{t('dashboard_mastery')}</Text>
            <CircularProgress
              value={masteryPercent}
              color={Brand.chart3}
              size={90}
              strokeWidth={8}
              label={`${masteryPercent}%`}
              showValue={false}
            />
            <Badge variant="success">{masteryPercent >= 50 ? 'Good' : 'Keep going'}</Badge>
          </SectionCard>

          {/* Weekly goal ring */}
          <SectionCard style={styles.dualCard}>
            <Text style={[styles.miniTitle, { color: colors.text }]}>{t('dashboard_weekly_goal')}</Text>
            <CircularProgress
              value={68}
              color={Brand.chart4}
              size={90}
              strokeWidth={8}
              label="68%"
            />
            <Badge variant="warning">4/7 days</Badge>
          </SectionCard>
        </View>
      </Animated.View>

      {/* ── Study Trend Area Chart ────────────────────── */}
      <Animated.View entering={FadeInDown.delay(300).duration(500).springify()}>
        <GlassCard>
          <View style={styles.sectionHeader}>
            <IllustrationIcon icon="trending-up" variant="success" size="sm" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('dashboard_study_trend')}</Text>
          </View>
          <MiniAreaChart data={TREND_DATA} color={Brand.chart3} id="trend" />
        </GlassCard>
      </Animated.View>

      {/* ── Library Progress ──────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(350).duration(500).springify()}>
        <SectionCard>
          <View style={styles.sectionHeader}>
            <IllustrationIcon icon="collections-bookmark" variant="accent" size="sm" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('dashboard_library_progress')}</Text>
          </View>
          <ProgressBar label="English vocab" value={72} color={Brand.chart1} />
          <ProgressBar label="Biology terms" value={45} color={Brand.chart2} />
          <ProgressBar label="History dates" value={88} color={Brand.chart3} />
        </SectionCard>
      </Animated.View>

      {/* ── Quick Stats Section ───────────────────────── */}
      <Animated.View entering={FadeInDown.delay(400).duration(500).springify()}>
        <SectionCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('dashboard_quick_stats')}</Text>
          <View style={styles.quickStatsGrid}>
            <QuickStat
              icon="style"
              label={t('dashboard_stat_cards')}
              value={snapshot?.totalCards || 0}
              color={Brand.chart1}
              isDark={isDark}
            />
            <QuickStat
              icon="event"
              label={t('dashboard_stat_events')}
              value={snapshot?.upcomingEvents || 0}
              color={Brand.chart3}
              isDark={isDark}
            />
            <QuickStat
              icon="notifications"
              label={t('dashboard_stat_unread')}
              value={snapshot?.unreadNotifications || 0}
              color={Brand.chart5}
              isDark={isDark}
            />
            <QuickStat
              icon="library-books"
              label={t('dashboard_stat_libraries')}
              value={snapshot?.totalLibraries || 0}
              color={Brand.chart2}
              isDark={isDark}
            />
          </View>
        </SectionCard>
      </Animated.View>

      {/* ── Quick Actions ─────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(450).duration(500).springify()}>
        <SectionCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('dashboard_quick_actions')}</Text>
          <QuickAction
            icon="library-books"
            label={t('dashboard_action_libraries')}
            onPress={() => router.push('/(tabs)/libraries')}
            isDark={isDark}
            color={Brand.chart1}
          />
          <QuickAction
            icon="school"
            label={t('dashboard_action_study')}
            onPress={() => router.push('/(tabs)/study')}
            isDark={isDark}
            color={Brand.chart2}
          />
          <QuickAction
            icon="fact-check"
            label={t('dashboard_action_test')}
            onPress={() => router.push('/test')}
            isDark={isDark}
            color={Brand.chart4}
          />
          <QuickAction
            icon="sports-esports"
            label={t('dashboard_action_games')}
            onPress={() => router.push('/games')}
            isDark={isDark}
            color={Brand.chart5}
          />
        </SectionCard>
      </Animated.View>
    </Screen>
  );
}

/* ── Sub-components ──────────────────────────────────── */

function QuickStat({
  icon,
  label,
  value,
  color,
  isDark,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: number;
  color: string;
  isDark: boolean;
}) {
  return (
    <View style={[styles.quickStatItem, { backgroundColor: isDark ? Brand.darkSurface : `${color}08` }]}>
      <View style={[styles.quickStatIcon, { backgroundColor: `${color}18` }]}>
        <MaterialIcons name={icon} size={16} color={color} />
      </View>
      <Text style={[styles.quickStatValue, { color: isDark ? '#fff' : Brand.dark }]}>{value}</Text>
      <Text style={styles.quickStatLabel}>{label}</Text>
    </View>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
  isDark,
  color,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
  isDark: boolean;
  color: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        {
          backgroundColor: isDark ? Brand.darkSurface : Brand.gray100,
          borderColor: isDark ? Brand.darkBorder : Brand.lightBorder,
        },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.actionIcon, { backgroundColor: `${color}18` }]}>
        <MaterialIcons name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.actionText, { color: isDark ? '#fff' : Brand.dark }]}>{label}</Text>
      <MaterialIcons name="arrow-forward-ios" size={14} color={Brand.gray400} />
    </Pressable>
  );
}

/* ── Styles ──────────────────────────────────────────── */

const styles = StyleSheet.create({
  /* Hero */
  heroCard: {
    borderRadius: Radius.xl,
    padding: 18,
    gap: 16,
    ...NeuShadow.md,
  },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: `${Brand.white}20`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  heroTextCol: { flex: 1 },
  heroGreeting: { fontSize: 18, fontWeight: '800', color: '#fff' },
  heroBrand: { fontSize: 12, fontWeight: '700', letterSpacing: 0.4 },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Brand.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notifBadgeText: { fontSize: 10, fontWeight: '800', color: '#fff' },
  illustrationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: Radius.lg,
    padding: 14,
  },
  illustrationTitle: { fontSize: 16, fontWeight: '800', color: '#fff' },
  illustrationSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },

  /* Section */
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { fontSize: 17, fontWeight: '800', flex: 1 },
  miniTitle: { fontSize: 14, fontWeight: '700', textAlign: 'center' },

  /* Dual row */
  dualRow: { flexDirection: 'row', gap: 10 },
  dualCard: { flex: 1, alignItems: 'center', gap: 8 },

  /* Quick stats grid */
  quickStatsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickStatItem: {
    width: '47%',
    borderRadius: Radius.md,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  quickStatIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickStatValue: { fontSize: 20, fontWeight: '800' },
  quickStatLabel: { fontSize: 11, color: Brand.gray400, fontWeight: '700' },

  /* Actions */
  actionButton: {
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: { flex: 1, fontWeight: '700', fontSize: 14 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
});
