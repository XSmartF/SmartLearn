import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import type { MobileLibrary, MobileCard } from '@/shared/models/app';
import { libraryRepository } from '@/shared/services';
import { useI18n } from '@/shared/i18n';
import { Brand, Colors, NeuShadow, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Screen, SectionCard, DarkCard } from '@/shared/ui/screen';

import { Badge } from '@/components/ui/Badge';
import { IllustrationIcon } from '@/components/ui/IllustrationIcon';
import { CircularProgress } from '@/components/ui/CircularProgress';

export default function LibraryDetailScreen() {
  const route = useLocalSearchParams<{ id: string }>();
  const id = typeof route.id === 'string' ? route.id : '';
  const router = useRouter();
  const { t } = useI18n();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const isDark = scheme === 'dark';

  const [library, setLibrary] = useState<MobileLibrary | null>(null);
  const [cards, setCards] = useState<MobileCard[]>([]);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  const fetchData = useCallback(() => {
    if (!id) return;
    libraryRepository.getLibraryDetail(id).then((res) => {
      if (res) { setLibrary(res.library); setCards(res.cards); }
    });
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAdd = async () => {
    if (!front.trim() || !back.trim() || !id) return;
    await libraryRepository.addCard(id, { front: front.trim(), back: back.trim() });
    setFront(''); setBack('');
    fetchData();
  };

  return (
    <Screen>
      {/* Hero header */}
      <Animated.View entering={FadeInDown.duration(500).springify()}>
        <DarkCard style={styles.hero}>
          <View style={styles.heroRow}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <MaterialIcons name="arrow-back" size={20} color="#fff" />
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle} numberOfLines={1}>{library?.title ?? '\u2026'}</Text>
              <Text style={styles.heroSub}>{t('libraries_card_count', { count: cards.length })}</Text>
            </View>
            <CircularProgress
              value={cards.length > 0 ? 100 : 0}
              size={50}
              strokeWidth={5}
              color={Brand.chart3}
              label=""
            />
          </View>
        </DarkCard>
      </Animated.View>

      {/* Study button */}
      {cards.length > 0 && (
        <Animated.View entering={FadeInDown.delay(80).duration(500).springify()}>
          <Pressable
            onPress={() => router.push({ pathname: '/study/session', params: { libraryId: id } })}
            style={({ pressed }) => [styles.studyBtn, pressed && styles.pressed]}
          >
            <MaterialIcons name="school" size={20} color="#fff" />
            <Text style={styles.studyBtnText}>{t('study_mode_start')}</Text>
            <MaterialIcons name="arrow-forward" size={18} color="#fff" />
          </Pressable>
        </Animated.View>
      )}

      {/* Add card form */}
      <Animated.View entering={FadeInDown.delay(150).duration(500).springify()}>
        <SectionCard>
          <View style={styles.sectionRow}>
            <IllustrationIcon icon="add-circle" variant="primary" size="sm" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('library_add_card')}</Text>
          </View>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
            placeholder={t('library_front_placeholder')}
            placeholderTextColor={Brand.gray400}
            value={front}
            onChangeText={setFront}
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
            placeholder={t('library_back_placeholder')}
            placeholderTextColor={Brand.gray400}
            value={back}
            onChangeText={setBack}
          />
          <Pressable onPress={handleAdd} style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}>
            <MaterialIcons name="add" size={18} color="#fff" />
            <Text style={styles.addBtnText}>{t('library_add_card')}</Text>
          </Pressable>
        </SectionCard>
      </Animated.View>

      {/* Card list */}
      <Animated.View entering={FadeInDown.delay(300).duration(500).springify()}>
        <SectionCard>
          <View style={styles.sectionRow}>
            <IllustrationIcon icon="style" variant="accent" size="sm" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('library_card_list')}</Text>
            <Badge variant="secondary">{cards.length.toString()}</Badge>
          </View>

          {cards.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="style" size={40} color={Brand.gray300} />
              <Text style={{ color: colors.textSecondary, fontSize: 14 }}>{t('library_no_cards')}</Text>
            </View>
          ) : (
            <View style={styles.cardList}>
              {cards.map((c, i) => (
                <Animated.View key={c.id ?? i} entering={FadeInRight.delay(i * 60).duration(300)}>
                  <View
                    style={[
                      styles.card,
                      {
                        backgroundColor: isDark ? Brand.darkSurface : Brand.white,
                        borderColor: isDark ? Brand.darkBorder : Brand.lightBorder,
                      },
                    ]}
                  >
                    <View style={styles.cardRow}>
                      <View style={[styles.cardBullet, { backgroundColor: Brand.primary }]}>
                        <Text style={styles.cardBulletText}>{i + 1}</Text>
                      </View>
                      <View style={{ flex: 1, gap: 4 }}>
                        <Text style={[styles.cardFront, { color: colors.text }]}>{c.front}</Text>
                        <Text style={[styles.cardBack, { color: colors.textSecondary }]}>{c.back}</Text>
                      </View>
                    </View>
                  </View>
                </Animated.View>
              ))}
            </View>
          )}
        </SectionCard>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: Radius.lg, padding: 18, gap: 12 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: `${Brand.primary}30`,
    alignItems: 'center', justifyContent: 'center',
  },
  heroTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  heroSub: { color: Brand.gray300, fontSize: 13, fontWeight: '600', marginTop: 2 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { fontSize: 17, fontWeight: '800', flex: 1 },
  input: { borderRadius: Radius.md, borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: Brand.primary, borderRadius: Radius.md, paddingVertical: 13,
    ...NeuShadow.sm,
  },
  addBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  pressed: { opacity: 0.82 },
  cardList: { gap: 8 },
  card: { borderRadius: Radius.md, borderWidth: 1.5, padding: 12 },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  cardBullet: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginTop: 2,
  },
  cardBulletText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  cardFront: { fontSize: 15, fontWeight: '700' },
  cardBack: { fontSize: 14, lineHeight: 20 },
  emptyContainer: { alignItems: 'center', gap: 8, paddingVertical: 16 },
  studyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: Brand.primary, borderRadius: Radius.md,
    paddingVertical: 14, ...NeuShadow.sm,
  },
  studyBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});

