import type { MobileDataService } from './contracts';
import { firebaseMobileDataService } from './firebaseService';
import { mockMobileDataService } from './mockService';

const DEFAULT_PROVIDER = 'firebase';
const SUPPORTED_PROVIDERS = new Set(['mock', 'firebase']);

export function resolveMobileDataService(): MobileDataService {
  const provider = (process.env.EXPO_PUBLIC_DATA_PROVIDER || DEFAULT_PROVIDER).trim().toLowerCase();

  if (!SUPPORTED_PROVIDERS.has(provider)) {
    throw new Error(
      `[mobile/services] Unsupported provider "${provider}". Supported: ${Array.from(SUPPORTED_PROVIDERS).join(', ')}.`
    );
  }

  if (provider === 'firebase') return firebaseMobileDataService;
  return mockMobileDataService;
}
