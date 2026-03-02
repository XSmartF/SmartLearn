import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

import type { MobileLibrary } from '@/shared/models/app';
import { libraryRepository } from '@/shared/services';
import { useI18n } from '@/shared/i18n';
import { Brand, Colors, NeuShadow, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Screen, SectionCard, DarkCard } from '@/shared/ui/screen';

import { Badge } from '@/components/ui/Badge';
import { IllustrationIcon } from '@/components/ui/IllustrationIcon';

const Q_COUNT_OPTIONS = [5, 10, 15, 20];

export default function TestConfigScreen() {
  const { t, locale } = useI18n();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const isDark = scheme === 'dark';
  const router = useRouter();

  const [libs, setLibs] = useState<MobileLibrary[]>([]);
  const [selectedLib, setSelectedLib] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState(10);

  useEffect(() => {
    libraryRepository.listLibraries().then((data) => {
      setLibs(data);
      if (data.length > 0) setSelectedLib(data[0].id);
    });
  }, []);

  const canStart = selectedLib !== null;

  const startTest = () => {
    if (!canStart) return;
    router.push({
      pathname: '/test/session',
      params: { libraryId: selectedLib!, questionCount: questionCount.toString() },
    });
  };

  return (
    <Screen>
      {/* ── Header ── */}
      <Animated.View entering={FadeInDown.duration(500).springify()}>
        <DarkCard>
          <View style={styles.headerRow}>
            <IllustrationIcon icon="quiz" variant="info" size="lg" />
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>{locale === 'vi' ? 'Kiểm tra kiến thức' : 'Knowledge Test'}</Text>
              <Text style={styles.heroSub}>
                {locale === 'vi'
                  ? 'Chọn thư viện và số câu hỏi để bắt đầu'
                  : 'Choose a library and question count to begin'}
              </Text>
            </View>
          </View>
        </DarkCard>
      </Animated.View>

      {/* ── Question Count ── */}
      <Animated.View entering={FadeInDown.delay(100).duration(500).springify()}>
        <SectionCard>
          <View style={styles.sectionHeader}>
            <IllustrationIcon icon="format-list-numbered" variant="warning" size="sm" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {locale === 'vi' ? 'Số câu hỏi' : 'Questions'}
            </Text>
          </View>

          <View style={styles.qRow}>
            {Q_COUNT_OPTIONS.map((q) => {
              const active = questionCount === q;
              return (
                <Pressable
                  key={q}
                  onPress={() => setQuestionCount(q)}
                  style={[
                    styles.qChip,
                    active
                      ? { backgroundColor: Brand.primary, ...NeuShadow.sm }
                      : { backgroundColor: isDark ? Brand.darkSurface : colors.inputBg, borderWidth: 1, borderColor: isDark ? Brand.darkBorder : Brand.lightBorder },
                  ]}
                >
                  <Text style={[styles.qNum, { color: active ? '#fff' : colors.text }]}>{q}</Text>
                </Pressable>
              );
            })}
          </View>
        </SectionCard>
      </Animated.View>

      {/* ── Library Selection ── */}
      <Animated.View entering={FadeInDown.delay(200).duration(500).springify()}>
        <SectionCard>
          <View style={styles.sectionHeader}>
            <IllustrationIcon icon={<MaterialIcons name="library-books" size={18} color="#fff" />} variant="primary" size="sm" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {locale === 'vi' ? 'Chọn thư viện' : 'Select Library'}
            </Text>
            <Badge variant="secondary">{libs.length.toString()}</Badge>
          </View>

          {libs.length === 0 && (
            <View style={styles.emptyRow}>
              <MaterialIcons name="folder-open" size={28} color={Brand.gray300} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {t('libraries_empty')}
              </Text>
            </View>
          )}

          {libs.map((lib, idx) => {
            const active = selectedLib === lib.id;
            const diffColor = lib.difficulty === 'easy' ? Brand.chart3 : lib.difficulty === 'hard' ? Brand.error : Brand.chart4;
            return (
              <Animated.View key={lib.id} entering={FadeInRight.delay(250 + idx * 50).duration(400)}>
                <Pressable
                  onPress={() => setSelectedLib(lib.id)}
                  style={[
                    styles.libItem,
                    {
                      borderColor: active ? Brand.primary : (isDark ? Brand.darkBorder : Brand.lightBorder),
                      backgroundColor: active
                        ? (isDark ? `${Brand.primary}15` : `${Brand.primary}08`)
                        : (isDark ? Brand.darkSurface : Brand.white),
                    },
                  ]}
                >
                  <View style={styles.libRow}>
                    {/* Radio circle */}
                    <View style={[styles.radio, { borderColor: active ? Brand.primary : Brand.gray300 }]}>
                      {active && <View style={styles.radioInner} />}
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={[styles.libTitle, { color: colors.text }]}>{lib.title}</Text>
                      <View style={styles.libMeta}>
                        <Badge variant={lib.difficulty === 'easy' ? 'success' : lib.difficulty === 'hard' ? 'destructive' : 'warning'}>
                          {lib.difficulty ?? 'medium'}
                        </Badge>
                        <Text style={[styles.libCards, { color: colors.textSecondary }]}>
                          {lib.cardCount} {locale === 'vi' ? 'thẻ' : 'cards'}
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.libDiffBar, { backgroundColor: diffColor }]} />
                  </View>
                </Pressable>
              </Animated.View>
            );
          })}
        </SectionCard>
      </Animated.View>

      {/* ── Start Button ── */}
      <Animated.View entering={FadeInDown.delay(350).duration(500).springify()}>
        <Pressable
          onPress={startTest}
          disabled={!canStart}
          style={({ pressed }) => [
            styles.startBtn,
            !canStart && styles.startBtnDisabled,
            pressed && canStart && styles.pressed,
          ]}
        >
          <MaterialIcons name="play-arrow" size={22} color="#fff" />
          <Text style={styles.startBtnText}>
            {locale === 'vi' ? 'Bắt đầu kiểm tra' : 'Start Test'}
          </Text>
        </Pressable>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  heroTitle: { color: '#fff', fontSize: 20, fontWeight: '900' },
  heroSub: { color: Brand.gray400, fontSize: 13, marginTop: 4 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', flex: 1 },

  qRow: { flexDirection: 'row', gap: 10 },
  qChip: { flex: 1, borderRadius: Radius.md, paddingVertical: 16, alignItems: 'center' },
  qNum: { fontSize: 22, fontWeight: '900' },

  libItem: { borderRadius: Radius.lg, borderWidth: 1.5, padding: 14, overflow: 'hidden' },
  libRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: Brand.primary },
  libTitle: { fontWeight: '700', fontSize: 15 },
  libMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  libCards: { fontSize: 12, fontWeight: '600' },
  libDiffBar: { width: 4, height: '80%' as any, borderRadius: 2, position: 'absolute', right: 0, top: '10%' as any },

  emptyRow: { alignItems: 'center', gap: 8, paddingVertical: 16 },
  emptyText: { fontSize: 14 },

  startBtn: {
    borderRadius: Radius.lg,
    backgroundColor: Brand.primary,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    ...NeuShadow.md,
  },
  startBtnText: { color: '#fff', fontWeight: '900', fontSize: 17 },
  startBtnDisabled: { opacity: 0.45 },
  pressed: { opacity: 0.82 },
});
