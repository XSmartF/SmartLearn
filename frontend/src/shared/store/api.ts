import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import type { LibraryMeta } from '@/shared/lib/models';
import { shareRepository } from '@/shared/lib/repositories/ShareRepository';
import { userRepository } from '@/shared/lib/repositories/UserRepository';
import { loadProgressSummary, listenProgressSummary, type ProgressSummaryLite } from '@/shared/lib/firebase';

// RTK Query service wrapping Firestore realtime listeners via onCacheEntryAdded.
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Libraries','Shared','Favorites','ProgressSummary'],
  endpoints: (builder) => ({
    userLibraries: builder.query<LibraryMeta[], void>({
      queryFn: async () => ({ data: [] }),
      async onCacheEntryAdded(_, { updateCachedData, cacheEntryRemoved }) {
        let unsub: (()=>void)|undefined;
        try {
          const { libraryRepository } = await import('@/shared/lib/repositories/LibraryRepository');
          unsub = libraryRepository.listenUserLibraries((libs)=>{
            updateCachedData(()=> libs);
          });
        } catch { /* ignore */ }
        try { await cacheEntryRemoved; } finally { if (unsub) unsub(); }
      },
      providesTags: ['Libraries']
    }),
    sharedLibraries: builder.query<LibraryMeta[], void>({
      queryFn: async () => ({ data: [] }),
      async onCacheEntryAdded(_, { updateCachedData, cacheEntryRemoved }) {
        let unsub: (()=>void)|undefined;
        try {
          const { libraryRepository } = await import('@/shared/lib/repositories/LibraryRepository');
          unsub = shareRepository.listenUserSharedLibraries(async entries => {
            try {
              const ids = entries.map(e=> e.libraryId);
              const libs = ids.length ? await libraryRepository.fetchLibrariesByIds(ids) : [];
              updateCachedData(()=> libs);
            } catch { /* ignore */ }
          });
        } catch { /* ignore */ }
        try { await cacheEntryRemoved; } finally { if (unsub) unsub(); }
      },
      providesTags: ['Shared']
    }),
    favorites: builder.query<string[], void>({
      queryFn: async () => ({ data: [] }),
      async onCacheEntryAdded(_, { updateCachedData, cacheEntryRemoved }) {
        let unsub: (()=>void)|undefined;
        try {
          unsub = userRepository.listenUserFavoriteLibraryIds(ids => {
            updateCachedData(()=> ids);
          });
        } catch { /* ignore */ }
        try { await cacheEntryRemoved; } finally { if (unsub) unsub(); }
      },
      providesTags: ['Favorites']
    }),
    progressSummary: builder.query<ProgressSummaryLite | null, string>({
      queryFn: async (libraryId) => {
        try { const s = await loadProgressSummary(libraryId); return { data: s }; }
        catch (e) { return { error: { status: 'CUSTOM_ERROR', error: (e instanceof Error ? e.message : String(e)) } }; }
      },
      async onCacheEntryAdded(libraryId, { updateCachedData, cacheEntryRemoved }) {
        const off = listenProgressSummary(libraryId, (s)=> { updateCachedData(()=> s); });
        try { await cacheEntryRemoved; } finally { off(); }
      },
      providesTags: (_res,_err,id) => [{ type: 'ProgressSummary', id }]
    }),
    addFavorite: builder.mutation<void, string>({
      queryFn: async (libraryId) => {
        try { await userRepository.addFavorite(libraryId); return { data: undefined }; }
        catch (e) { return { error: { status: 'CUSTOM_ERROR', error: (e instanceof Error ? e.message : String(e)) } }; }
      },
      invalidatesTags: ['Favorites']
    }),
    removeFavorite: builder.mutation<void, string>({
      queryFn: async (libraryId) => {
        try { await userRepository.removeFavorite(libraryId); return { data: undefined }; }
        catch (e) { return { error: { status: 'CUSTOM_ERROR', error: (e instanceof Error ? e.message : String(e)) } }; }
      },
      invalidatesTags: ['Favorites']
    })
  })
});

export const {
  useUserLibrariesQuery: useGetUserLibrariesQuery,
  useSharedLibrariesQuery: useGetSharedLibrariesQuery,
  useFavoritesQuery: useGetFavoritesQuery,
  useProgressSummaryQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
} = api;
