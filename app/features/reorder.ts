export function initReorder(): void {
  const breakpoints: Record<string, string> = { 
    small: "(max-width: 736px)", 
    medium: "(max-width: 980px)" 
  };
  
  const elements = document.querySelectorAll<HTMLElement>("[data-reorder]");
  
  elements.forEach(function (e: HTMLElement) {
    const desktop: ChildNode[] = [];
    const mobile: ChildNode[] = [];
    let state = false;
    let query: string;
    let a: string[];
    let x: string;
    let ce: ChildNode;
    let f: () => void;
    
    const reorderBreakpoint = e.dataset.reorderBreakpoint;
    if (reorderBreakpoint && reorderBreakpoint in breakpoints) {
      query = breakpoints[reorderBreakpoint];
    } else {
      query = breakpoints.small;
    }
    
    for (ce of Array.from(e.childNodes)) {
      if (ce.nodeType !== 1) continue;
      desktop.push(ce);
    }
    
    const reorderData = e.dataset.reorder;
    if (!reorderData) return;
    a = reorderData.split(",");
    for (x of a) {
      const index = parseInt(x, 10);
      if (desktop[index]) {
        mobile.push(desktop[index]);
      }
    }
    
    f = function (): void {
      if (window.matchMedia(query).matches) {
        if (!state) {
          state = true;
          for (ce of mobile) {
            e.appendChild(ce);
          }
        }
      } else {
        if (state) {
          state = false;
          for (ce of desktop) {
            e.appendChild(ce);
          }
        }
      }
    };
    
    window.addEventListener("resize", f);
    window.addEventListener("orientationchange", f);
    window.addEventListener("load", f);
    document.addEventListener("fullscreenchange", f);
  });
}

