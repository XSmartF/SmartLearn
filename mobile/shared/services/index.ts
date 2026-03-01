import { resolveMobileDataService } from './provider';
import { authService } from './authService';

export type { MobileDataService } from './contracts';
export { resolveMobileDataService };
export type { MobileAuthUser } from './authService';
export { authService };

export const mobileDataService = resolveMobileDataService();
