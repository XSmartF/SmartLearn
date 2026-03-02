import type { MobileDataServices } from './contracts';
import { firebaseDataServices } from './firebaseProvider';

export function resolveDataServices(): MobileDataServices {
  return firebaseDataServices;
}
