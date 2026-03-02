import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import type { MobileNote } from '@/shared/models/app';
import { noteRepository } from '@/shared/services';
import { useI18n } from '@/shared/i18n';
import { Brand, Colors, NeuShadow, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Screen, SectionCard, DarkCard } from '@/shared/ui/screen';

import { IllustrationIcon } from '@/components/ui/IllustrationIcon';

export default function NoteDetailScreen() {
  const route = useLocalSearchParams<{ id: string }>();
  const id = typeof route.id === 'string' ? route.id : '';
  const router = useRouter();
  const { t } = useI18n();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const [note, setNote] = useState<MobileNote | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    noteRepository.getNote(id).then((res) => {
      if (res) { setNote(res); setTitle(res.title); setContent(res.content); }
    });
  }, [id]);

  const handleSave = async () => {
    if (!id || saving) return;
    setSaving(true);
    try {
      await noteRepository.updateNote(id, { title: title.trim(), content: content.trim() });
      router.back();
    } finally { setSaving(false); }
  };

  return (
    <Screen>
      {/* Hero */}
      <Animated.View entering={FadeInDown.duration(500).springify()}>
        <DarkCard style={styles.hero}>
          <View style={styles.heroRow}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <MaterialIcons name="arrow-back" size={20} color="#fff" />
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle} numberOfLines={1}>{note?.title ?? t('note_edit')}</Text>
              {note?.updatedAt && (
                <Text style={styles.heroSub}>
                  {t('note_updated_at', { time: new Date(note.updatedAt).toLocaleDateString() })}
                </Text>
              )}
            </View>
            <IllustrationIcon icon="edit-note" variant="accent" size="sm" />
          </View>
        </DarkCard>
      </Animated.View>

      {/* Editor */}
      <Animated.View entering={FadeInDown.delay(150).duration(500).springify()}>
        <SectionCard>
          <TextInput
            style={[styles.titleInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
            placeholder={t('note_title_placeholder')}
            placeholderTextColor={Brand.gray400}
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={[styles.contentInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
            placeholder={t('note_content_placeholder')}
            placeholderTextColor={Brand.gray400}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />
        </SectionCard>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(400)}>
        <Pressable
          onPress={handleSave}
          disabled={saving}
          style={({ pressed }) => [styles.saveBtn, pressed && styles.pressed, saving && { opacity: 0.6 }]}
        >
          <MaterialIcons name="save" size={18} color="#fff" />
          <Text style={styles.saveBtnText}>{saving ? t('note_saving') : t('note_save')}</Text>
        </Pressable>
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

  titleInput: {
    borderRadius: Radius.md, borderWidth: 1.5,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 17, fontWeight: '700',
  },
  contentInput: {
    borderRadius: Radius.md, borderWidth: 1.5,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, minHeight: 200, lineHeight: 22,
  },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: Brand.primary, borderRadius: Radius.md, paddingVertical: 14,
    ...NeuShadow.sm,
  },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  pressed: { opacity: 0.82 },
});

