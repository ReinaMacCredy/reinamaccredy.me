import { scrollToElement, scrollPointSpeed } from '../lib/utils/scroll';
import { loadElements, unloadElements } from '../lib/utils/elements';
import type { SectionsNavigation, SectionsNavigationConfig, SectionConfig } from '../types/core';

const proxy = (name: string) => (): void => {
  const fn = (window as unknown as Record<string, unknown>)[name];
  if (typeof fn === 'function') {
    (fn as () => void)();
  }
};

export function setupSectionsNavigation(): Partial<SectionsNavigation> {
  return {
    nextScrollPoint: proxy('_nextScrollPoint'),
    previousScrollPoint: proxy('_previousScrollPoint'),
    firstScrollPoint: proxy('_firstScrollPoint'),
    lastScrollPoint: proxy('_lastScrollPoint'),
    nextSection: proxy('_nextSection'),
    previousSection: proxy('_previousSection'),
    firstSection: proxy('_firstSection'),
    lastSection: proxy('_lastSection'),
  };
}

function thisHash(): string | null {
  const raw = window.location.hash ? window.location.hash.substring(1) : null;
  if (!raw) return null;
  const h = typeof raw === 'string' ? raw.toLowerCase() : raw;
  return h;
}

function scrollPointParent(target: HTMLElement | null): HTMLElement | null {
  let current = target;
  while (current) {
    if (current.parentElement && current.parentElement.tagName === 'SECTION') break;
    current = current.parentElement;
  }
  return current;
}

function resetSectionChangeElements(section: HTMLElement): void {
  const elements = section.querySelectorAll<HTMLElement>('[data-reset-on-section-change="1"]');
  for (const e of elements) {
    const tag = e ? e.tagName : null;
    switch (tag) {
      case 'FORM':
        (e as HTMLFormElement).reset();
        break;
      default:
        break;
    }
  }
}

