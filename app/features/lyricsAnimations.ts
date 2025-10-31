import { gsap } from 'gsap';
import SplitType from 'split-type';

export function createEntranceAnimation(element: HTMLElement, text: string): gsap.core.Timeline {
  gsap.killTweensOf(element);
  
  const lyricsZone = element.closest('#lyrics-zone') || document.getElementById('lyrics-zone');
  if (lyricsZone) {
    lyricsZone.classList.add('active');
  }
  
  element.textContent = text;
  
  gsap.set(element, {
    opacity: 1,
    visibility: 'visible'
  });
  
  try {
    const split = new SplitType(element, {
      types: 'chars',
      tagName: 'span'
    });
    
    const chars = element.querySelectorAll<HTMLElement>('.char');
    
    const tl = gsap.timeline();
    
    if (chars.length > 0) {
      gsap.set(chars, {
        opacity: 0,
        y: 20,
        filter: 'blur(10px)',
        scale: 0.5
      });
      
      tl.to(chars, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        scale: 1,
        duration: 0.6,
        stagger: 0.03,
        ease: 'back.out(1.7)'
      });
    } else {
      gsap.set(element, {
        opacity: 0,
        y: 20,
        filter: 'blur(10px)',
        scale: 0.5
      });
      
      tl.to(element, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        scale: 1,
        duration: 0.6,
        ease: 'back.out(1.7)'
      });
    }
    
    return tl;
  } catch (error) {
    console.warn('SplitType failed, using fallback animation:', error);
    const tl = gsap.timeline();
    gsap.set(element, { opacity: 0, y: 20 });
    tl.to(element, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'back.out(1.7)'
    });
    return tl;
  }
}

export function createExitAnimation(
  element: HTMLElement,
  options?: {
    stagger?: number;
    duration?: number;
    blur?: number;
    direction?: 'forward' | 'reverse' | 'center' | 'random';
  }
): gsap.core.Timeline {
  gsap.killTweensOf(element);
  
  const stagger = options?.stagger ?? 0.02;
  const duration = options?.duration ?? 0.4;
  const blur = options?.blur ?? 8;
  const direction = options?.direction ?? 'forward';
  
  let chars = element.querySelectorAll<HTMLElement>('.char');
  
  if (chars.length === 0) {
    try {
      const split = new SplitType(element, {
        types: 'chars',
        tagName: 'span'
      });
      chars = element.querySelectorAll<HTMLElement>('.char');
    } catch (error) {
      console.warn('SplitType failed for exit animation, using fallback:', error);
    }
  }
  
  const tl = gsap.timeline();
  
  let staggerConfig: number | gsap.StaggerVars;
  if (chars.length > 0) {
    switch (direction) {
      case 'reverse':
        staggerConfig = { each: stagger, from: 'end' };
        break;
      case 'center':
        staggerConfig = { each: stagger, from: 'center' };
        break;
      case 'random':
        staggerConfig = { each: stagger, from: 'random' };
        break;
      case 'forward':
      default:
        staggerConfig = { each: stagger };
        break;
    }
  } else {
    staggerConfig = 0;
  }
  
  const targets = chars.length > 0 ? chars : element;
  
  tl.to(targets, {
    opacity: 0,
    y: -15,
    filter: `blur(${blur}px)`,
    scale: 0.9,
    rotationX: 45,
    duration: duration,
    stagger: staggerConfig,
    ease: 'power2.in'
  });
  
  return tl;
}

export function killAllAnimations(
  entranceTimeline: gsap.core.Timeline | null | undefined,
  exitTimeline: gsap.core.Timeline | null | undefined
): void {
  if (entranceTimeline) {
    entranceTimeline.kill();
  }
  if (exitTimeline) {
    exitTimeline.kill();
  }
}

