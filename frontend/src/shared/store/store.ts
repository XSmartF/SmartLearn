import { configureStore } from '@reduxjs/toolkit';
import { api } from './api';
import { authReducer } from './authSlice.ts';
import { sidebarReducer, SIDEBAR_STORAGE_KEY, hydrateSidebar } from './sidebarSlice.ts';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
  auth: authReducer,
  sidebar: sidebarReducer,
  },
  middleware: (getDefault) => getDefault().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Persistence subscription (defensive: in case hook not mounted yet). Debounced simple approach.
let _prevSidebarOpen: boolean | undefined;
store.subscribe(()=>{
  try {
    const open = (store.getState().sidebar as { open: boolean }).open;
    if (open !== _prevSidebarOpen) {
      _prevSidebarOpen = open;
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, open ? '1' : '0');
    }
  } catch { /* ignore */ }
});

// Lazy hydration (after initial sync render to avoid mismatch)
if (typeof window !== 'undefined') {
  queueMicrotask(()=> { store.dispatch(hydrateSidebar()); });
}
