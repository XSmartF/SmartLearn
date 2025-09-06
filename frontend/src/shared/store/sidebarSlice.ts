import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// LocalStorage key for persisting desktop sidebar state
export const SIDEBAR_STORAGE_KEY = 'sl_sidebar_open';

function loadPersistedOpen(): boolean {
  if (typeof window === 'undefined') return true; // default when SSR/undefined
  try {
    const raw = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (raw === null) return true; // default expanded first time
    if (raw === '1' || raw === 'true') return true;
    if (raw === '0' || raw === 'false') return false;
    return true;
  } catch {
    return true;
  }
}

export interface SidebarState {
  open: boolean; // desktop
  openMobile: boolean;
}

// Start with optimistic true; we'll hydrate later (lazy) to avoid layout shift on servers or early render.
const initialState: SidebarState = { open: true, openMobile: false };

const slice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
  setOpen(state, action: PayloadAction<boolean>) { state.open = action.payload; },
    toggle(state) { state.open = !state.open; },
    setOpenMobile(state, action: PayloadAction<boolean>) { state.openMobile = action.payload; },
    toggleMobile(state) { state.openMobile = !state.openMobile; },
  hydrateSidebar(state) { state.open = loadPersistedOpen(); },
  }
});

export const { setOpen, toggle, setOpenMobile, toggleMobile, hydrateSidebar } = slice.actions;
export const sidebarReducer = slice.reducer;
