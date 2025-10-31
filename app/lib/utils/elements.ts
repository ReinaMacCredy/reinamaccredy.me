export function loadElements(parent: ParentNode): void {
  let list: NodeListOf<HTMLElement>;
  let e: HTMLElement | null;
  let x: string | null;
  let i: number;

  list = parent.querySelectorAll('iframe[data-src]:not([data-src=""])');
  for (i = 0; i < list.length; i += 1) {
    const iframe = list[i] as HTMLIFrameElement;
    const dataSrc = iframe.dataset.src;
    if (dataSrc && iframe.contentWindow) {
      iframe.contentWindow.location.replace(dataSrc);
      iframe.dataset.initialSrc = dataSrc;
      iframe.dataset.src = '';
    }
  }

  list = parent.querySelectorAll('video[autoplay]');
  for (i = 0; i < list.length; i += 1) {
    const video = list[i] as HTMLVideoElement;
    if (video.paused) video.play();
  }

  e = parent.querySelector('[data-autofocus="1"]') as HTMLElement | null;
  x = e ? e.tagName : null;
  switch (x) {
    case 'FORM':
      e = (e as HTMLFormElement).querySelector('.field input, .field select, .field textarea') as HTMLElement | null;
      if (e) e.focus();
      break;
    default:
      break;
  }

  list = parent.querySelectorAll('unloaded-script');
  for (i = 0; i < list.length; i += 1) {
    const scriptEl = list[i];
    const scriptElement = document.createElement('script');
    scriptElement.setAttribute('data-loaded', '');
    const src = scriptEl.getAttribute('src');
    if (src) scriptElement.setAttribute('src', src);
    const textContent = scriptEl.textContent;
    if (textContent) scriptElement.textContent = textContent;
    scriptEl.replaceWith(scriptElement);
  }

  const loadevent = new Event('loadelements');
  list = parent.querySelectorAll('[data-unloaded]');
  list.forEach((element) => {
    element.removeAttribute('data-unloaded');
    element.dispatchEvent(loadevent);
  });
}

export function unloadElements(parent: ParentNode): void {
  let list: NodeListOf<HTMLElement>;
  let i: number;

  list = parent.querySelectorAll('iframe[data-src=""]');
  for (i = 0; i < list.length; i += 1) {
    const iframe = list[i] as HTMLIFrameElement;
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

  list = parent.querySelectorAll('video');
  for (i = 0; i < list.length; i += 1) {
    const video = list[i] as HTMLVideoElement;
    if (!video.paused) video.pause();
  }

  const focused = document.querySelector(':focus') as HTMLElement | null;
  if (focused) focused.blur();
}

