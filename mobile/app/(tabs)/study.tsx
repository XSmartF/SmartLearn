import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

import type { MobileStudyEvent, MobileLibrary } from '@/shared/models/app';
import { mobileDataService } from '@/shared/services';
import { useI18n } from '@/shared/i18n';
import { Brand, Colors, NeuShadow, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Screen, SectionCard, GlassCard } from '@/shared/ui/screen';

import { Badge } from '@/components/ui/Badge';
import { IllustrationIcon } from '@/components/ui/IllustrationIcon';
import { ProgressBar } from '@/components/ui/ProgressBar';

export default function StudyTabScreen() {
  const { t, locale } = useI18n();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const isDark = scheme === 'dark';
  const router = useRouter();
  const [events, setEvents] = useState<MobileStudyEvent[]>([]);
  const [libraries, setLibraries] = useState<MobileLibrary[]>([]);
  const [title, setTitle] = useState('');

  const loadEvents = useCallback(async () => {
    const data = await mobileDataService.listStudyEvents();
    setEvents(data);
  }, []);

  useEffect(() => {
    loadEvents().catch(console.error);
    mobileDataService.listLibraries().then(setLibraries).catch(() => {});
  }, [loadEvents]);

  const createEvent = async () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const startAt = new Date().toISOString();
    const endAt = new Date(Date.now() + 45 * 60 * 1000).toISOString();
    await mobileDataService.createStudyEvent({ title: trimmed, startAt, endAt });
    setTitle('');
    await loadEvents();
  };

  const setStatus = async (eventId: string, status: 'completed' | 'missed') => {
    await mobileDataService.updateStudyEventStatus(eventId, status);
    await loadEvents();
  };

  const statusConfig = (status: MobileStudyEvent['status']) => {
    if (status === 'completed') return { label: t('study_status_completed'), variant: 'success' as const, icon: 'check-circle' as const, color: Brand.success };
    if (status === 'missed') return { label: t('study_status_missed'), variant: 'destructive' as const, icon: 'cancel' as const, color: Brand.error };
    return { label: t('study_status_upcoming'), variant: 'default' as const, icon: 'schedule' as const, color: Brand.primary };
  };

  const completedCount = events.filter((e) => e.status === 'completed').length;
  const progress = events.length > 0 ? Math.round((completedCount / events.length) * 100) || 0 : 0;

  return (
    <Screen>
      {/* ── Study Mode: pick a library to learn ── */}
      <Animated.View entering={FadeInDown.duration(500).springify()}>
        <SectionCard>
          <View style={styles.titleRow}>
            <IllustrationIcon icon="school" variant="accent" size="md" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('study_mode_title')}</Text>
              <Text style={[styles.subtext, { color: colors.textSecondary }]}>
                {locale === 'vi' ? 'Chọn thư viện để bắt đầu ôn tập' : 'Pick a library to start studying'}
              </Text>
            </View>
          </View>

          {libraries.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="library-books" size={32} color={Brand.gray300} />
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                {locale === 'vi' ? 'Chưa có thư viện nào' : 'No libraries yet'}
              </Text>
            </View>
          ) : (
            <View style={{ gap: 8 }}>
              {libraries.filter(l => l.cardCount > 0).map((lib, idx) => (
                <Animated.View key={lib.id} entering={FadeInDown.delay(100 + idx * 60).duration(350)}>
                  <Pressable
                    onPress={() => router.push({ pathname: '/study/session', params: { libraryId: lib.id } })}
                    style={({ pressed }) => [
                      styles.libraryStudyItem,
                      {
                        backgroundColor: isDark ? Brand.darkSurface : Brand.white,
                        borderColor: isDark ? Brand.darkBorder : Brand.lightBorder,
                      },
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={[styles.libIcon, { backgroundColor: `${Brand.primary}15` }]}>
                      <MaterialIcons name="school" size={18} color={Brand.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.libTitle, { color: colors.text }]} numberOfLines={1}>{lib.title}</Text>
                      <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600' }}>
                        {t('libraries_card_count', { count: lib.cardCount })}
                      </Text>
                    </View>
                    <MaterialIcons name="play-circle-filled" size={28} color={Brand.primary} />
                  </Pressable>
                </Animated.View>
              ))}
              {libraries.filter(l => l.cardCount > 0).length === 0 && (
                <Text style={{ color: colors.textSecondary, fontSize: 13, textAlign: 'center', paddingVertical: 12 }}>
                  {t('study_mode_no_cards')}
                </Text>
              )}
            </View>
          )}
        </SectionCard>
      </Animated.View>

      {/* Add event */}
      <Animated.View entering={FadeInDown.delay(150).duration(500).springify()}>
        <GlassCard>
          <View style={styles.titleRow}>
            <IllustrationIcon icon="school" variant="primary" size="md" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('study_schedule')}</Text>
              {events.length > 0 && (
                <Text style={[styles.subtext, { color: colors.textSecondary }]}>
                  {completedCount}/{events.length} {t('study_status_completed').toLowerCase()}
                </Text>
              )}
            </View>
          </View>

          {events.length > 0 && (
            <ProgressBar value={progress} color={Brand.success} label={t('study_status_completed')} />
          )}

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={t('study_add_event_placeholder')}
            style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
            placeholderTextColor={Brand.gray400}
          />
          <Pressable onPress={createEvent} style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}>
            <MaterialIcons name="add" size={18} color="#fff" />
            <Text style={styles.primaryText}>{t('study_add_event')}</Text>
          </Pressable>
        </GlassCard>
      </Animated.View>

      {/* Events list */}
      <Animated.View entering={FadeInDown.delay(300).duration(500).springify()}>
        <SectionCard>
          <View style={styles.titleRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('study_events')}</Text>
            <Badge variant="secondary">{events.length.toString()}</Badge>
          </View>

          {events.length === 0 && (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="event-note" size={40} color={Brand.gray300} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('study_empty')}</Text>
            </View>
          )}

          {events.map((event, idx) => {
            const cfg = statusConfig(event.status);
            return (
              <Animated.View key={event.id} entering={FadeInDown.delay(200 + idx * 70).duration(400)}>
                <View
                  style={[
                    styles.eventItem,
                    {
                      backgroundColor: isDark ? Brand.darkSurface : Brand.white,
                      borderColor: isDark ? Brand.darkBorder : Brand.lightBorder,
                      borderLeftColor: cfg.color,
                      borderLeftWidth: 3,
                    },
                  ]}
                >
                  <View style={styles.eventTop}>
                    <View style={[styles.statusIcon, { backgroundColor: `${cfg.color}15` }]}>
                      <MaterialIcons name={cfg.icon} size={16} color={cfg.color} />
                    </View>
                    <Text style={[styles.eventTitle, { color: colors.text }]}>{event.title}</Text>
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                  </View>
                  <Text style={styles.eventTime}>
                    {new Date(event.startAt).toLocaleString(locale)} — {new Date(event.endAt).toLocaleTimeString(locale)}
                  </Text>
                  {event.status === 'upcoming' && (
                    <View style={styles.actionsRow}>
                      <Pressable
                        onPress={() => setStatus(event.id, 'completed')}
                        style={[styles.actionBtn, { backgroundColor: Brand.success }]}
                      >
                        <MaterialIcons name="check" size={16} color="#fff" />
                        <Text style={styles.actionBtnText}>{t('study_mark_completed')}</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => setStatus(event.id, 'missed')}
                        style={[styles.actionBtn, { backgroundColor: Brand.error }]}
                      >
                        <MaterialIcons name="close" size={16} color="#fff" />
                        <Text style={styles.actionBtnText}>{t('study_mark_missed')}</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              </Animated.View>
            );
          })}
        </SectionCard>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '800', flex: 1 },
  subtext: { fontSize: 12, marginTop: 2 },
  input: { borderWidth: 1.5, borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  primaryBtn: {
    borderRadius: Radius.md, backgroundColor: Brand.primary,
    paddingVertical: 13, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center', gap: 6,
    ...NeuShadow.sm,
  },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  pressed: { opacity: 0.82 },
  emptyContainer: { alignItems: 'center', gap: 8, paddingVertical: 20 },
  emptyText: { fontSize: 14 },
  eventItem: { borderWidth: 1, borderRadius: Radius.lg, padding: 14, gap: 8 },
  eventTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusIcon: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  eventTitle: { flex: 1, fontWeight: '700', fontSize: 14 },
  eventTime: { color: Brand.gray400, fontSize: 12, fontWeight: '600', paddingLeft: 38 },
  actionsRow: { flexDirection: 'row', gap: 8, paddingLeft: 38 },
  actionBtn: {
    borderRadius: Radius.xs, paddingHorizontal: 12, paddingVertical: 8,
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  libraryStudyItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1.5, borderRadius: Radius.md, padding: 12,
  },
  libIcon: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  libTitle: { fontSize: 14, fontWeight: '700' },
});
