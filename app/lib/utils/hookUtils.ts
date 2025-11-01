import { logger } from './logger';

export function withErrorHandling(
  hookName: string,
  initFn: () => void | (() => void)
): void {
  try {
    initFn();
  } catch (error) {
    logger.error(`[bootstrap] ${hookName} failed:`, error);
  }
}

export interface ScrollPosition {
  top: number;
  bottom: number;
  height: number;
  scrollPad: number;
}

export function getScrollPosition(isIos: boolean = false): ScrollPosition {
  const height = document.documentElement.clientHeight;
  let top: number;
  let scrollPad: number;

  if (isIos) {
    top = document.body.scrollTop + window.scrollY;
    scrollPad = 125;
  } else {
    top = document.documentElement.scrollTop;
    scrollPad = 0;
  }

  return {
    top,
    bottom: top + height,
    height,
    scrollPad,
  };
}

export function isInViewport(
  element: HTMLElement,
  viewportTop: number,
  viewportBottom: number,
  threshold: number = 0.25
): boolean {
  const rect = element.getBoundingClientRect();
  const elementTop = viewportTop + Math.floor(rect.top);
  const elementBottom = elementTop + rect.height;
  
  const visibleTop = Math.max(elementTop, viewportTop);
  const visibleBottom = Math.min(elementBottom, viewportBottom);
  const visibleHeight = Math.max(0, visibleBottom - visibleTop);
  
  return visibleHeight / rect.height >= threshold;
}

