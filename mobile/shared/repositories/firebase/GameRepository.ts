import type { MobileGameMode } from '@/shared/models/app';
import { DEFAULT_GAME_MODES } from '@/shared/models/app';
import type { IGameRepository } from '@/shared/services/contracts';

export class FirebaseGameRepository implements IGameRepository {
  async listGameModes(): Promise<MobileGameMode[]> {
    return DEFAULT_GAME_MODES;
  }
}

export const firebaseGameRepository = new FirebaseGameRepository();
