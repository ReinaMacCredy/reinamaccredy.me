import type { OnVisible } from '../lib/utils/onvisible';

interface EffectDefinition {
  type?: 'transition' | 'animate' | 'manual';
  target?: string;
  transition?: (speed: number, delay: number) => string;
  rewind?: (this: HTMLElement, intensity?: number, isChildren?: boolean) => void;
  play?: (this: HTMLElement, intensity?: number, isChildren?: boolean) => void | ((this: HTMLElement, speed: number, delay?: number) => void);
  keyframes?: (intensity: number) => Keyframe[];
  options?: (speed: number, delay: number) => KeyframeAnimationOptions;
}

export function registerEffects({ onvisible }: { onvisible: OnVisible }): void {
  const eff = onvisible.registerEffect;

  eff('fade-right-original', {
    type: 'transition',
    transition: function (speed: number, delay: number): string {
      return 'opacity ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '') + ', ' + 'transform ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
    },
    rewind: function (this: HTMLElement, intensity: number = 0): void {
      this.style.opacity = '0';
      this.style.transform = 'translateX(' + (-1.5 * intensity) + 'rem)';
    },
    play: function (this: HTMLElement): void {
      this.style.opacity = '1';
      this.style.transform = 'none';
    },
  });

  eff('fade-left', {
    type: 'transition',
    transition: function (speed: number, delay: number): string {
      return 'opacity ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '') + ', ' + 'transform ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
    },
    rewind: function (this: HTMLElement, intensity: number = 0): void {
      this.style.opacity = '0';
      this.style.transform = 'translateX(' + (1.0 * intensity) + 'rem)';
    },
    play: function (this: HTMLElement): void {
      this.style.opacity = '1';
      this.style.transform = 'none';
    },
  });

  eff('fade-down', {
    type: 'transition',
    transition: function (speed: number, delay: number): string {
      return 'opacity ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '') + ', ' + 'transform ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
    },
    rewind: function (this: HTMLElement, intensity: number = 0): void {
      this.style.opacity = '0';
      this.style.transform = 'translateY(' + (-1.5 * intensity) + 'rem)';
    },
    play: function (this: HTMLElement): void {
      this.style.opacity = '1';
      this.style.transform = 'none';
    },
  });

  eff('fade-up', {
    type: 'transition',
    transition: function (speed: number, delay: number): string {
      return 'opacity ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '') + ', ' + 'transform ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
    },
    rewind: function (this: HTMLElement, intensity: number = 0): void {
      this.style.opacity = '0';
      this.style.transform = 'translateY(' + (1.5 * intensity) + 'rem)';
    },
    play: function (this: HTMLElement): void {
      this.style.opacity = '1';
      this.style.transform = 'none';
    },
  });

  eff('fade-in', {
    type: 'transition',
    transition: function (speed: number, delay: number): string {
      return 'opacity ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
    },
    rewind: function (this: HTMLElement): void {
      this.style.opacity = '0';
    },
    play: function (this: HTMLElement): void {
      this.style.opacity = '1';
    },
  });

  eff('fade-in-background', {
    type: 'manual',
    rewind: function (this: HTMLElement): void {
      this.style.removeProperty('--onvisible-delay');
      this.style.removeProperty('--onvisible-background-color');
    },
    play: function (this: HTMLElement, speedOrIntensity: number, delayOrIsChildren?: number | boolean): void {
      const speed = speedOrIntensity;
      const delay = typeof delayOrIsChildren === 'number' ? delayOrIsChildren : undefined;
      this.style.setProperty('--onvisible-speed', speed + 's');
      if (delay) this.style.setProperty('--onvisible-delay', delay + 's');
      this.style.setProperty('--onvisible-background-color', 'rgba(0,0,0,0.001)');
    },
  });

  eff('zoom-in-image', {
    type: 'transition',
    target: 'img',
    transition: function (speed: number, delay: number): string {
      return 'transform ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
    },
    rewind: function (this: HTMLElement): void {
      this.style.transform = 'scale(1)';
    },
    play: function (this: HTMLElement, intensity: number = 0): void {
      this.style.transform = 'scale(' + (1 + 0.1 * intensity) + ')';
    },
  });

  eff('zoom-out-image', {
    type: 'transition',
    target: 'img',
    transition: function (speed: number, delay: number): string {
      return 'transform ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
    },
    rewind: function (this: HTMLElement, intensity: number = 0): void {
      this.style.transform = 'scale(' + (1 + 0.1 * intensity) + ')';
    },
    play: function (this: HTMLElement): void {
      this.style.transform = 'none';
    },
  });

  eff('focus-image', {
    type: 'transition',
    target: 'img',
    transition: function (speed: number, delay: number): string {
      return 'transform ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '') + ', filter ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
    },
    rewind: function (this: HTMLElement, intensity: number = 0): void {
      this.style.transform = 'scale(' + (1 + 0.05 * intensity) + ')';
      this.style.filter = 'blur(0.25rem)';
    },
    play: function (this: HTMLElement): void {
      this.style.transform = 'none';
      this.style.filter = 'none';
    },
  });

  eff('blur-in', {
    type: 'transition',
    transition: function (speed: number, delay: number): string {
      return 'opacity ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '') + ', filter ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
    },
    rewind: function (this: HTMLElement): void {
      this.style.opacity = '0';
      this.style.filter = 'blur(0.25rem)';
    },
    play: function (this: HTMLElement): void {
      this.style.opacity = '1';
      this.style.filter = 'none';
    },
  });
}

