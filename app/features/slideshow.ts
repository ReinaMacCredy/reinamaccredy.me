import type { ScrollEvents } from '../types/core';

interface SlideshowImage {
  src: string;
  position: string;
  motion?: string;
  speed?: number;
  caption?: string;
  linkUrl?: { href?: string; target?: string; onclick?: (event: Event) => void } | string;
}

interface SlideshowTransition {
  style: 'crossfade' | 'fade' | 'instant';
  speed: number;
  delay: number | false;
  resume: number | false;
}

interface SlideshowSettings {
  id?: string;
  images: SlideshowImage[];
  target: string;
  wrapper?: string;
  wait?: number;
  defer?: boolean;
  navigation?: boolean;
  order?: 'default' | 'reverse' | 'random';
  preserveImageAspectRatio?: boolean;
  transition?: SlideshowTransition;
}

interface DragPosition {
  x: number;
  y: number;
}

class SlideshowBackground {
  id: string;
  wait: number;
  defer: boolean;
  navigation: boolean;
  order: 'default' | 'reverse' | 'random';
  preserveImageAspectRatio: boolean;
  transition: SlideshowTransition;
  images: SlideshowImage[];
  preload: boolean;
  locked: boolean;
  $target: HTMLElement;
  $wrapper: HTMLElement | null;
  pos: number;
  lastPos: number;
  $slides: HTMLElement[];
  img: HTMLImageElement;
  $img: HTMLImageElement;
  preloadTimeout: NodeJS.Timeout | null;
  resumeTimeout: NodeJS.Timeout | null;
  transitionInterval: NodeJS.Timeout | null;

  constructor(id: string, settings: SlideshowSettings, scrollEvents: ScrollEvents) {
    if (!('images' in settings) || !('target' in settings)) return;
    this.id = id;
    this.wait = 'wait' in settings ? settings.wait! : 0;
    this.defer = 'defer' in settings ? settings.defer! : false;
    this.navigation = 'navigation' in settings ? settings.navigation! : false;
    this.order = 'order' in settings ? settings.order! : 'default';
    this.preserveImageAspectRatio = 'preserveImageAspectRatio' in settings ? settings.preserveImageAspectRatio! : false;
    this.transition = 'transition' in settings ? settings.transition! : { style: 'crossfade', speed: 1000, delay: 6000, resume: 12000 };
    this.images = settings.images;
    this.preload = true;
    this.locked = false;
    const targetEl = document.querySelector(settings.target);
    if (!targetEl) return;
    this.$target = targetEl as HTMLElement;
    this.$wrapper = 'wrapper' in settings && settings.wrapper ? document.querySelector(settings.wrapper) as HTMLElement | null : null;
    this.pos = 0;
    this.lastPos = 0;
    this.$slides = [];
    this.img = document.createElement('img');
    this.preloadTimeout = null;
    this.resumeTimeout = null;
    this.transitionInterval = null;

    if ((window as unknown as Record<string, unknown>).CARRD_DISABLE_DEFER === true) {
      this.defer = false;
      this.preload = false;
    }
    if (this.preserveImageAspectRatio && this.transition.style === 'crossfade') this.transition.style = 'fade';
    if (this.transition.delay !== false) {
      switch (this.transition.style) {
        case 'crossfade':
          this.transition.delay = Math.max(this.transition.delay as number, this.transition.speed * 2);
          break;
        case 'fade':
          this.transition.delay = Math.max(this.transition.delay as number, this.transition.speed * 3);
          break;
        case 'instant':
        default:
          break;
      }
    }
    if (!this.$wrapper) this.navigation = false;

    if (this.defer) {
      scrollEvents.add({ element: this.$target, enter: () => this.preinit() });
    } else {
      this.preinit();
    }
  }

  speedClassName(speed: number): string {
    switch (speed) {
      case 1:
        return 'slow';
      default:
      case 2:
        return 'normal';
      case 3:
        return 'fast';
    }
  }

  preinit(): void {
    if (this.preload) {
      this.preloadTimeout = setTimeout(() => {
        this.$target.classList.add('is-loading');
      }, this.transition.speed);
      setTimeout(() => { this.init(); }, 0);
    } else {
      this.init();
    }
  }

