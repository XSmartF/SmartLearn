import { useState, useEffect } from 'react';
import { noteRepository } from '@/shared/lib/repositories/NoteRepository';
import type { NoteMeta } from '@/features/notes/types';

export function useUserNotes() {
  const [notes, setNotes] = useState<NoteMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let unsub: (() => void) | null = null;

    try {
      unsub = noteRepository.listenUserNotes((fetchedNotes) => {
        setNotes(fetchedNotes);
        setLoading(false);
      });
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }

    return () => {
      if (unsub) unsub();
    };
  }, []);

  return { notes, loading, error };
}

export function useNote(id: string) {
  const [note, setNote] = useState<NoteMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchNote = async () => {
      try {
        const fetchedNote = await noteRepository.getNote(id);
        setNote(fetchedNote);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id]);

  return { note, loading, error };
}

// Mock favorites hook - replace with real Firebase implementation
export function useNoteFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let unsub: (() => void) | null = null;

    try {
      unsub = noteRepository.listenFavoriteNoteIds((fetchedFavorites) => {
        setFavorites(fetchedFavorites);
      });
    } catch (err) {
      console.error('Failed to listen to favorites:', err);
    }

    return () => {
      if (unsub) unsub();
    };
  }, []);

  const toggleFavorite = async (noteId: string, isFav: boolean) => {
    if (updating) return; // Prevent multiple simultaneous calls
    
    setUpdating(true);
    try {
      if (isFav) {
        // User wants to remove favorite
        await noteRepository.removeFavorite(noteId);
        setFavorites(prev => prev.filter(id => id !== noteId));
      } else {
        // User wants to add favorite
        await noteRepository.addFavorite(noteId);
        setFavorites(prev => {
          const newFavorites = prev.filter(id => id !== noteId);
          newFavorites.push(noteId);
          return newFavorites;
        });
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      // Revert optimistic update on error
      setFavorites(prev => {
        if (isFav) {
          // Was trying to remove, but failed - add it back
          return prev.includes(noteId) ? prev : [...prev, noteId];
        } else {
          // Was trying to add, but failed - remove it
          return prev.filter(id => id !== noteId);
        }
      });
    } finally {
      setUpdating(false);
    }
  };

  return { favorites, updating, toggleFavorite };
}