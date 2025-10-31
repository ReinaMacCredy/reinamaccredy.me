export type BrowserType = 'firefox' | 'edge' | 'safari' | 'chrome' | 'samsung' | 'opera' | 'ie' | 'other';
export type OSType = 'ios' | 'android' | 'mac' | 'windows' | 'undefined' | 'other';

export interface ClientInfo {
  browser: BrowserType;
  browserVersion: number;
  os: OSType;
  osVersion: number;
  mobile: boolean;
  canUse: (property: string, value?: string) => boolean;
  flags: {
    lsdUnits: boolean;
  };
}

export type ScrollEventMode = 1 | 2 | 3 | 4;

export interface ScrollEventOptions {
  element: HTMLElement;
  triggerElement?: HTMLElement;
  enter?: (() => void) | null;
  leave?: (() => void) | null;
  mode?: ScrollEventMode;
  threshold?: number;
  offset?: number;
  initialState?: boolean | null;
}

export interface ScrollEventItem {
  element: HTMLElement;
  triggerElement: HTMLElement;
  enter: (() => void) | null;
  leave: (() => void) | null;
  mode: ScrollEventMode;
  threshold: number;
  offset: number;
  initialState: boolean | null;
  state: boolean;
}

export interface ScrollEventsOptions {
  isIos?: boolean;
}

export interface ScrollEvents {
  items: ScrollEventItem[];
  add: (options: ScrollEventOptions) => void;
  handler: () => void;
  init: () => void;
}

export interface SectionConfig {
  hideHeader?: boolean;
  hideFooter?: boolean;
  disableAutoScroll?: boolean;
}

export interface SectionsNavigationConfig {
  header?: HTMLElement | null;
  footer?: HTMLElement | null;
  title?: string;
  sectionsConfig?: Record<string, SectionConfig>;
}

export interface SectionsNavigation {
  activateSection: (section: HTMLElement, scrollPoint?: HTMLElement | null) => boolean;
  nextScrollPoint: (event?: Event) => void;
  previousScrollPoint: (event?: Event) => void;
  firstScrollPoint: (event?: Event) => void;
  lastScrollPoint: (event?: Event) => void;
  nextSection: () => void;
  previousSection: () => void;
  firstSection: () => void;
  lastSection: () => void;
  scrollToTop: () => void;
}

