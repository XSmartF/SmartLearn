import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useI18n } from '@/shared/i18n';
import { Brand, Colors, NeuShadow, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Screen, SectionCard, GlassCard } from '@/shared/ui/screen';

import { IllustrationIcon } from '@/components/ui/IllustrationIcon';
import { Badge } from '@/components/ui/Badge';
import { authService } from '@/shared/services';

type LangKey = 'vi' | 'en';

export default function SettingsScreen() {
  const { t, locale, setLanguage } = useI18n();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const isDark = scheme === 'dark';

  const [notifEnabled, setNotifEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [dailyGoal, setDailyGoal] = useState(20); // cards per day

  const langs: { key: LangKey; label: string; flag: string }[] = [
    { key: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
    { key: 'en', label: 'English', flag: '🇬🇧' },
  ];

  const goalOptions = [10, 20, 30, 50];

  const handleLogout = async () => {
    await authService.signOut();
  };

  return (
    <Screen>

      {/* ── Header ── */}
      <Animated.View entering={FadeInDown.duration(500).springify()}>
        <GlassCard>
          <View style={styles.headerRow}>
            <IllustrationIcon icon={<MaterialIcons name="settings" size={22} color="#fff" />} variant="primary" size="md" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.text }]}>{t('settings_title')}</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {locale === 'vi' ? 'Tuỳ chỉnh ứng dụng' : 'Customize your experience'}
              </Text>
            </View>
          </View>
        </GlassCard>
      </Animated.View>

      {/* ── Language ── */}
      <Animated.View entering={FadeInDown.delay(100).duration(500).springify()}>
        <SectionCard>
          <View style={styles.sectionHeader}>
            <IllustrationIcon icon="language" variant="info" size="sm" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('settings_language')}</Text>
          </View>

          <View style={styles.langRow}>
            {langs.map((l) => {
              const active = locale === l.key;
              return (
                <Pressable
                  key={l.key}
                  onPress={() => setLanguage(l.key)}
                  style={[
                    styles.langChip,
                    active
                      ? { backgroundColor: Brand.primary, ...NeuShadow.sm }
                      : { backgroundColor: isDark ? Brand.darkSurface : colors.inputBg, borderWidth: 1, borderColor: isDark ? Brand.darkBorder : Brand.lightBorder },
                  ]}
                >
                  <Text style={{ fontSize: 20 }}>{l.flag}</Text>
                  <Text style={[styles.langLabel, { color: active ? '#fff' : colors.text }]}>{l.label}</Text>
                  {active && <Badge variant="secondary">✓</Badge>}
                </Pressable>
              );
            })}
          </View>
        </SectionCard>
      </Animated.View>

      {/* ── Notifications ── */}
      <Animated.View entering={FadeInDown.delay(200).duration(500).springify()}>
        <SectionCard>
          <View style={styles.sectionHeader}>
            <IllustrationIcon icon="notifications" variant="warning" size="sm" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('notifications_title')}</Text>
          </View>

          <SettingToggle
            icon="notifications-active"
            label={locale === 'vi' ? 'Thông báo' : 'Push Notifications'}
            value={notifEnabled}
            onToggle={setNotifEnabled}
            colors={colors}
          />
          <SettingToggle
            icon="volume-up"
            label={locale === 'vi' ? 'Âm thanh' : 'Sounds'}
            value={soundEnabled}
            onToggle={setSoundEnabled}
            colors={colors}
          />
        </SectionCard>
      </Animated.View>

      {/* ── Study ── */}
      <Animated.View entering={FadeInDown.delay(300).duration(500).springify()}>
        <SectionCard>
          <View style={styles.sectionHeader}>
            <IllustrationIcon icon="school" variant="success" size="sm" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {locale === 'vi' ? 'Mục tiêu hàng ngày' : 'Daily Goal'}
            </Text>
          </View>

          <View style={styles.goalRow}>
            {goalOptions.map((g) => {
              const active = dailyGoal === g;
              return (
                <Pressable
                  key={g}
                  onPress={() => setDailyGoal(g)}
                  style={[
                    styles.goalChip,
                    active
                      ? { backgroundColor: Brand.primary, ...NeuShadow.sm }
                      : { backgroundColor: isDark ? Brand.darkSurface : colors.inputBg, borderWidth: 1, borderColor: isDark ? Brand.darkBorder : Brand.lightBorder },
                  ]}
                >
                  <Text style={[styles.goalNum, { color: active ? '#fff' : colors.text }]}>{g}</Text>
                  <Text style={[styles.goalUnit, { color: active ? '#fff' : colors.textSecondary }]}>
                    {locale === 'vi' ? 'thẻ' : 'cards'}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <SettingToggle
            icon="sync"
            label={locale === 'vi' ? 'Tự động đồng bộ' : 'Auto sync'}
            value={autoSync}
            onToggle={setAutoSync}
            colors={colors}
          />
        </SectionCard>
      </Animated.View>

      {/* ── Account ── */}
      <Animated.View entering={FadeInDown.delay(400).duration(500).springify()}>
        <SectionCard>
          <View style={styles.sectionHeader}>
            <IllustrationIcon icon={<MaterialIcons name="logout" size={18} color="#fff" />} variant="warning" size="sm" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {locale === 'vi' ? 'Tài khoản' : 'Account'}
            </Text>
          </View>

          <Pressable onPress={handleLogout} style={[styles.logoutBtn]}>
            <MaterialIcons name="logout" size={18} color={Brand.error} />
            <Text style={{ color: Brand.error, fontWeight: '700', fontSize: 14 }}>
              {locale === 'vi' ? 'Đăng xuất' : 'Sign out'}
            </Text>
          </Pressable>
        </SectionCard>
      </Animated.View>
    </Screen>
  );
}

/* ─── Toggle Row Component ─── */
function SettingToggle({
  icon,
  label,
  value,
  onToggle,
  colors,
}: {
  icon: string;
  label: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  colors: Record<string, string>;
}) {
  return (
    <View style={styles.toggleRow}>
      <MaterialIcons name={icon as any} size={20} color={Brand.primary} />
      <Text style={[styles.toggleLabel, { color: colors.text }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: Brand.gray300, true: Brand.primaryLight }}
        thumbColor={value ? Brand.primary : '#f4f3f4'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 20, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 2 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800' },

  langRow: { gap: 10 },
  langChip: {
    borderRadius: Radius.lg,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  langLabel: { fontWeight: '700', fontSize: 15, flex: 1 },

  goalRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  goalChip: {
    flex: 1,
    borderRadius: Radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  goalNum: { fontSize: 22, fontWeight: '900' },
  goalUnit: { fontSize: 10, fontWeight: '700' },

  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  toggleLabel: { flex: 1, fontWeight: '600', fontSize: 14 },

  logoutBtn: {
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: `${Brand.error}30`,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
