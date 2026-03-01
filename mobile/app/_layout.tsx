import { DarkTheme, DefaultTheme, ThemeProvider, type Theme } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { SessionProvider, useSession } from '@/shared/auth/session';
import { I18nProvider, useI18n } from '@/shared/i18n';
import { Brand, Colors } from '@/constants/theme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <SessionProvider>
      <I18nProvider>
        <RootNavigator />
      </I18nProvider>
    </SessionProvider>
  );
}

function RootNavigator() {
  const colorScheme = useColorScheme();
  const { user, loading } = useSession();
  const { t } = useI18n();
  const segments = useSegments();
  const router = useRouter();
  const isDark = colorScheme === 'dark';

  const appTheme = useMemo((): Theme => {
    const c = isDark ? Colors.dark : Colors.light;
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      dark: isDark,
      colors: {
        ...base.colors,
        primary: Brand.primary,
        background: c.background,
        card: c.card,
        text: c.text,
        border: c.cardBorder,
        notification: Brand.primary,
      },
    };
  }, [isDark]);

  const headerStyle = useMemo(
    () => ({
      headerStyle: { backgroundColor: isDark ? Brand.darkCard : Brand.white },
      headerTintColor: isDark ? '#fff' : Brand.dark,
      headerTitleStyle: { fontWeight: '800' as const, fontSize: 17 },
      headerShadowVisible: false,
    }),
    [isDark],
  );

  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === 'auth';
    if (!user && !inAuth) router.replace('/auth');
    if (user && inAuth) router.replace('/(tabs)');
  }, [loading, router, segments, user]);

  if (loading) return null;

  return (
    <ThemeProvider value={appTheme}>
      <Stack screenOptions={headerStyle}>
        <Stack.Screen name="auth" options={{ title: t('nav_auth_title'), headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="libraries/[id]" options={{ title: t('nav_library_detail'), headerShown: false }} />
        <Stack.Screen name="notes/[id]" options={{ title: t('nav_note_detail'), headerShown: false }} />
        <Stack.Screen name="test/index" options={{ title: t('nav_test_setup') }} />
        <Stack.Screen name="test/session" options={{ title: t('nav_test_session') }} />
        <Stack.Screen name="study/session" options={{ title: t('study_mode_title'), headerShown: false }} />
        <Stack.Screen name="review/index" options={{ title: t('nav_review'), headerShown: false }} />
        <Stack.Screen name="games/index" options={{ title: t('nav_games') }} />
        <Stack.Screen name="notifications/index" options={{ title: t('nav_notifications') }} />
        <Stack.Screen name="settings/index" options={{ title: t('nav_settings') }} />
        <Stack.Screen name="profile/index" options={{ title: t('nav_profile') }} />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
