import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

import type { MobileNote } from '@/shared/models/app';
import { noteRepository } from '@/shared/services';
import { useI18n } from '@/shared/i18n';
import { Brand, Colors, NeuShadow, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Screen, SectionCard, GlassCard } from '@/shared/ui/screen';

import { Badge } from '@/components/ui/Badge';
import { IllustrationIcon } from '@/components/ui/IllustrationIcon';

export default function NotesTabScreen() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const isDark = scheme === 'dark';
  const [notes, setNotes] = useState<MobileNote[]>([]);

  const loadNotes = useCallback(async () => {
    const data = await noteRepository.listNotes();
    setNotes(data);
  }, []);

  useEffect(() => { loadNotes().catch(console.error); }, [loadNotes]);

  const createNote = async () => {
    const created = await noteRepository.createNote({ title: t('notes_default_title'), content: '', tags: [] });
    await loadNotes();
    router.push({ pathname: '/notes/[id]', params: { id: created.id } });
  };

  const tagColors = [Brand.chart1, Brand.chart2, Brand.chart3, Brand.chart4, Brand.chart5];

  return (
    <Screen>
      {/* Header + create */}
      <Animated.View entering={FadeInDown.duration(500).springify()}>
        <GlassCard>
          <View style={styles.headerRow}>
            <IllustrationIcon icon="sticky-note-2" variant="accent" size="md" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('notes_title')}</Text>
              <Text style={[styles.countText, { color: colors.textSecondary }]}>
                {notes.length} {t('notes_list').toLowerCase()}
              </Text>
            </View>
          </View>
          <Pressable onPress={createNote} style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}>
            <MaterialIcons name="add" size={18} color="#fff" />
            <Text style={styles.primaryText}>{t('notes_create')}</Text>
          </Pressable>
        </GlassCard>
      </Animated.View>

      {/* Notes list */}
      <Animated.View entering={FadeInDown.delay(150).duration(500).springify()}>
        <SectionCard>
          <View style={styles.headerRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('notes_list')}</Text>
            <Badge variant="info">{notes.length.toString()}</Badge>
          </View>

          {notes.length === 0 && (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="note-add" size={40} color={Brand.gray300} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('notes_empty')}</Text>
            </View>
          )}

          {notes.map((note, idx) => (
            <Animated.View key={note.id} entering={FadeInDown.delay(200 + idx * 70).duration(400)}>
              <Pressable
                onPress={() => router.push({ pathname: '/notes/[id]', params: { id: note.id } })}
                style={({ pressed }) => [
                  styles.noteItem,
                  {
                    backgroundColor: isDark ? Brand.darkSurface : Brand.white,
                    borderColor: isDark ? Brand.darkBorder : Brand.lightBorder,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.noteHeader}>
                  <View style={[styles.noteIconWrap, { backgroundColor: `${Brand.accent}12` }]}>
                    <MaterialIcons name="description" size={16} color={Brand.accent} />
                  </View>
                  <Text style={[styles.noteTitle, { color: colors.text }]} numberOfLines={1}>{note.title}</Text>
                  <Text style={styles.noteDate}>{new Date(note.updatedAt).toLocaleDateString(locale)}</Text>
                </View>
                <Text numberOfLines={2} style={[styles.noteContent, { color: colors.textSecondary }]}>
                  {note.content || t('notes_empty_content')}
                </Text>
                {note.tags.length > 0 && (
                  <View style={styles.tagsRow}>
                    {note.tags.map((tag, ti) => (
                      <Badge key={tag} variant="outline">
                        <View style={styles.tagInner}>
                          <View style={[styles.tagDot, { backgroundColor: tagColors[ti % tagColors.length] }]} />
                          <Text style={[styles.tagText, { color: colors.text }]}>{tag}</Text>
                        </View>
                      </Badge>
                    ))}
                  </View>
                )}
              </Pressable>
            </Animated.View>
          ))}
        </SectionCard>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '800', flex: 1 },
  countText: { fontSize: 12, marginTop: 2 },
  primaryBtn: {
    borderRadius: Radius.md,
    backgroundColor: Brand.primary,
    paddingVertical: 13,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    ...NeuShadow.sm,
  },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  noteItem: { borderWidth: 1, borderRadius: Radius.lg, padding: 14, gap: 8 },
  noteHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  noteIconWrap: {
    width: 30, height: 30, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  noteTitle: { flex: 1, fontWeight: '700', fontSize: 14 },
  noteDate: { color: Brand.gray400, fontSize: 11, fontWeight: '600' },
  noteContent: { fontSize: 13, lineHeight: 18 },
  tagsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  tagInner: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tagDot: { width: 6, height: 6, borderRadius: 3 },
  tagText: { fontSize: 11, fontWeight: '700' },
  emptyContainer: { alignItems: 'center', gap: 8, paddingVertical: 20 },
  emptyText: { fontSize: 14 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
});
