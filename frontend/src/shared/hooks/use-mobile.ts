import * as React from "react"

// Breakpoints aligned with Tailwind CSS defaults
// mobile: <768px (below md:)
// desktop: >=768px (md: and above)
// Use sheet for mobile, desktop sidebar for md+
const MOBILE_MAX = 768

export interface SidebarBreakpointState {
  isMobile: boolean;   // strictly <768px
  isDesktop: boolean;  // >=768px
  useSheet: boolean;   // mobile -> sheet overlay, desktop -> sidebar
  width: number;
}

export function useSidebarBreakpoints(): SidebarBreakpointState {
  const [state, setState] = React.useState<SidebarBreakpointState>(()=>({
    isMobile: false,
    isDesktop: true,
    useSheet: false,
    width: typeof window!== 'undefined' ? window.innerWidth : MOBILE_MAX+1,
  }));

  React.useEffect(()=>{
    const compute = () => {
      const w = window.innerWidth;
      const isMobile = w < MOBILE_MAX;
      const isDesktop = w >= MOBILE_MAX;
      setState({ isMobile, isDesktop, useSheet: isMobile, width: w });
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
