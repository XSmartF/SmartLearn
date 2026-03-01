import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useSession } from '@/shared/auth/session';
import { useI18n } from '@/shared/i18n';
import { useGoogleSignIn } from '@/shared/hooks/useGoogleSignIn';
import { Brand, Colors, NeuShadow, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Screen, SectionCard } from '@/shared/ui/screen';

type Mode = 'sign-in' | 'sign-up';

export default function AuthScreen() {
  const { signInEmailPassword, signUpEmailPassword } = useSession();
  const { t } = useI18n();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const isDark = scheme === 'dark';

  const [mode, setMode] = useState<Mode>('sign-in');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isSignUp = mode === 'sign-up';

  const title = isSignUp ? t('auth_title_sign_up') : t('auth_title_sign_in');

  const submit = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError(t('auth_error_required'));
      return;
    }
    if (isSignUp) {
      if (password.length < 6) { setError(t('auth_error_password_min')); return; }
      if (password !== confirmPassword) { setError(t('auth_error_confirm_mismatch')); return; }
    }
    setSubmitting(true);
    try {
      if (isSignUp) await signUpEmailPassword(email, password, displayName.trim());
      else await signInEmailPassword(email, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('auth_error_sign_in_failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const { request, promptAsync } = useGoogleSignIn();

  return (
    <Screen>
      {/* ── Hero ──────────────────────────────────────── */}
      <Animated.View entering={FadeInUp.duration(600).springify()} style={styles.heroContainer}>
        <View style={styles.heroIllustration}>
          <View style={[styles.illustrationCircle, { backgroundColor: Brand.primary }]}>
            <MaterialIcons name="school" size={48} color="#fff" />
          </View>
          <View style={[styles.floatingIcon1, { backgroundColor: Brand.accent }]}>
            <MaterialIcons name="auto-awesome" size={18} color="#fff" />
          </View>
          <View style={[styles.floatingIcon2, { backgroundColor: Brand.chart2 }]}>
            <MaterialIcons name="lightbulb" size={16} color="#fff" />
          </View>
          <View style={[styles.floatingIcon3, { backgroundColor: Brand.chart3 }]}>
            <MaterialIcons name="star" size={14} color="#fff" />
          </View>
        </View>
        <Text style={[styles.heroTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>{t('auth_subtitle')}</Text>
      </Animated.View>

      {/* ── Form ──────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(200).duration(500).springify()}>
        <SectionCard>
          {/* Mode toggle */}
          <View style={[styles.tabRow, { backgroundColor: isDark ? Brand.darkSurface : Brand.gray100 }]}>
            <Pressable
              onPress={() => setMode('sign-in')}
              style={[styles.tab, mode === 'sign-in' && [styles.activeTab, { backgroundColor: Brand.primary }]]}
            >
              <Text style={[styles.tabText, { color: isDark ? Brand.gray300 : Brand.gray500 }, mode === 'sign-in' && styles.activeTabText]}>
                {t('auth_sign_in')}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setMode('sign-up')}
              style={[styles.tab, mode === 'sign-up' && [styles.activeTab, { backgroundColor: Brand.primary }]]}
            >
              <Text style={[styles.tabText, { color: isDark ? Brand.gray300 : Brand.gray500 }, mode === 'sign-up' && styles.activeTabText]}>
                {t('auth_sign_up')}
              </Text>
            </Pressable>
          </View>

          {isSignUp && (
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder={t('auth_field_display_name')}
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
              autoCapitalize="words"
              placeholderTextColor={Brand.gray400}
            />
          )}

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder={t('auth_field_email')}
            keyboardType="email-address"
            autoCapitalize="none"
            style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
            placeholderTextColor={Brand.gray400}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder={t('auth_field_password')}
            secureTextEntry
            autoCapitalize="none"
            style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
            placeholderTextColor={Brand.gray400}
          />

          {isSignUp && (
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder={t('auth_field_confirm_password')}
              secureTextEntry
              autoCapitalize="none"
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
              placeholderTextColor={Brand.gray400}
            />
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            onPress={submit}
            disabled={submitting}
            style={({ pressed }) => [styles.primaryBtn, (pressed || submitting) && styles.pressed]}
          >
            <Text style={styles.primaryText}>
              {submitting ? t('auth_processing') : isSignUp ? t('auth_sign_up') : t('auth_sign_in')}
            </Text>
          </Pressable>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.cardBorder }]} />
            <Text style={[styles.dividerText, { color: colors.textSecondary }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.cardBorder }]} />
          </View>

          {/* Google */}
          <Pressable
            onPress={() => promptAsync()}
            disabled={!request}
            style={({ pressed }) => [
              styles.socialBtn,
              { borderColor: colors.cardBorder, backgroundColor: colors.card },
              pressed && styles.pressed,
            ]}
          >
            <MaterialIcons name="g-mobiledata" size={22} color={Brand.primary} />
            <Text style={[styles.socialText, { color: colors.text }]}>{t('auth_sign_in_google')}</Text>
          </Pressable>
        </SectionCard>
      </Animated.View>

      {/* Terms */}
      <Animated.View entering={FadeInDown.delay(400).duration(400)}>
        <Text style={[styles.terms, { color: colors.textSecondary }]}>{t('auth_terms')}</Text>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroContainer: { alignItems: 'center', paddingTop: 24, paddingBottom: 8, gap: 8 },
  heroIllustration: { width: 130, height: 130, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  illustrationCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    ...NeuShadow.md,
  },
  floatingIcon1: {
    position: 'absolute', top: 0, right: 8,
    width: 34, height: 34, borderRadius: 17,
    alignItems: 'center', justifyContent: 'center',
  },
  floatingIcon2: {
    position: 'absolute', bottom: 10, left: 0,
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
  },
  floatingIcon3: {
    position: 'absolute', bottom: 0, right: 16,
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  heroTitle: { fontSize: 24, fontWeight: '800', textAlign: 'center' },
  heroSubtitle: { textAlign: 'center', lineHeight: 20, paddingHorizontal: 20, fontSize: 14 },

  tabRow: { flexDirection: 'row', borderRadius: Radius.md, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: Radius.sm },
  activeTab: {},
  tabText: { fontWeight: '700', fontSize: 14 },
  activeTabText: { color: '#fff' },

  input: {
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  error: { color: Brand.error, fontSize: 13, fontWeight: '600' },
  primaryBtn: {
    borderRadius: Radius.md,
    backgroundColor: Brand.primary,
    paddingVertical: 14,
    alignItems: 'center',
    ...NeuShadow.sm,
  },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  pressed: { opacity: 0.8 },

  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 13, fontWeight: '600' },

  socialBtn: {
    borderRadius: Radius.md, borderWidth: 1.5,
    paddingVertical: 12, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  socialText: { fontWeight: '700', fontSize: 14 },

  terms: { textAlign: 'center', fontSize: 12, paddingHorizontal: 30, lineHeight: 18 },
});

