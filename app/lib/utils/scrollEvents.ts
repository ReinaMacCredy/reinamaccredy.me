import type { ScrollEvents, ScrollEventsOptions, ScrollEventOptions } from '../../types/core';

export function createScrollEvents({ isIos = false }: ScrollEventsOptions = {}): ScrollEvents {
  const items: ScrollEvents['items'] = [];

  function add(o: ScrollEventOptions): void {
    items.push({
      element: o.element,
      triggerElement: 'triggerElement' in o && o.triggerElement ? o.triggerElement : o.element,
      enter: 'enter' in o ? o.enter : null,
      leave: 'leave' in o ? o.leave : null,
      mode: 'mode' in o ? o.mode : 4,
      threshold: 'threshold' in o ? o.threshold : 0.25,
      offset: 'offset' in o ? o.offset : 0,
      initialState: 'initialState' in o ? o.initialState : null,
      state: false,
    });
  }

  function handler(): void {
    let height: number;
    let top: number;
    let bottom: number;
    let scrollPad: number;

    if (isIos) {
      height = document.documentElement.clientHeight;
      top = document.body.scrollTop + window.scrollY;
      bottom = top + height;
      scrollPad = 125;
    } else {
      height = document.documentElement.clientHeight;
      top = document.documentElement.scrollTop;
      bottom = top + height;
      scrollPad = 0;
    }

    items.forEach((item) => {
      if (!item.enter && !item.leave) return;
      if (!item.triggerElement) return;
      if (item.triggerElement.offsetParent === null) {
        if (item.state === true && item.leave) {
          item.state = false;
          item.leave.apply(item.element);
          if (!item.enter) item.leave = null;
        }
        return;
      }
      const bcr = item.triggerElement.getBoundingClientRect();
      const elementTop = top + Math.floor(bcr.top);
      const elementBottom = elementTop + bcr.height;
      let viewportTop: number;
      let viewportBottom: number;
      let pad: number;
      let a: number;
      let b: number;
      let state: boolean;

      if (item.initialState !== null) {
        state = item.initialState;
        item.initialState = null;
      } else {
        switch (item.mode) {
          case 1:
          default:
            state = bottom > elementTop - item.offset && top < elementBottom + item.offset;
            break;
          case 2:
            a = top + height * 0.5;
            state = a > elementTop - item.offset && a < elementBottom + item.offset;
            break;
          case 3:
            a = top + height * item.threshold;
            if (a - height * 0.375 <= 0) a = 0;
            b = top + height * (1 - item.threshold);
            if (b + height * 0.375 >= document.body.scrollHeight - scrollPad) b = document.body.scrollHeight + scrollPad;
            state = b > elementTop - item.offset && a < elementBottom + item.offset;
            break;
          case 4:
            pad = height * item.threshold;
            viewportTop = top + pad;
            viewportBottom = bottom - pad;
            if (Math.floor(top) <= pad) viewportTop = top;
            if (Math.ceil(bottom) >= document.body.scrollHeight - pad) viewportBottom = bottom;
            if (viewportBottom - viewportTop >= elementBottom - elementTop) {
              state =
                (elementTop >= viewportTop && elementBottom <= viewportBottom) ||
                (elementTop >= viewportTop && elementTop <= viewportBottom) ||
                (elementBottom >= viewportTop && elementBottom <= viewportBottom);
            } else {
              state =
                (viewportTop >= elementTop && viewportBottom <= elementBottom) ||
                (elementTop >= viewportTop && elementTop <= viewportBottom) ||
                (elementBottom >= viewportTop && elementBottom <= viewportBottom);
            }
            break;
        }
      }

      if (state !== item.state) {
        item.state = state;
        if (item.state) {
          if (item.enter) {
            item.enter.apply(item.element);
            if (!item.leave) item.enter = null;
          }
        } else if (item.leave) {
          item.leave.apply(item.element);
          if (!item.enter) item.leave = null;
        }
      }
    });
  }

  function init(): void {
    window.addEventListener('load', handler);
    window.addEventListener('resize', handler);
    window.addEventListener('scroll', handler);
    handler();
  }

  return { items, add, handler, init };
}