  init(): void {
    let loaded = 0;
    let hasLinks = false;
    let dragStart: DragPosition | null = null;
    let dragEnd: DragPosition | null = null;

    this.$target.classList.add('slideshow-background');
    this.$target.classList.add(this.transition.style);

    if (this.navigation && this.$wrapper) {
      this.$next = document.createElement('div');
      this.$next.classList.add('nav', 'next');
      this.$next.addEventListener('click', () => { this.stopTransitioning(); this.next('default'); });
      this.$wrapper.appendChild(this.$next);

      this.$previous = document.createElement('div');
      this.$previous.classList.add('nav', 'previous');
      this.$previous.addEventListener('click', () => { this.stopTransitioning(); this.previous('default'); });
      this.$wrapper.appendChild(this.$previous);

      this.$wrapper.addEventListener('touchstart', (event: TouchEvent) => {
        if (event.touches.length > 1) return;
        dragStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
      });
      this.$wrapper.addEventListener('touchmove', (event: TouchEvent) => {
        if (!dragStart || event.touches.length > 1) return;
        dragEnd = { x: event.touches[0].clientX, y: event.touches[0].clientY };
        const dx = dragStart.x - dragEnd.x;
        if (Math.abs(dx) < 50) return;
        event.preventDefault();
        if (dx > 0) { this.stopTransitioning(); this.next('default'); }
        else if (dx < 0) { this.stopTransitioning(); this.previous('default'); }
      });
      this.$wrapper.addEventListener('touchend', () => { dragStart = null; dragEnd = null; });
    }

    for (let i = 0; i < this.images.length; i += 1) {
      if (this.preload) {
        this.$img = document.createElement('img');
        this.$img.src = this.images[i].src;
        this.$img.addEventListener('load', () => { loaded += 1; });
      }
      const $slide = document.createElement('div');
      $slide.style.backgroundImage = `url('${this.images[i].src}')`;
      $slide.style.backgroundPosition = this.images[i].position;
      $slide.style.backgroundRepeat = 'no-repeat';
      $slide.style.backgroundSize = this.preserveImageAspectRatio ? 'contain' : 'cover';
      $slide.setAttribute('role', 'img');
      $slide.setAttribute('aria-label', this.images[i].caption || '');
      this.$target.appendChild($slide);

      if (this.images[i].motion !== 'none') {
        $slide.classList.add(this.images[i].motion || '');
        $slide.classList.add(this.speedClassName(this.images[i].speed || 2));
      }
      if ('linkUrl' in this.images[i] && this.images[i].linkUrl) {
        $slide.style.cursor = 'pointer';
        ($slide as unknown as { _linkUrl: unknown })._linkUrl = this.images[i].linkUrl;
        hasLinks = true;
      }
      this.$slides.push($slide);
    }

    if (hasLinks) {
      this.$target.addEventListener('click', (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        const slide = target as unknown as { _linkUrl?: unknown };
        if (!('_linkUrl' in slide) || !slide._linkUrl) return;
        const link = slide._linkUrl;
        if (typeof link === 'object' && link !== null) {
          if ('onclick' in link && typeof link.onclick === 'function') { link.onclick(event); return; }
          if ('href' in link && typeof link.href === 'string') {
            if (link.href.charAt(0) === '#') { window.location.href = link.href; return; }
            if ('target' in link && link.target === '_blank') window.open(link.href);
            else window.location.href = link.href;
          }
        } else if (typeof link === 'string') {
          window.location.href = link;
        }
      });
    }

    switch (this.order) {
      case 'random': this.pos = Math.ceil(Math.random() * this.$slides.length) - 1; break;
      case 'reverse': this.pos = this.$slides.length - 1; break;
      case 'default':
      default: this.pos = 0; break;
    }
    this.lastPos = this.pos;

    if (this.preload) {
      const intervalId = setInterval(() => {
        if (loaded >= this.images.length) {
          clearInterval(intervalId);
          if (this.preloadTimeout) clearTimeout(this.preloadTimeout);
          this.$target.classList.remove('is-loading');
          this.start();
        }
      }, 250);
    } else {
      this.start();
    }
  }

  $next!: HTMLElement;
  $previous!: HTMLElement;

