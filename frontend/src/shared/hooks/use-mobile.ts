import * as React from "react"

// Breakpoints aligned with Tailwind CSS defaults
// mobile: <768px (below md:)
// desktop: >=1024px (lg: and above) - changed to use overlay for sm/md screens too
// Use sheet for mobile/tablet, desktop sidebar for lg+
const MOBILE_MAX = 768
const DESKTOP_MIN = 1024

export interface SidebarBreakpointState {
  isMobile: boolean;   // strictly <768px
  isDesktop: boolean;  // >=1024px (lg+)
  useSheet: boolean;   // mobile/tablet -> sheet overlay, desktop -> sidebar
  width: number;
}

export function useSidebarBreakpoints(): SidebarBreakpointState {
  const [state, setState] = React.useState<SidebarBreakpointState>(()=>({
    isMobile: false,
    isDesktop: true,
    useSheet: false,
    width: typeof window!== 'undefined' ? window.innerWidth : DESKTOP_MIN+1,
  }));

  React.useEffect(()=>{
    const compute = () => {
      const w = window.innerWidth;
      const isMobile = w < MOBILE_MAX;
      const isDesktop = w >= DESKTOP_MIN;
      const useSheet = w < DESKTOP_MIN; // Use overlay for mobile and tablet (sm/md)
      setState({ isMobile, isDesktop, useSheet, width: w });
    };
    compute();
    window.addEventListener('resize', compute);
    return ()=> window.removeEventListener('resize', compute);
  }, []);

  return state;
}

// Backwards compatibility: treat mobile as "mobile" for existing code.
export function useIsMobile() {
  return useSidebarBreakpoints().useSheet;
}
