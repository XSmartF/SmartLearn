import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

import type { MobileLibrary } from '@/shared/models/app';
import { libraryRepository } from '@/shared/services';
import { useI18n } from '@/shared/i18n';
import { Brand, Colors, NeuShadow, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Screen, SectionCard, GlassCard } from '@/shared/ui/screen';

import { Badge } from '@/components/ui/Badge';
import { IllustrationIcon } from '@/components/ui/IllustrationIcon';
import { ProgressBar } from '@/components/ui/ProgressBar';

export default function LibrariesTabScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const isDark = scheme === 'dark';
  const [libraries, setLibraries] = useState<MobileLibrary[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const loadLibraries = useCallback(async () => {
    const data = await libraryRepository.listLibraries();
    setLibraries(data);
  }, []);

  useEffect(() => {
    loadLibraries().catch(console.error);
  }, [loadLibraries]);

  const onCreateLibrary = async () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    await libraryRepository.createLibrary({ title: trimmed, description });
    setTitle('');
    setDescription('');
    await loadLibraries();
  };

  return (
    <Screen>
      {/* Create library form */}
      <Animated.View entering={FadeInDown.duration(500).springify()}>
        <GlassCard>
          <View style={styles.titleRow}>
            <IllustrationIcon icon="post-add" variant="primary" size="sm" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('libraries_create_new')}</Text>
          </View>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={t('libraries_name_placeholder')}
            style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
            placeholderTextColor={Brand.gray400}
          />
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder={t('libraries_description_placeholder')}
            style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
            placeholderTextColor={Brand.gray400}
          />
          <Pressable onPress={onCreateLibrary} style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}>
            <MaterialIcons name="add" size={18} color="#fff" />
            <Text style={styles.primaryText}>{t('libraries_create_button')}</Text>
          </Pressable>
        </GlassCard>
      </Animated.View>

      {/* Library list */}
      <Animated.View entering={FadeInDown.delay(150).duration(500).springify()}>
        <SectionCard>
          <View style={styles.titleRow}>
            <IllustrationIcon icon="collections-bookmark" variant="info" size="sm" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('libraries_all')}</Text>
            <Badge variant="secondary">{libraries.length.toString()}</Badge>
          </View>

          {libraries.length === 0 && (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="library-books" size={40} color={Brand.gray300} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('libraries_empty')}</Text>
            </View>
          )}

          {libraries.map((item, idx) => (
            <Animated.View key={item.id} entering={FadeInDown.delay(200 + idx * 80).duration(400)}>
              <Pressable
                onPress={() => router.push({ pathname: '/libraries/[id]', params: { id: item.id } })}
                style={({ pressed }) => [
                  styles.libraryItem,
                  {
                    backgroundColor: isDark ? Brand.darkSurface : Brand.white,
                    borderColor: isDark ? Brand.darkBorder : Brand.lightBorder,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.libraryHeader}>
                  <View style={[styles.libraryIconWrap, { backgroundColor: `${Brand.primary}12` }]}>
                    <MaterialIcons name="library-books" size={18} color={Brand.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.libraryTitle, { color: colors.text }]}>{item.title}</Text>
                    <Text numberOfLines={1} style={[styles.libraryDesc, { color: colors.textSecondary }]}>
                      {item.description || t('libraries_no_description')}
                    </Text>
                  </View>
                  <Badge variant="default">{t('libraries_card_count', { count: item.cardCount })}</Badge>
                </View>
                <ProgressBar
                  value={item.cardCount > 0 ? 100 : 0}
                  color={Brand.primary}
                  height={4}
                />
                <View style={styles.libraryFooter}>
                  <MaterialIcons name="chevron-right" size={18} color={Brand.gray400} />
                </View>
              </Pressable>
            </Animated.View>
          ))}
        </SectionCard>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '800', flex: 1 },
  input: {
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  primaryBtn: {
    borderRadius: Radius.md,
    backgroundColor: Brand.primary,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    ...NeuShadow.sm,
  },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  libraryItem: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: 14,
    gap: 10,
    ...NeuShadow.sm,
  },
  libraryHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  libraryIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  libraryTitle: { fontSize: 15, fontWeight: '700' },
  libraryDesc: { fontSize: 12, marginTop: 2 },
  libraryFooter: { flexDirection: 'row', justifyContent: 'flex-end' },
  emptyContainer: { alignItems: 'center', gap: 8, paddingVertical: 20 },
  emptyText: { fontSize: 14 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
});
