import * as React from "react"

// Breakpoints
// mobile: <640
// tablet: 640–1023
// desktop: >=1024
const MOBILE_MAX = 640
const TABLET_MAX = 1024

export interface SidebarBreakpointState {
  isMobile: boolean;   // strictly <640
  isTablet: boolean;   // 640–1023
  isDesktop: boolean;  // >=1024
  useSheet: boolean;   // mobile or tablet -> sheet overlay
  width: number;
}

export function useSidebarBreakpoints(): SidebarBreakpointState {
  const [state, setState] = React.useState<SidebarBreakpointState>(()=>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    useSheet: false,
    width: typeof window!== 'undefined' ? window.innerWidth : TABLET_MAX+1,
  }));

  React.useEffect(()=>{
    const compute = () => {
      const w = window.innerWidth;
      const isMobile = w < MOBILE_MAX;
      const isTablet = w >= MOBILE_MAX && w < TABLET_MAX;
      const isDesktop = w >= TABLET_MAX;
      setState({ isMobile, isTablet, isDesktop, useSheet: isMobile || isTablet, width: w });
    };
    compute();
    window.addEventListener('resize', compute);
    return ()=> window.removeEventListener('resize', compute);
  }, []);

  return state;
}

// Backwards compatibility: treat any sheet mode (mobile or tablet) as "mobile" for existing code.
export function useIsMobile() {
  return useSidebarBreakpoints().useSheet;
}
