import type { ClientInfo, BrowserType, OSType } from '../../types/core';

export const detectClient = (): ClientInfo => {
  const o: ClientInfo = {
    browser: 'other',
    browserVersion: 0,
    os: 'other',
    osVersion: 0,
    mobile: false,
    canUse: null as any, // Will be assigned below
    flags: { lsdUnits: false },
  };

  const ua = navigator.userAgent;

  type BrowserPattern = [BrowserType, RegExp, ((v: string) => string) | null];
  const browserPatterns: BrowserPattern[] = [
    ['firefox', /Firefox\/([0-9\.]+)/, null],
    ['firefox', /FxiOS\/([0-9\.]+)/, null],
    ['edge', /Edge\/([0-9\.]+)/, null],
    ['edge', /EdgiOS\/([0-9\.]+)/, null],
    ['safari', /Version\/([0-9\.]+).+Safari/, null],
    ['safari', /Safari\/([0-9\.]+)/, null],
    ['chrome', /Chrome\/([0-9\.]+)/, null],
    ['chrome', /CriOS\/([0-9\.]+)/, null],
    ['samsung', /SamsungBrowser\/([0-9\.]+)/, null],
    ['opera', /OPiOS\/([0-9\.]+)/, null],
    ['opera', /Opera\/([0-9\.]+)/, null],
    ['ie', /Trident\/.+rv:([0-9]+)/, null],
    ['safari', /iPhone OS ([0-9_]+)/, (v) => v.replace('_', '.').replace('_', '')],
  ];
  
  for (let i = 0; i < browserPatterns.length; i += 1) {
      const match = ua.match(browserPatterns[i][1]);
      if (match) {
        o.browser = browserPatterns[i][0];
        const versionStr = match[1] || '';
      o.browserVersion = parseFloat(browserPatterns[i][2] ? browserPatterns[i][2](versionStr) : versionStr);
      break;
    }
  }

  type OSPattern = [OSType, RegExp, ((v: string) => string) | null];
  const osPatterns: OSPattern[] = [
    ['ios', /([0-9_]+) like Mac OS X/, (v) => v.replace('_', '.').replace('_', '')],
    ['ios', /CPU like Mac OS X/, () => '0'],
    ['ios', /iPad; CPU/, () => '0'],
    ['ios', /iPhone/, () => '0'],
    ['ios', /iPod/, () => '0'],
    ['android', /Android ([0-9\.]+)/, null],
    ['android', /Mobile.*Android/, () => '0'],
    ['mac', /Macintosh.+Mac OS X ([0-9_]+)/, (v) => v.replace('_', '.').replace('_', '')],
    ['windows', /Windows NT ([0-9\.]+)/, null],
    ['windows', /Windows Phone ([0-9\.]+)/, null],
    ['undefined', /Undefined/, null],
  ];
  
  for (let i = 0; i < osPatterns.length; i += 1) {
    const match = ua.match(osPatterns[i][1]);
    if (match) {
      o.os = osPatterns[i][0];
      const versionStr = match[1] || '';
      o.osVersion = parseFloat(osPatterns[i][2] ? osPatterns[i][2](versionStr) : versionStr);
      break;
    }
  }

  if (
    o.os === 'mac' &&
    'ontouchstart' in window &&
    ((screen.width === 1024 && screen.height === 1366) ||
      (screen.width === 834 && screen.height === 1112) ||
      (screen.width === 810 && screen.height === 1080) ||
      (screen.width === 768 && screen.height === 1024))
  )
    o.os = 'ios';

  o.mobile = o.os === 'android' || o.os === 'ios' || /Mobile|Tablet|Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/.test(ua);

  const _canUse = document.createElement('div');
  o.canUse = (property: string, value?: string): boolean => {
    const style = _canUse.style as CSSStyleDeclaration & Record<string, string>;
    if (!(property in style)) return false;
    if (typeof value !== 'undefined') {
      style[property] = value;
      if (style[property] === '') return false;
    }
    return true;
  };

  o.flags.lsdUnits = o.canUse('width', '100dvw');
  return o;
};

