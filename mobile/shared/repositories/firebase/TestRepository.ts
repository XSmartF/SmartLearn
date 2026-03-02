import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import type { MobileCard, MobileTestQuestion } from '@/shared/models/app';
import { getDb } from '@/shared/firebase/client';
import { COLLECTIONS, mapCard } from './helpers';
import type { ITestRepository } from '@/shared/services/contracts';

const db = getDb();

export class FirebaseTestRepository implements ITestRepository {
  async buildTestSession(
    libraryId: string,
    questionCount: number,
  ): Promise<MobileTestQuestion[]> {
    const snap = await getDocs(
      query(
        collection(db, COLLECTIONS.cards),
        where('libraryId', '==', libraryId),
        limit(200),
      ),
    );
    const pool: MobileCard[] = [];
    snap.forEach((item) =>
      pool.push(mapCard(item.id, item.data() as Record<string, unknown>)),
    );
    pool.sort(() => Math.random() - 0.5);
    const count = Math.min(Math.max(questionCount, 1), pool.length);
    return pool.slice(0, count).map((item) => ({
      id: `q_${item.id}`,
      libraryId,
      prompt: item.front,
      answer: item.back,
    }));
  }
}

export const firebaseTestRepository = new FirebaseTestRepository();
