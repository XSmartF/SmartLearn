import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

import type { MobileCardFlag, MobileCard, MobileLibrary } from '@/shared/models/app';
import { cardFlagRepository, libraryRepository } from '@/shared/services';
import { useI18n } from '@/shared/i18n';
import { Brand, Colors, NeuShadow, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Screen, SectionCard, DarkCard } from '@/shared/ui/screen';

import { Badge } from '@/components/ui/Badge';
import { IllustrationIcon } from '@/components/ui/IllustrationIcon';

// ── Types ──────────────────────────────────────────────────────
type Tab = 'all' | 'starred' | 'hard';

interface ReviewEntry {
  flag: MobileCardFlag;
  card?: MobileCard | null;
  library?: MobileLibrary | null;
}

// ── Page ───────────────────────────────────────────────────────
export default function ReviewScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const isDark = scheme === 'dark';

  const [flags, setFlags] = useState<MobileCardFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [cardCache, setCardCache] = useState<Record<string, MobileCard | null>>({});
  const [libraryCache, setLibraryCache] = useState<Record<string, MobileLibrary | null>>({});
  const [activeTab, setActiveTab] = useState<Tab>('all');

  // ── Fetch flags ──────────────────────────────────────────────
  const loadFlags = useCallback(async () => {
    setLoading(true);
    try {
      const list = await cardFlagRepository.listReviewFlags();
      setFlags(list);
    } catch (err) {
      console.error('Cannot load review flags:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadFlags(); }, [loadFlags]);

  // ── Fetch cards & libraries on-demand ────────────────────────
  useEffect(() => {
    const missingCardIds = [...new Set(flags.map((f) => f.cardId))].filter((id) => cardCache[id] === undefined);
    if (!missingCardIds.length) return;
    let cancelled = false;

    (async () => {
      const libs = await libraryRepository.listLibraries();
      const libMap: Record<string, MobileLibrary> = {};
      libs.forEach((l) => { libMap[l.id] = l; });

      const cardResults: Record<string, MobileCard | null> = {};
      const libIds = [...new Set(flags.map((f) => f.libraryId))];

      for (const libId of libIds) {
        try {
          const detail = await libraryRepository.getLibraryDetail(libId);
          if (detail) {
            detail.cards.forEach((c) => { cardResults[c.id] = c; });
          }
        } catch { /* skip */ }
      }

      if (cancelled) return;

      setCardCache((prev) => {
        const next = { ...prev };
        missingCardIds.forEach((id) => { next[id] = cardResults[id] ?? null; });
        return next;
      });
      setLibraryCache((prev) => {
        const next = { ...prev };
        libIds.forEach((id) => { next[id] = libMap[id] ?? null; });
        return next;
      });
    })().catch(console.error);

    return () => { cancelled = true; };
  }, [flags, cardCache]);

  // ── Derived data ─────────────────────────────────────────────
  const entries = useMemo<ReviewEntry[]>(
    () => flags.map((flag) => ({
      flag,
      card: cardCache[flag.cardId],
      library: libraryCache[flag.libraryId] ?? null,
    })),
    [flags, cardCache, libraryCache],
  );

  const starredEntries = useMemo(() => entries.filter((e) => e.flag.starred === true), [entries]);
  const hardEntries = useMemo(() => entries.filter((e) => e.flag.difficulty === 'hard'), [entries]);

  const readyCount = entries.filter((e) => e.card).length;
  const starredCount = starredEntries.filter((e) => e.card).length;
  const hardCount = hardEntries.filter((e) => e.card).length;
  const libraryCount = useMemo(() => new Set(entries.map((e) => e.flag.libraryId)).size, [entries]);

  const visibleEntries = activeTab === 'starred' ? starredEntries : activeTab === 'hard' ? hardEntries : entries;

  const emptyMessage =
    activeTab === 'starred' ? t('review_empty_starred')
      : activeTab === 'hard' ? t('review_empty_hard')
        : t('review_empty');

  // ── Group by library ─────────────────────────────────────────
  const grouped = useMemo(() => {
    const ready = visibleEntries.filter((e) => e.card);
    const map = new Map<string, { library: MobileLibrary | null | undefined; cards: ReviewEntry[] }>();
    ready.forEach((item) => {
      const key = item.flag.libraryId;
      const bucket = map.get(key) ?? { library: item.library, cards: [] };
      bucket.cards.push(item);
      bucket.library = item.library ?? bucket.library;
      map.set(key, bucket);
    });
    return [...map.entries()].map(([libraryId, val]) => ({ libraryId, ...val }));
  }, [visibleEntries]);

  // ── Handlers ─────────────────────────────────────────────────
  const handleReview = (libraryId: string) => {
    router.push({ pathname: '/study/session', params: { libraryId } });
  };

  // ── Render ───────────────────────────────────────────────────
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
              <Text style={styles.heroTitle}>{t('review_title')}</Text>
              <Text style={styles.heroSub}>{t('review_subtitle')}</Text>
            </View>
            <IllustrationIcon icon="rate-review" variant="accent" size="md" />
          </View>
        </DarkCard>
      </Animated.View>

      {/* Stats row */}
      <Animated.View entering={FadeInDown.delay(80).duration(500).springify()}>
        <SectionCard>
          <View style={styles.statsGrid}>
            <StatPill icon="auto-awesome" color={Brand.primary} label={t('review_stat_total')} value={readyCount} />
            <StatPill icon="star" color={Brand.chart4} label={t('review_stat_starred')} value={starredCount} />
            <StatPill icon="local-fire-department" color={Brand.error} label={t('review_stat_hard')} value={hardCount} />
            <StatPill icon="library-books" color={Brand.info} label={t('review_stat_libraries')} value={libraryCount} />
          </View>
        </SectionCard>
      </Animated.View>

      {/* Tab selector */}
      <Animated.View entering={FadeInDown.delay(160).duration(500).springify()}>
        <View style={[styles.tabBar, { backgroundColor: isDark ? Brand.darkSurface : Brand.lightMuted }]}>
          <TabBtn label={t('review_tab_all')} count={readyCount} active={activeTab === 'all'} onPress={() => setActiveTab('all')} color={Brand.primary} isDark={isDark} />
          <TabBtn label={t('review_tab_starred')} count={starredCount} active={activeTab === 'starred'} onPress={() => setActiveTab('starred')} color={Brand.chart4} isDark={isDark} />
          <TabBtn label={t('review_tab_hard')} count={hardCount} active={activeTab === 'hard'} onPress={() => setActiveTab('hard')} color={Brand.error} isDark={isDark} />
        </View>
      </Animated.View>

      {/* Content */}
      {loading ? (
        <SectionCard>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Brand.primary} />
          </View>
        </SectionCard>
      ) : grouped.length === 0 ? (
        <Animated.View entering={FadeInDown.delay(240).duration(500).springify()}>
          <SectionCard>
            <View style={styles.emptyContainer}>
              <MaterialIcons name="rate-review" size={48} color={Brand.gray300} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{emptyMessage}</Text>
            </View>
          </SectionCard>
        </Animated.View>
      ) : (
        grouped.map((group, gi) => (
          <Animated.View key={group.libraryId} entering={FadeInDown.delay(240 + gi * 80).duration(500).springify()}>
            <SectionCard>
              {/* Library header */}
              <View style={styles.groupHeaderRow}>
                <IllustrationIcon icon="library-books" variant="info" size="sm" />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.groupTitle, { color: colors.text }]} numberOfLines={1}>
                    {group.library?.title ?? t('review_unknown_library')}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600' }}>
                    {t('review_cards_count', { count: group.cards.length })}
                  </Text>
                </View>
                <Pressable
                  onPress={() => handleReview(group.libraryId)}
                  style={({ pressed }) => [styles.reviewBtn, pressed && styles.pressed]}
                >
                  <MaterialIcons name="school" size={16} color="#fff" />
                  <Text style={styles.reviewBtnText}>{t('review_start')}</Text>
                </Pressable>
              </View>

              {/* Cards */}
              <View style={styles.cardList}>
                {group.cards.map((item, ci) => (
                  <Animated.View key={item.flag.cardId} entering={FadeInRight.delay(ci * 50).duration(300)}>
                    <View
                      style={[
                        styles.cardItem,
                        {
                          backgroundColor: isDark ? Brand.darkSurface : Brand.white,
                          borderColor: isDark ? Brand.darkBorder : Brand.lightBorder,
                        },
                      ]}
                    >
                      <View style={{ flex: 1, gap: 4 }}>
                        <Text style={[styles.cardFront, { color: colors.text }]} numberOfLines={2}>
                          {item.card?.front ?? '—'}
                        </Text>
                        <Text style={[styles.cardBack, { color: colors.textSecondary }]} numberOfLines={2}>
                          {item.card?.back ?? '—'}
                        </Text>
                      </View>
                      <View style={styles.badgeCol}>
                        {item.flag.starred && (
                          <Badge variant="warning" size="sm">
                            <View style={styles.badgeInner}>
                              <MaterialIcons name="star" size={10} color="#92400e" />
                              <Text style={{ color: '#92400e', fontSize: 10, fontWeight: '700' }}>
                                {t('review_badge_starred')}
                              </Text>
                            </View>
                          </Badge>
                        )}
                        {item.flag.difficulty === 'hard' && (
                          <Badge variant="destructive" size="sm">
                            <View style={styles.badgeInner}>
                              <MaterialIcons name="local-fire-department" size={10} color={Brand.error} />
                              <Text style={{ color: Brand.error, fontSize: 10, fontWeight: '700' }}>
                                {t('review_badge_hard')}
                              </Text>
                            </View>
                          </Badge>
                        )}
                      </View>
                    </View>
                  </Animated.View>
                ))}
              </View>
            </SectionCard>
          </Animated.View>
        ))
      )}
    </Screen>
  );
}

