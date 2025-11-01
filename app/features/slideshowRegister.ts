import { initSlideshows } from './slideshow';
import { detectClient } from '../lib/utils/client';
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

export function registerSlideshows({ scrollEvents }: { scrollEvents: ScrollEvents }): void {
  const { SlideshowBackground } = initSlideshows({ scrollEvents });
  const CreateSlideshowBackground = class extends SlideshowBackground {
    constructor(id: string, settings: SlideshowSettings) {
      super(id, settings, scrollEvents);
    }
  };
  const client = detectClient();
  const isMobile = client.mobile;
  
  const supportsWebP = ((): boolean => {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  })();

  const getImageSrc = (webpPath: string): string => {
    if (supportsWebP && !isMobile) {
      return webpPath;
    }
    return webpPath.replace('.webp', '.jpg');
  };

  const target = document.querySelector('#container06');
  if (target) {
    const $slideshowBackground = document.createElement('div');
    $slideshowBackground.className = 'slideshow-background';
    target.insertBefore($slideshowBackground, target.firstChild);
    
    const imageConfig = {
      target: '#container06 > .slideshow-background',
      wait: 0,
      defer: isMobile ? true : true,
      order: 'random' as const,
      transition: { 
        style: 'crossfade' as const, 
        speed: isMobile ? 1500 : 1000,
        delay: isMobile ? 8000 : 6000,
        resume: 12000,
      },
      images: [
        { src: getImageSrc('/assets/images/container06-67b79e7f.webp?v=9ba4655d'), position: 'center', motion: 'none', speed: 2, caption: 'Untitled' },
        { src: getImageSrc('/assets/images/container06-9546aa94.webp?v=9ba4655d'), position: 'center', motion: 'none', speed: 2, caption: 'Untitled' },
        { src: getImageSrc('/assets/images/container06-82e1a614.webp?v=9ba4655d'), position: 'center', motion: 'none', speed: 2, caption: 'Untitled' },
        { src: getImageSrc('/assets/images/container06-e40d2b2f.webp?v=9ba4655d'), position: 'center', motion: 'none', speed: 2, caption: 'Untitled' },
      ],
    };
    
    if (isMobile) {
      imageConfig.images = imageConfig.images.slice(0, 2);
    }
    
    new CreateSlideshowBackground('container06', imageConfig);
  }
}

