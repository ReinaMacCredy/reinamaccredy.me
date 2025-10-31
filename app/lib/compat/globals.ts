import type { SectionsNavigation } from '../../types/core';

interface CompatGlobalsParams {
  sections: SectionsNavigation | null;
  scrollToTop?: () => void;
}

export function attachCompatGlobals({ sections, scrollToTop }: CompatGlobalsParams): void {
  if (!sections) return;
  const {
    nextScrollPoint,
    previousScrollPoint,
    firstScrollPoint,
    lastScrollPoint,
    nextSection,
    previousSection,
    firstSection,
    lastSection,
  } = sections;

  if (typeof window !== 'undefined') {
    const win = window as unknown as Record<string, unknown>;
    win._nextScrollPoint = nextScrollPoint || win._nextScrollPoint;
    win._previousScrollPoint = previousScrollPoint || win._previousScrollPoint;
    win._firstScrollPoint = firstScrollPoint || win._firstScrollPoint;
    win._lastScrollPoint = lastScrollPoint || win._lastScrollPoint;
    win._nextSection = nextSection || win._nextSection;
    win._previousSection = previousSection || win._previousSection;
    win._firstSection = firstSection || win._firstSection;
    win._lastSection = lastSection || win._lastSection;
    win._scrollToTop = scrollToTop || win._scrollToTop;
  }
}

