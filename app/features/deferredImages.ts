import type { ScrollEvents } from '../types/core';

export function initDeferredImages({ scrollEvents }: { scrollEvents: ScrollEvents }): {
  loadDeferredContent: (parent: ParentNode) => void;
  unloadDeferredContent: (parent: ParentNode) => void;
} {
  function loadDeferredContent(parent: ParentNode): void {
    const a = parent.querySelectorAll<HTMLIFrameElement>('iframe[data-src]:not([data-src=""])');
    
    for (let i = 0; i < a.length; i++) {
      const iframe = a[i];
      const dataSrc = iframe.dataset.src;
      if (dataSrc && iframe.contentWindow) {
        iframe.contentWindow.location.replace(dataSrc);
        iframe.dataset.initialSrc = dataSrc;
        iframe.dataset.src = '';
      }
    }
    
    const videos = parent.querySelectorAll<HTMLVideoElement>('video[autoplay]');
    for (let i = 0; i < videos.length; i++) {
      if (videos[i].paused) {
        videos[i].play();
      }
    }
    
    const autofocusElement = parent.querySelector<HTMLElement>('[data-autofocus="1"]');
    if (autofocusElement) {
      const tag = autofocusElement.tagName;
      switch (tag) {
        case 'FORM':
          const focusableElement = autofocusElement.querySelector<HTMLElement>('.field input, .field select, .field textarea');
          if (focusableElement) {
            focusableElement.focus();
          }
          break;
        default:
          break;
      }
    }
    
    const unloadedScripts = parent.querySelectorAll('unloaded-script');
    for (let i = 0; i < unloadedScripts.length; i++) {
      const script = document.createElement('script');
      script.setAttribute('data-loaded', '');
      const srcAttr = unloadedScripts[i].getAttribute('src');
      if (srcAttr) {
        script.setAttribute('src', srcAttr);
      }
      const textContent = unloadedScripts[i].textContent;
      if (textContent) {
        script.textContent = textContent;
      }
      unloadedScripts[i].replaceWith(script);
    }
    
    const loadelementsEvent = new Event('loadelements');
    const unloadedElements = parent.querySelectorAll<HTMLElement>('[data-unloaded]');
    unloadedElements.forEach((element) => {
      element.removeAttribute('data-unloaded');
      element.dispatchEvent(loadelementsEvent);
    });
  }
  
  function unloadDeferredContent(parent: ParentNode): void {
    const a = parent.querySelectorAll<HTMLIFrameElement>('iframe[data-src=""]');
    
    for (let i = 0; i < a.length; i++) {
      const iframe = a[i];
      if (iframe.dataset.srcUnload === '0') continue;
      if ('initialSrc' in iframe.dataset && iframe.dataset.initialSrc) {
        iframe.dataset.src = iframe.dataset.initialSrc;
      } else {
        iframe.dataset.src = iframe.src;
      }
      if (iframe.contentWindow) {
        iframe.contentWindow.location.replace('about:blank');
      }
    }
    
    const videos = parent.querySelectorAll<HTMLVideoElement>('video');
    for (let i = 0; i < videos.length; i++) {
      if (!videos[i].paused) {
        videos[i].pause();
      }
    }
    
    const focusedElement = document.querySelector<HTMLElement>(':focus');
    if (focusedElement) {
      focusedElement.blur();
    }
  }
  
  return {
    loadDeferredContent,
    unloadDeferredContent
  };
}

