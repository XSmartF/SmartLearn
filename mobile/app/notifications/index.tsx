import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import type { MobileNotification } from '@/shared/models/app';
import { notificationRepository } from '@/shared/services';
import { useI18n } from '@/shared/i18n';
import { Brand, Colors, NeuShadow, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Screen, SectionCard, GlassCard } from '@/shared/ui/screen';

import { Badge } from '@/components/ui/Badge';
import { IllustrationIcon } from '@/components/ui/IllustrationIcon';

export default function NotificationsScreen() {
  const { t, locale } = useI18n();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const isDark = scheme === 'dark';
  const [items, setItems] = useState<MobileNotification[]>([]);

  const load = useCallback(async () => {
    const data = await notificationRepository.listNotifications();
    setItems(data);
  }, []);

  useEffect(() => { load().catch(console.error); }, [load]);

  const markAll = async () => {
    await notificationRepository.markAllNotificationsRead();
    await load();
  };

  const unreadCount = items.filter((i) => !i.read).length;

  return (
    <Screen>
      <Animated.View entering={FadeInDown.duration(500).springify()}>
        <GlassCard>
          <View style={styles.headerRow}>
            <IllustrationIcon icon="notifications" variant="info" size="md" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.text }]}>{t('notifications_title')}</Text>
              {unreadCount > 0 && <Badge variant="destructive">{unreadCount.toString()} unread</Badge>}
            </View>
          </View>
          <Pressable onPress={markAll} style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}>
            <MaterialIcons name="done-all" size={18} color="#fff" />
            <Text style={styles.primaryText}>{t('notifications_mark_all_read')}</Text>
          </Pressable>
        </GlassCard>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(150).duration(500).springify()}>
        <SectionCard>
          {items.length === 0 && (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="notifications-none" size={40} color={Brand.gray300} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('notifications_empty')}</Text>
            </View>
          )}

          {items.map((item, idx) => (
            <Animated.View key={item.id} entering={FadeInDown.delay(200 + idx * 60).duration(400)}>
              <View
                style={[
                  styles.notification,
                  item.read
                    ? { backgroundColor: isDark ? Brand.darkSurface : Brand.white, borderColor: isDark ? Brand.darkBorder : Brand.lightBorder }
                    : { backgroundColor: isDark ? `${Brand.primary}10` : `${Brand.primary}08`, borderColor: isDark ? `${Brand.primary}25` : `${Brand.primary}20` },
                ]}
              >
                <View style={styles.notifRow}>
                  <View style={[styles.notifDot, { backgroundColor: item.read ? Brand.gray300 : Brand.primary }]} />
                  <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
                  {!item.read && <Badge variant="default">New</Badge>}
                </View>
                <Text style={[styles.itemMessage, { color: colors.textSecondary }]}>{item.message}</Text>
                <Text style={styles.itemDate}>{new Date(item.createdAt).toLocaleString(locale)}</Text>
              </View>
            </Animated.View>
          ))}
        </SectionCard>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 20, fontWeight: '800' },
  primaryBtn: {
    borderRadius: Radius.md, backgroundColor: Brand.primary,
    paddingVertical: 12, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center', gap: 6,
    ...NeuShadow.sm,
  },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  notification: { borderRadius: Radius.lg, borderWidth: 1, padding: 14, gap: 6 },
  notifRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  notifDot: { width: 8, height: 8, borderRadius: 4 },
  itemTitle: { fontWeight: '700', fontSize: 14, flex: 1 },
  itemMessage: { fontSize: 13, lineHeight: 18, paddingLeft: 16 },
  itemDate: { color: Brand.gray400, fontSize: 11, fontWeight: '600', paddingLeft: 16 },
  emptyContainer: { alignItems: 'center', gap: 8, paddingVertical: 20 },
  emptyText: { fontSize: 14 },
  pressed: { opacity: 0.82 },
});