export function setupSectionsNavigationReal({
  header = document.querySelector('#header'),
  footer = document.querySelector('#footer'),
  title = document.title,
  sectionsConfig = {},
}: SectionsNavigationConfig = {}): SectionsNavigation {
  let locked = false;

  function activateSection(section: HTMLElement, scrollPoint?: HTMLElement | null): boolean {
    if (!section.classList.contains('inactive')) {
      const name = section ? section.id.replace(/-section$/, '') : null;
      const disableAutoScroll = name && sectionsConfig[name]?.disableAutoScroll ? true : false;
      if (scrollPoint) scrollToElement(scrollPoint, 'smooth', scrollPointSpeed(scrollPoint));
      else if (!disableAutoScroll) scrollToElement(null);
      return false;
    }

    locked = true;

    if (location.hash === '#main') history.replaceState(null, null, '#');

    const name = section ? section.id.replace(/-section$/, '') : null;
    const hideHeader = name && sectionsConfig[name]?.hideHeader ? true : false;
    const hideFooter = name && sectionsConfig[name]?.hideFooter ? true : false;
    const disableAutoScroll = name && sectionsConfig[name]?.disableAutoScroll ? true : false;

    if (header && hideHeader) {
      header.classList.add('hidden');
      (header as HTMLElement).style.display = 'none';
    }
    if (footer && hideFooter) {
      footer.classList.add('hidden');
      (footer as HTMLElement).style.display = 'none';
    }

    const currentSection = document.querySelector<HTMLElement>('#main > .inner > section:not(.inactive)');
    if (currentSection) {
      currentSection.classList.add('inactive');
      currentSection.classList.remove('active');
      currentSection.style.display = 'none';
      document.title = title;
      unloadElements(currentSection);
      resetSectionChangeElements(currentSection);
      clearTimeout((window as unknown as Record<string, unknown>)._sectionTimeoutId as NodeJS.Timeout);
    }

    if (header && !hideHeader) {
      (header as HTMLElement).style.display = '';
      header.classList.remove('hidden');
    }
    if (footer && !hideFooter) {
      (footer as HTMLElement).style.display = '';
      footer.classList.remove('hidden');
    }

    section.classList.remove('inactive');
    section.classList.add('active');
    section.style.display = '';

    window.dispatchEvent(new Event('resize'));
    if (section.dataset.title) document.title = section.dataset.title + ' - ' + title;
    loadElements(section);

    if (scrollPoint) scrollToElement(scrollPoint, 'instant');
    else if (!disableAutoScroll) scrollToElement(null, 'instant');

    locked = false;
    return true;
  }

  function nextScrollPoint(event?: Event): void {
    const target = event?.target as HTMLElement | null;
    let e = scrollPointParent(target);
    if (!e) return;
    let scrollPointTarget: HTMLElement | null = null;
    let id: string | undefined;
    while (e && e.nextElementSibling) {
      e = e.nextElementSibling as HTMLElement;
      if (e.dataset.scrollId) {
        scrollPointTarget = e;
        id = e.dataset.scrollId;
        break;
      }
    }
    if (!scrollPointTarget || !id) return;
    if (scrollPointTarget.dataset.scrollInvisible === '1') scrollToElement(scrollPointTarget, 'smooth', scrollPointSpeed(scrollPointTarget));
    else window.location.href = '#' + id;
  }

  function previousScrollPoint(event?: Event): void {
    const target = event?.target as HTMLElement | null;
    let e = scrollPointParent(target);
    if (!e) return;
    let scrollPointTarget: HTMLElement | null = null;
    let id: string | undefined;
    while (e && e.previousElementSibling) {
      e = e.previousElementSibling as HTMLElement;
      if (e.dataset.scrollId) {
        scrollPointTarget = e;
        id = e.dataset.scrollId;
        break;
      }
    }
    if (!scrollPointTarget || !id) return;
    if (scrollPointTarget.dataset.scrollInvisible === '1') scrollToElement(scrollPointTarget, 'smooth', scrollPointSpeed(scrollPointTarget));
    else window.location.href = '#' + id;
  }

  function firstScrollPoint(event?: Event): void {
    const target = event?.target as HTMLElement | null;
    let e = scrollPointParent(target);
    if (!e) return;
    let scrollPointTarget: HTMLElement | null = null;
    let id: string | undefined;
    while (e && e.previousElementSibling) {
      e = e.previousElementSibling as HTMLElement;
      if (e.dataset.scrollId) {
        scrollPointTarget = e;
        id = e.dataset.scrollId;
      }
    }
    if (!scrollPointTarget || !id) return;
    if (scrollPointTarget.dataset.scrollInvisible === '1') scrollToElement(scrollPointTarget, 'smooth', scrollPointSpeed(scrollPointTarget));
    else window.location.href = '#' + id;
  }

  function lastScrollPoint(event?: Event): void {
    const target = event?.target as HTMLElement | null;
    let e = scrollPointParent(target);
    if (!e) return;
    let scrollPointTarget: HTMLElement | null = null;
    let id: string | undefined;
    while (e && e.nextElementSibling) {
      e = e.nextElementSibling as HTMLElement;
      if (e.dataset.scrollId) {
        scrollPointTarget = e;
        id = e.dataset.scrollId;
      }
    }
    if (!scrollPointTarget || !id) return;
    if (scrollPointTarget.dataset.scrollInvisible === '1') scrollToElement(scrollPointTarget, 'smooth', scrollPointSpeed(scrollPointTarget));
    else window.location.href = '#' + id;
  }

  function nextSection(): void {
    const section = document.querySelector<HTMLElement>('#main > .inner > section.active')?.nextElementSibling as HTMLElement | null;
    if (!section || section.tagName !== 'SECTION') return;
    window.location.href = '#' + section.id.replace(/-section$/, '');
  }

  function previousSection(): void {
    const section = document.querySelector<HTMLElement>('#main > .inner > section.active')?.previousElementSibling as HTMLElement | null;
    if (!section || section.tagName !== 'SECTION') return;
    window.location.href = '#' + (section.matches(':first-child') ? '' : section.id.replace(/-section$/, ''));
  }

  function firstSection(): void {
    const section = document.querySelector<HTMLElement>('#main > .inner > section:first-of-type');
    if (!section || section.tagName !== 'SECTION') return;
    window.location.href = '#' + section.id.replace(/-section$/, '');
  }

  function lastSection(): void {
    const section = document.querySelector<HTMLElement>('#main > .inner > section:last-of-type');
    if (!section || section.tagName !== 'SECTION') return;
    window.location.href = '#' + section.id.replace(/-section$/, '');
  }

  function scrollToTopCompat(): void {
    scrollToElement(null);
    const section = document.querySelector<HTMLElement>('section.active');
    if (section) {
      let id = section.id.replace(/-section$/, '');
      if (id === 'main') id = '';
      history.pushState(null, null, '#' + id);
    }
  }

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  const h = thisHash();
  let initialScrollPoint: HTMLElement | null = null;
  let initialSection: HTMLElement | null = null;
  let initialId: string | undefined;

  let e = document.querySelector<HTMLElement>(`[data-scroll-id="${h}"]`);
  if (e) {
    initialScrollPoint = e;
    initialSection = initialScrollPoint.parentElement as HTMLElement;
    initialId = initialSection.id;
  } else {
    e = document.getElementById(`${h ? h : 'main'}-section`) as HTMLElement | null;
    if (e) {
      initialScrollPoint = null;
      initialSection = e;
      initialId = initialSection.id;
    }
  }

  if (!initialSection) {
    initialScrollPoint = null;
    initialSection = document.getElementById('main-section') as HTMLElement | null;
    initialId = initialSection?.id;
    history.replaceState(undefined, undefined, '#');
  }

  if (initialId) {
    const hidden = document.querySelectorAll<HTMLElement>(`#main > .inner > section:not([id="${initialId}"])`);
    for (let k = 0; k < hidden.length; k += 1) {
      hidden[k].className = 'inactive';
      hidden[k].style.display = 'none';
    }
  }
  if (initialSection) initialSection.classList.add('active');

  window.addEventListener('load', () => {
    if (initialSection?.dataset?.title) document.title = `${initialSection.dataset.title} - ${title}`;
    if (initialSection) loadElements(initialSection);
    if (header) loadElements(header);
    if (footer) loadElements(footer);
    scrollToElement(initialScrollPoint || null, 'instant');
  }, { once: true });

  window.addEventListener('hashchange', (event: HashChangeEvent) => {
    if (locked) return false;
    const h2 = thisHash();
    if (h2 && !/^[a-zA-Z0-9\-]+$/.test(h2)) return false;

    let section: HTMLElement | null = null;
    let scrollPoint: HTMLElement | null = null;

    let e2 = document.querySelector<HTMLElement>(`[data-scroll-id="${h2}"]`);
    if (e2) {
      scrollPoint = e2;
      section = scrollPoint.parentElement as HTMLElement;
    } else {
      e2 = document.getElementById(`${h2 ? h2 : 'main'}-section`) as HTMLElement | null;
      if (e2) {
        scrollPoint = null;
        section = e2;
      } else {
        scrollPoint = null;
        section = document.getElementById('main-section') as HTMLElement | null;
        history.replaceState(undefined, undefined, '#');
      }
    }
    if (!section) return false;
    activateSection(section, scrollPoint);
    return false;
  });

  window.addEventListener('click', (event: MouseEvent) => {
    let t = event.target as HTMLElement | null;
    const tagName = t?.tagName.toUpperCase();
    switch (tagName) {
      case 'IMG':
      case 'SVG':
      case 'USE':
      case 'U':
      case 'STRONG':
      case 'EM':
      case 'CODE':
      case 'S':
      case 'MARK':
      case 'SPAN': {
        while ((t = t?.parentElement || null)) if (t.tagName === 'A') break;
        if (!t) return;
        break;
      }
      default:
        break;
    }
    if (t.tagName === 'A') {
      const anchor = t as HTMLAnchorElement;
      const href = anchor.getAttribute('href');
      if (href !== null && href.substring(0, 1) === '#') {
        const hash = anchor.hash || `#${href.substring(1)}`;
        const target = document.querySelector<HTMLElement>(`[data-scroll-id="${hash.substring(1)}"][data-scroll-invisible="1"]`);
        if (target) {
          event.preventDefault();
          const section = target.parentElement as HTMLElement | null;
          if (section && section.classList.contains('inactive')) {
            history.pushState(null, null, '#' + section.id.replace(/-section$/, ''));
            activateSection(section, target);
          } else {
            scrollToElement(target, 'smooth', scrollPointSpeed(target));
          }
        } else if (hash === window.location.hash) {
          event.preventDefault();
          history.replaceState(undefined, undefined, '#');
          location.replace(hash);
        }
      }
    }
  });

  return {
    activateSection,
    nextScrollPoint,
    previousScrollPoint,
    firstScrollPoint,
    lastScrollPoint,
    nextSection,
    previousSection,
    firstSection,
    lastSection,
    scrollToTop: scrollToTopCompat,
  };
}

