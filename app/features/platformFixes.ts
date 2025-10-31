import type { ClientInfo } from '../types/core';

export function applyPlatformFixes({ client }: { client: ClientInfo }): void {
  const $body = document.body;
  
  if ('ontouchstart' in window) {
    $body.classList.add('is-touch');
  }
  
  if (client.os === 'ios') {
    const styleEl = document.createElement('style');
    styleEl.type = 'text/css';
    document.head.appendChild(styleEl);
    const sheet = styleEl.sheet;
    if (!sheet) return;
    
    if (client.osVersion <= 11) {
      (function () {
        sheet.insertRule('body.ios-focus-fix::before { }', 0);
        const rule = sheet.cssRules[0];
        if (rule instanceof CSSStyleRule) {
          rule.style.cssText = 'height: calc(100% + 60px)';
        }
        
        document.addEventListener('focus', function (_event: FocusEvent) {
          $body.classList.add('ios-focus-fix');
        }, true);
        
        document.addEventListener('blur', function (_event: FocusEvent) {
          $body.classList.remove('ios-focus-fix');
        }, true);
      })();
    }
    
    (function () {
      sheet.insertRule('body::after { }', 0);
      const rule = sheet.cssRules[0];
      if (rule instanceof CSSStyleRule) {
        rule.style.cssText = '-webkit-transform: scale(1.0)';
      }
    })();
  }
}

