import { useEffect, useState } from 'react';
import type { LibraryMeta } from '@/lib/models';
import { listenUserLibraries } from '@/lib/firebaseLibraryService';

export function useUserLibraries() {
  const [libraries, setLibraries] = useState<LibraryMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    try {
      unsub = listenUserLibraries(l => { setLibraries(l); setLoading(false); });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Load libraries failed';
      setError(msg);
      setLoading(false);
    }
    return () => { if (unsub) unsub(); };
  }, []);

  return { libraries, loading, error };
}