import type { OnVisible } from '../lib/utils/onvisible';

export function registerPageOnVisible({ onvisible }: { onvisible: OnVisible }): void {
  onvisible.add('#container03', { style: 'fade-up', speed: 2500, intensity: 6, threshold: 3, delay: 0, replay: false, initialState: true });

  onvisible.add('#text05', { style: 'fade-left', speed: 1000, intensity: 10, threshold: 3, delay: 625, stagger: 125, staggerSelector: ':scope > *', replay: false, initialState: true });

  onvisible.add('#icons01', { style: 'fade-right-original', speed: 500, intensity: 2, threshold: 1, delay: 0, stagger: 125, staggerSelector: ':scope > li', replay: true, initialState: true });
  onvisible.add('#container06', { style: 'fade-up', speed: 1375, intensity: 6, threshold: 3, delay: 0, replay: false, initialState: false });
  onvisible.add('#image01', { style: 'fade-left', speed: 1000, intensity: 5, threshold: 3, delay: 0, replay: true });
  onvisible.add('#text07', { style: 'blur-in', speed: 1250, intensity: 10, threshold: 3, delay: 0, replay: false });
  onvisible.add('#container05', { style: 'blur-in', speed: 2000, intensity: 6, threshold: 1, delay: 0, replay: false });
  onvisible.add('#image04', { style: 'blur-in', speed: 250, intensity: 5, threshold: 3, delay: 0, replay: true });
  onvisible.add('#image05', { style: 'fade-left', speed: 1000, intensity: 5, threshold: 3, delay: 0, replay: true });
}