  move(direction: number, activeOrder?: 'default' | 'reverse' | 'random'): void {
    let order: 'default' | 'reverse' | 'random';
    if (!activeOrder) activeOrder = this.order;
    switch (direction) {
      case 1: order = activeOrder; break;
      case -1:
        switch (activeOrder) {
          case 'random': order = 'random'; break;
          case 'reverse': order = 'default'; break;
          case 'default':
          default: order = 'reverse'; break;
        }
        break;
      default:
        return;
    }

    let pos: number;
    switch (order) {
      case 'random':
        for (;;) { pos = Math.ceil(Math.random() * this.$slides.length) - 1; if (pos !== this.pos) break; }
        break;
      case 'reverse': pos = this.pos - 1; if (pos < 0) pos = this.$slides.length - 1; break;
      case 'default':
      default: pos = this.pos + 1; if (pos >= this.$slides.length) pos = 0; break;
    }
    this.show(pos);
  }

  next(activeOrder?: 'default' | 'reverse' | 'random'): void { this.move(1, activeOrder); }
  previous(activeOrder?: 'default' | 'reverse' | 'random'): void { this.move(-1, activeOrder); }

  show(pos: number): void {
    if (this.locked) return;
    this.lastPos = this.pos;
    this.pos = pos;
    switch (this.transition.style) {
      case 'instant':
        this.$slides[this.lastPos].classList.remove('top');
        this.$slides[this.pos].classList.add('top');
        this.$slides[this.pos].classList.add('visible');
        this.$slides[this.pos].classList.add('is-playing');
        this.$slides[this.lastPos].classList.remove('visible');
        this.$slides[this.lastPos].classList.remove('initial');
        this.$slides[this.lastPos].classList.remove('is-playing');
        break;
      case 'crossfade':
        this.locked = true;
        this.$slides[this.lastPos].classList.remove('top');
        this.$slides[this.pos].classList.add('top');
        this.$slides[this.pos].classList.add('visible');
        this.$slides[this.pos].classList.add('is-playing');
        setTimeout(() => {
          this.$slides[this.lastPos].classList.remove('visible');
          this.$slides[this.lastPos].classList.remove('initial');
          this.$slides[this.lastPos].classList.remove('is-playing');
          this.locked = false;
        }, this.transition.speed);
        break;
      case 'fade':
        this.locked = true;
        this.$slides[this.lastPos].classList.remove('visible');
        setTimeout(() => {
          this.$slides[this.lastPos].classList.remove('is-playing');
          this.$slides[this.lastPos].classList.remove('top');
          this.$slides[this.pos].classList.add('top');
          this.$slides[this.pos].classList.add('is-playing');
          this.$slides[this.pos].classList.add('visible');
          this.locked = false;
        }, this.transition.speed);
        break;
      default:
        break;
    }
  }

  start(): void {
    this.$slides[this.pos].classList.add('visible');
    this.$slides[this.pos].classList.add('top');
    this.$slides[this.pos].classList.add('initial');
    this.$slides[this.pos].classList.add('is-playing');
    if (this.$slides.length === 1) return;
    setTimeout(() => { this.startTransitioning(); }, this.wait);
  }

  startTransitioning(): void {
    if (this.transition.delay === false) return;
    this.transitionInterval = setInterval(() => { this.next(); }, this.transition.delay as number);
  }

  stopTransitioning(): void {
    if (this.transitionInterval) clearInterval(this.transitionInterval);
    if (this.transition.resume !== false) {
      if (this.resumeTimeout) clearTimeout(this.resumeTimeout);
      this.resumeTimeout = setTimeout(() => { this.startTransitioning(); }, this.transition.resume as number);
    }
  }
}

export function initSlideshows({ scrollEvents }: { scrollEvents: ScrollEvents }): {
  createBackground: (targetSelector: string, options: SlideshowSettings) => SlideshowBackground | null;
  SlideshowBackground: new (id: string, settings: SlideshowSettings, scrollEvents: ScrollEvents) => SlideshowBackground;
} {
  return {
    createBackground(targetSelector: string, options: SlideshowSettings): SlideshowBackground | null {
      const $targetRoot = document.querySelector(targetSelector);
      if (!$targetRoot) return null;
      return new SlideshowBackground(options.id || 'slideshow', options, scrollEvents);
    },
    SlideshowBackground: class extends SlideshowBackground {
      constructor(id: string, settings: SlideshowSettings) {
        super(id, settings, scrollEvents);
      }
    } as new (id: string, settings: SlideshowSettings) => SlideshowBackground,
  };
}

