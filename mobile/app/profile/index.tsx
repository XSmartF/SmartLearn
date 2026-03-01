import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';


import { mobileDataService } from '@/shared/services';
import { useI18n } from '@/shared/i18n';
import { Brand, Colors, NeuShadow, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Screen, SectionCard, DarkCard, GlassCard } from '@/shared/ui/screen';

import { IllustrationIcon } from '@/components/ui/IllustrationIcon';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';

export default function ProfileScreen() {
  const { t, locale } = useI18n();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    (async () => {
      const profile = await mobileDataService.getProfile();
      setDisplayName(profile.displayName);
      setEmail(profile.email);
    })();
  }, []);

  const save = async () => {
    await mobileDataService.updateProfile({ displayName });
    Alert.alert(t('settings_title'), locale === 'vi' ? 'Đã lưu thay đổi.' : 'Changes saved.');
  };

  // TODO: fetch real stats from service instead of hardcoded values
  const stats = { totalCards: 248, studySessions: 32, streak: 7, level: 12, xp: 850, xpMax: 1200, mastery: 72 };
  return (
    <Screen>
      {/* ── HERO ── */}
      <Animated.View entering={FadeInDown.duration(500).springify()}>
        <DarkCard>
          <View style={styles.heroRow}>
            <View style={styles.avatarOuter}>
              <View style={[styles.avatar, { borderColor: Brand.primaryLight }]}>
                <MaterialIcons name="person" size={42} color={Brand.primaryLight} />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroName}>{displayName || 'Learner'}</Text>
              <Text style={styles.heroEmail}>{email}</Text>
              <View style={styles.heroBadges}>
                <Badge variant="default">Level {stats.level ?? 0}</Badge>
                <Badge variant="success">{stats.streak ?? 0}-day streak</Badge>
              </View>
            </View>
          </View>

          {/* XP bar inside hero */}
          <View style={{ marginTop: 12 }}>
            <ProgressBar label="XP Progress" value={stats.xpMax > 0 ? Math.round((stats.xp / stats.xpMax) * 100) : 0} color={Brand.chart4} />
            <Text style={styles.heroXp}>{stats.xp ?? 0} / {stats.xpMax ?? 0} XP</Text>
          </View>
        </DarkCard>
      </Animated.View>

      {/* ── STATS GRID ── */}
      <Animated.View entering={FadeInDown.delay(120).duration(500).springify()}>
        <GlassCard>
          <View style={styles.statsGrid}>
            <StatBox icon="style" color={Brand.primary} label={locale === 'vi' ? 'Thẻ' : 'Cards'} value={(stats.totalCards ?? 0).toString()} />
            <StatBox icon="school" color={Brand.chart2} label={locale === 'vi' ? 'Phiên học' : 'Sessions'} value={(stats.studySessions ?? 0).toString()} />
            <StatBox icon="insights" color={Brand.chart3} label={locale === 'vi' ? 'Chấm điểm' : 'Mastery'} value={`${stats.mastery ?? 0}%`} />
          </View>
        </GlassCard>
      </Animated.View>

      {/* ── MASTERY RING ── */}
      <Animated.View entering={FadeInDown.delay(230).duration(500).springify()}>
        <SectionCard>
          <View style={styles.ringRow}>
            <CircularProgress value={stats.mastery} size={90} strokeWidth={10} color={Brand.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('dashboard_mastery')}</Text>
              <Text style={[styles.subLabel, { color: colors.textSecondary }]}>
                {locale === 'vi' ? 'Tỉ lệ ghi nhớ tổng thể' : 'Overall retention rate'}
              </Text>
              <ProgressBar label="" value={stats.mastery} color={Brand.chart3} />
            </View>
          </View>
        </SectionCard>
      </Animated.View>

      {/* ── EDIT PROFILE ── */}
      <Animated.View entering={FadeInDown.delay(330).duration(500).springify()}>
        <SectionCard>
          <View style={styles.sectionHeader}>
            <IllustrationIcon icon={<MaterialIcons name="edit" size={18} color="#fff" />} variant="primary" size="sm" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('profile_title')}</Text>
          </View>

          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('profile_display_name_placeholder')}</Text>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
            placeholderTextColor={colors.textSecondary}
          />

          <Pressable onPress={save} style={({ pressed }) => [styles.saveBtn, pressed && styles.pressed]}>
            <MaterialIcons name="save" size={18} color="#fff" />
            <Text style={styles.saveBtnText}>{t('profile_save')}</Text>
          </Pressable>
        </SectionCard>
      </Animated.View>

      {/* ── DANGER ZONE ── */}
      <Animated.View entering={FadeInDown.delay(430).duration(500).springify()}>
        <SectionCard style={{ borderWidth: 1, borderColor: `${Brand.error}25` }}>
          <View style={styles.sectionHeader}>
            <IllustrationIcon icon={<MaterialIcons name="warning" size={18} color="#fff" />} variant="warning" size="sm" />
            <Text style={[styles.sectionTitle, { color: Brand.error }]}>{locale === 'vi' ? 'Vùng nguy hiểm' : 'Danger zone'}</Text>
          </View>
          <Pressable
            onPress={() => Alert.alert('Reset', locale === 'vi' ? 'Bạn chắc chắn?' : 'Are you sure?')}
            style={[styles.dangerBtn]}
          >
            <MaterialIcons name="delete-forever" size={18} color={Brand.error} />
            <Text style={{ color: Brand.error, fontWeight: '700', fontSize: 14 }}>
              {locale === 'vi' ? 'Xoá tài khoản' : 'Delete account'}
            </Text>
          </Pressable>
        </SectionCard>
      </Animated.View>
    </Screen>
  );
}

/* ─── Small stat box ─── */
function StatBox({ icon, color, label, value }: { icon: string; color: string; label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <MaterialIcons name={icon as any} size={22} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatarOuter: { alignItems: 'center' },
  avatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, alignItems: 'center', justifyContent: 'center', backgroundColor: `${Brand.primary}12` },
  heroName: { color: '#fff', fontSize: 20, fontWeight: '900' },
  heroEmail: { color: Brand.gray400, fontSize: 12, fontWeight: '500', marginTop: 2 },
  heroBadges: { flexDirection: 'row', gap: 6, marginTop: 6 },
  heroXp: { color: Brand.gray400, fontSize: 11, fontWeight: '600', textAlign: 'right', marginTop: 2 },

  statsGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  statBox: { alignItems: 'center', gap: 2 },
  statValue: { fontSize: 22, fontWeight: '900' },
  statLabel: { color: Brand.gray400, fontSize: 11, fontWeight: '600' },

  ringRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '800' },
  subLabel: { fontSize: 12, marginBottom: 6 },

  inputLabel: { fontSize: 12, fontWeight: '700', marginTop: 8, marginBottom: 4 },
  input: {
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },

  saveBtn: {
    borderRadius: Radius.md,
    backgroundColor: Brand.primary,
    paddingVertical: 13,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
    ...NeuShadow.sm,
  },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },

  dangerBtn: {
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: `${Brand.error}30`,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  pressed: { opacity: 0.82 },
});
