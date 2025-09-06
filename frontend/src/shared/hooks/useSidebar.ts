import * as React from 'react';
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks';
import { setOpen, toggle as toggleDesktop, setOpenMobile, toggleMobile, SIDEBAR_STORAGE_KEY } from '@/shared/store/sidebarSlice';
import { selectSidebarVM } from '@/shared/store/sidebarSelectors';
import { useSidebarBreakpoints } from '@/shared/hooks/use-mobile';

// Externalized hook to avoid Fast Refresh warnings (was previously inside sidebar.tsx)
export function useSidebar() {
  const dispatch = useAppDispatch();
  const { open, openMobile, state } = useAppSelector(selectSidebarVM);
  const { useSheet, isDesktop } = useSidebarBreakpoints();

  const toggleSidebar = React.useCallback(() => {
    if (useSheet) dispatch(toggleMobile());
    else dispatch(toggleDesktop());
  }, [dispatch, useSheet]);

  // Close sheet only on actual transition from sheet mode -> desktop (avoid immediate flicker)
  const prevIsDesktopRef = React.useRef(isDesktop);
  React.useEffect(()=>{
    const wasDesktop = prevIsDesktopRef.current;
    if (!wasDesktop && isDesktop && openMobile) {
      dispatch(setOpenMobile(false));
    }
    prevIsDesktopRef.current = isDesktop;
  }, [isDesktop, openMobile, dispatch]);

  // Persist desktop open state
  React.useEffect(() => {
    try {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, open ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [open]);

  return {
    state,
    open,
    setOpen: (v: boolean) => dispatch(setOpen(v)),
    openMobile,
    setOpenMobile: (v: boolean) => dispatch(setOpenMobile(v)),
  isMobile: useSheet, // backward name
    toggleSidebar,
  } as const;
}
