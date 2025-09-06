import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from './store';

const selectSidebarRoot = (state: RootState) => state.sidebar as { open: boolean; openMobile: boolean };

export const selectSidebarOpen = createSelector(selectSidebarRoot, s => s.open);
export const selectSidebarOpenMobile = createSelector(selectSidebarRoot, s => s.openMobile);
export const selectSidebarState = createSelector(selectSidebarOpen, open => open ? 'expanded' : 'collapsed');
export const selectIsSidebarExpanded = selectSidebarOpen; // alias
export const selectIsSidebarCollapsed = createSelector(selectSidebarOpen, open => !open);

// Combined derived object (memoized)
export const selectSidebarVM = createSelector(
  [selectSidebarOpen, selectSidebarOpenMobile, selectSidebarState],
  (open, openMobile, state) => ({ open, openMobile, state })
);
