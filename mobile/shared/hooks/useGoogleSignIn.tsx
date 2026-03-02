import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { authService } from '@/shared/services';

// Hook that returns { request, response, promptAsync } and auto-signs into Firebase
export function useGoogleSignIn() {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || process.env.VITE_FIREBASE_OAUTH_CLIENT_ID;
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || process.env.EXPO_PUBLIC_FIREBASE_ANDROID_CLIENT_ID;
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || process.env.EXPO_PUBLIC_FIREBASE_IOS_CLIENT_ID;
  const expoClientId = process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID;

  const config: Record<string, string | undefined> = {
    clientId: webClientId,
    androidClientId,
    iosClientId,
    expoClientId,
  };

  // Warn if platform requires a client id that isn't provided
  if (Platform.OS === 'android' && !androidClientId) {
    // eslint-disable-next-line no-console
    console.warn('Google auth: missing EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID in .env');
  }
  if (Platform.OS === 'ios' && !iosClientId) {
    // eslint-disable-next-line no-console
    console.warn('Google auth: missing EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID in .env');
  }

  const [request, response, promptAsync] = Google.useAuthRequest({
    ...config,
    scopes: ['openid', 'profile', 'email'],
    redirectUri: makeRedirectUri(),
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const authentication = response.authentication;
      const idToken = authentication?.idToken ?? null;
      const accessToken = authentication?.accessToken ?? null;
      if (idToken) {
        authService.signInWithGoogle(idToken, accessToken).catch((e) => {
          // eslint-disable-next-line no-console
          console.error('Google sign-in -> Firebase sign-in failed', e);
        });
      }
    }
  }, [response]);

  return { request, response, promptAsync } as const;
}
