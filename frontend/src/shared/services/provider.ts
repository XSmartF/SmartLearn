import type { DataServices } from './contracts';
import { firebaseDataServices } from './firebaseProvider';

const DEFAULT_PROVIDER = 'firebase';
const SUPPORTED_PROVIDERS = new Set(['firebase']);

export function resolveDataServices(): DataServices {
  const configuredProvider =
    (import.meta.env.VITE_DATA_PROVIDER as string | undefined)?.trim().toLowerCase() || DEFAULT_PROVIDER;

  if (!SUPPORTED_PROVIDERS.has(configuredProvider)) {
    throw new Error(
      `[shared/services] Unsupported data provider "${configuredProvider}". Supported providers: ${Array.from(
        SUPPORTED_PROVIDERS
      ).join(', ')}.`
    );
  }

  return firebaseDataServices;
}
