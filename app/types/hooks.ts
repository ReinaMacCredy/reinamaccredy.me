import type { ScrollEvents, SectionsNavigation } from './core';

export interface UseScrollEventsReturn {
  scrollEvents: ScrollEvents | null;
}

export interface UseSectionsReturn {
  sections: SectionsNavigation | null;
}

export interface UseTerminalReturn {
  [key: string]: unknown;
}

