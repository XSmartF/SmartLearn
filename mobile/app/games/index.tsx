import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import type { MobileGameMode } from '@/shared/models/app';
import { mobileDataService } from '@/shared/services';
import { useI18n } from '@/shared/i18n';
import { Brand, Colors, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Screen, SectionCard, GlassCard } from '@/shared/ui/screen';

import { IllustrationIcon } from '@/components/ui/IllustrationIcon';
import { Badge } from '@/components/ui/Badge';

const GAME_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  quiz: 'quiz', memory: 'grid-view', speed: 'speed', 'word-scramble': 'abc',
};
const GAME_VARIANTS: Record<string, 'primary' | 'success' | 'warning' | 'accent'> = {
  quiz: 'primary', memory: 'success', speed: 'warning', 'word-scramble': 'accent',
};
const GAME_COLORS: Record<string, string> = {
  quiz: Brand.chart2, memory: Brand.chart3, speed: Brand.chart4, 'word-scramble': Brand.chart5,
};

export default function GamesScreen() {
  const { t } = useI18n();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const isDark = scheme === 'dark';
  const [modes, setModes] = useState<MobileGameMode[]>([]);

  useEffect(() => {
    let cancelled = false;
    mobileDataService.listGameModes().then((data) => { if (!cancelled) setModes(data); });
    return () => { cancelled = true; };
  }, []);

  const getModeTitle = (mode: MobileGameMode) => {
    const map: Record<string, string> = {
      quiz: t('game_mode_quiz_title'), memory: t('game_mode_memory_title'),
      speed: t('game_mode_speed_title'), 'word-scramble': t('game_mode_word_scramble_title'),
    };
    return map[mode.id] || mode.title;
  };

  const getModeDesc = (mode: MobileGameMode) => {
    const map: Record<string, string> = {
      quiz: t('game_mode_quiz_desc'), memory: t('game_mode_memory_desc'),
      speed: t('game_mode_speed_desc'), 'word-scramble': t('game_mode_word_scramble_desc'),
    };
    return map[mode.id] || mode.description;
  };

  return (
    <Screen>
      <Animated.View entering={FadeInDown.duration(500).springify()}>
        <GlassCard>
          <View style={styles.headerRow}>
            <IllustrationIcon icon="sports-esports" variant="accent" size="md" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.text }]}>{t('games_title')}</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('games_subtitle')}</Text>
            </View>
            <Badge variant="info">{modes.length.toString()}</Badge>
          </View>
        </GlassCard>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(150).duration(500).springify()}>
        <SectionCard>
          {modes.map((mode, idx) => {
            const modeTitle = getModeTitle(mode);
            const modeColor = GAME_COLORS[mode.id] || Brand.chart2;
            const modeVariant = GAME_VARIANTS[mode.id] || 'primary';
            return (
              <Animated.View key={mode.id} entering={FadeInRight.delay(200 + idx * 80).duration(400)}>
                <Pressable
                  onPress={() => Alert.alert(t('games_alert_title'), t('games_alert_start', { name: modeTitle }))}
                  style={({ pressed }) => [
                    styles.gameCard,
                    {
                      backgroundColor: isDark ? Brand.darkSurface : Brand.white,
                      borderColor: isDark ? Brand.darkBorder : Brand.lightBorder,
                    },
                    pressed && styles.pressed,
                  ]}
                >
                  <IllustrationIcon
                    icon={GAME_ICONS[mode.id] || 'extension'}
                    variant={modeVariant}
                    size="md"
                  />
                  <View style={styles.gameBody}>
                    <Text style={[styles.gameTitle, { color: colors.text }]}>{modeTitle}</Text>
                    <Text style={[styles.gameDesc, { color: colors.textSecondary }]}>{getModeDesc(mode)}</Text>
                  </View>
                  <Pressable style={[styles.playBtn, { backgroundColor: modeColor }]}>
                    <MaterialIcons name="play-arrow" size={20} color="#fff" />
                  </Pressable>
                </Pressable>
              </Animated.View>
            );
          })}
        </SectionCard>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 20, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 2 },
  gameCard: {
    borderWidth: 1, borderRadius: Radius.lg,
    padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  gameBody: { flex: 1, gap: 2 },
  gameTitle: { fontWeight: '800', fontSize: 15 },
  gameDesc: { fontSize: 12, lineHeight: 16 },
  playBtn: {
    width: 38, height: 38, borderRadius: Radius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
});