// ── Sub-components ─────────────────────────────────────────────

function StatPill({ icon, color, label, value }: {
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  label: string;
  value: number;
}) {
  return (
    <View style={styles.statPill}>
      <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
        <MaterialIcons name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function TabBtn({ label, count, active, onPress, color, isDark }: {
  label: string;
  count: number;
  active: boolean;
  onPress: () => void;
  color: string;
  isDark: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.tabBtn,
        active && {
          backgroundColor: isDark ? Brand.darkCard : '#fff',
          ...NeuShadow.sm,
        },
      ]}
    >
      <Text style={[styles.tabLabel, active && { color, fontWeight: '800' }]}>{label}</Text>
      <View style={[styles.tabCount, { backgroundColor: `${color}15` }]}>
        <Text style={[styles.tabCountText, { color }]}>{count}</Text>
      </View>
    </Pressable>
  );
}

// ── Styles ─────────────────────────────────────────────────────
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

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statPill: { flex: 1, minWidth: '40%' as unknown as number, alignItems: 'center', gap: 4, paddingVertical: 6 },
  statIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 11, fontWeight: '600', color: Brand.gray400 },

  tabBar: {
    flexDirection: 'row', borderRadius: Radius.full, padding: 4, gap: 4,
  },
  tabBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: Radius.full,
  },
  tabLabel: { fontSize: 13, fontWeight: '600', color: Brand.gray400 },
  tabCount: { borderRadius: Radius.full, paddingHorizontal: 7, paddingVertical: 2 },
  tabCountText: { fontSize: 10, fontWeight: '800' },

  loadingContainer: { paddingVertical: 40, alignItems: 'center' },
  emptyContainer: { alignItems: 'center', gap: 10, paddingVertical: 24 },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },

  groupHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  groupTitle: { fontSize: 16, fontWeight: '800' },
  reviewBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Brand.primary, borderRadius: Radius.md,
    paddingHorizontal: 14, paddingVertical: 9,
    ...NeuShadow.sm,
  },
  reviewBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },

  cardList: { gap: 8 },
  cardItem: { borderRadius: Radius.md, borderWidth: 1.5, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardFront: { fontSize: 15, fontWeight: '700' },
  cardBack: { fontSize: 13, lineHeight: 18 },
  badgeCol: { gap: 4, alignItems: 'flex-end' },
  badgeInner: { flexDirection: 'row', alignItems: 'center', gap: 3 },
});
