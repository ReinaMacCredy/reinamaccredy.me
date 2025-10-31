import type { EventListenerOptions } from '../../types/dom';

export const on = (type: string, listener: EventListener, options?: EventListenerOptions): void => {
  window.addEventListener(type, listener, options);
};

export const off = (type: string, listener: EventListener, options?: EventListenerOptions): void => {
  window.removeEventListener(type, listener, options);
};

export const $ = <T extends Element = Element>(selector: string): T | null => {
  return document.querySelector<T>(selector);
};

export const $$ = <T extends Element = Element>(selector: string): NodeListOf<T> => {
  return document.querySelectorAll<T>(selector);
};

export const trigger = (type: string): void => {
  window.dispatchEvent(new Event(type));
};

export const cssRules = (selectorText: string): CSSStyleRule[] => {
  const styleSheets = document.styleSheets;
  const results: CSSStyleRule[] = [];
  
  const collectRules = (rules: CSSRuleList): void => {
    for (let i = 0; i < rules.length; i += 1) {
      const rule = rules[i];
      if (rule instanceof CSSMediaRule && matchMedia(rule.conditionText).matches) {
        collectRules(rule.cssRules);
      } else if (rule instanceof CSSStyleRule && rule.selectorText === selectorText) {
        results.push(rule);
      }
    }
  };
  
  for (let i = 0; i < styleSheets.length; i += 1) {
    const sheet = styleSheets[i];
    if (sheet instanceof CSSStyleSheet) {
      collectRules(sheet.cssRules);
    }
  }
  return results;
};

