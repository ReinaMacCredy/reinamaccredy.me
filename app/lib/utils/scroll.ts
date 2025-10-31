export function scrollPointSpeed(scrollPoint: HTMLElement | null): number {
  if (!scrollPoint) return 750;
  const value = parseInt(scrollPoint.dataset?.scrollSpeed || '0', 10);
  switch (value) {
    case 5:
      return 250;
    case 4:
      return 500;
    case 3:
      return 750;
    case 2:
      return 1000;
    case 1:
      return 1250;
    default:
      break;
  }
  return 750;
}

export function scrollToElement(
  e: HTMLElement | null,
  style: 'smooth' | 'instant' | 'linear' = 'smooth',
  duration: number = 750
): void {
  let y: number;
  let cy: number;
  let dy: number;
  let start: number;
  let easing: (t: number) => number;
  let offset: number;

  if (!e) {
    y = 0;
  } else {
    const fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    offset = (e.dataset.scrollOffset ? parseInt(e.dataset.scrollOffset, 10) : 0) * fontSize;
    const scrollBehavior = e.dataset.scrollBehavior || 'default';
    switch (scrollBehavior) {
      case 'default':
        y = e.offsetTop + offset;
        break;
      case 'center':
        if (e.offsetHeight < window.innerHeight) {
          y = e.offsetTop - (window.innerHeight - e.offsetHeight) / 2 + offset;
        } else {
          y = e.offsetTop - offset;
        }
        break;
      case 'previous':
        if (e.previousElementSibling) {
          const prev = e.previousElementSibling as HTMLElement;
          y = prev.offsetTop + prev.offsetHeight + offset;
        } else {
          y = e.offsetTop + offset;
        }
        break;
      default:
        y = e.offsetTop + offset;
        break;
    }
  }

  if (!style) style = 'smooth';
  if (!duration) duration = 750;

  if (style === 'instant') {
    window.scrollTo(0, y);
    return;
  }

  start = Date.now();
  cy = window.scrollY;
  dy = y - cy;
  switch (style) {
    case 'linear':
      easing = (t: number) => t;
      break;
    case 'smooth':
      easing = (t: number) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1);
      break;
    default:
      easing = (t: number) => t;
  }

  const frame = function (): void {
    const t = Date.now() - start;
    if (t >= duration) {
      window.scroll(0, y);
    } else {
      window.scroll(0, cy + dy * easing(t / duration));
      requestAnimationFrame(frame);
    }
  };
  frame();
}

export function scrollToTop(): void {
  scrollToElement(null);
}

