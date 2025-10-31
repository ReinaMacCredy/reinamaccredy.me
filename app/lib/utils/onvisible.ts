import type { ScrollEvents } from '../../types/core';

interface EffectDefinition {
  type?: 'transition' | 'animate' | 'manual';
  target?: string;
  transition?: (speed: number, delay: number) => string;
  play?: (intensity: number, isChildren?: boolean) => void;
  rewind?: (intensity: number, isChildren?: boolean) => void;
  keyframes?: (intensity: number) => Keyframe[];
  options?: (speed: number, delay: number) => KeyframeAnimationOptions;
}

interface OnVisibleSettings {
  style?: string;
  speed?: number;
  intensity?: number;
  delay?: number;
  replay?: boolean;
  alt?: boolean;
  stagger?: number | false;
  staggerOrder?: 'default' | 'reverse' | 'random';
  staggerSelector?: string | null;
  threshold?: number;
  initialState?: boolean | null;
  target?: string;
}

export interface OnVisible {
  registerEffect: (name: string, def: EffectDefinition) => void;
  add: (selector: string, settings?: OnVisibleSettings) => void;
}

export function createOnVisible({ scrollEvents }: { scrollEvents: ScrollEvents }): OnVisible {
  const effects = new Map<string, EffectDefinition>();
  const wordRegex = new RegExp("([^\\s]+)", "g");

  function escapeHtml(s: string | null | undefined): string {
    if (s === '' || s === null || s === undefined) return '';
    const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return String(s).replace(/[&<>"']/g, (x) => map[x]);
  }

  function expandTextNodes(root: Node): void {
    for (let i = 0; i < root.childNodes.length; i += 1) {
      const node = root.childNodes[i];
      if (node.nodeType !== Node.TEXT_NODE) continue;
      let value = node.nodeValue || '';
      value = value.replace(wordRegex, (_x, a) => `<text-node>${escapeHtml(a)}</text-node>`);
      const wrapper = document.createElement('text-node');
      wrapper.innerHTML = value;
      if (node.parentNode) {
        node.replaceWith(wrapper);
        while (wrapper.childNodes.length > 0) {
          wrapper.parentNode.insertBefore(wrapper.childNodes[0], wrapper);
        }
        wrapper.parentNode.removeChild(wrapper);
      }
    }
  }

  function registerEffect(name: string, def: EffectDefinition): void {
    effects.set(name, def);
  }

  function resolveTarget(element: Element, effectDef: EffectDefinition, settings?: OnVisibleSettings): Element {
    if (settings?.target) return element.querySelector(settings.target) || element;
    if (effectDef?.target) return element.querySelector(effectDef.target) || element;
    return element;
  }

  function add(selector: string, settings: OnVisibleSettings = {}): void {
    const styleName = settings.style;
    if (!styleName) return;
    const def = effects.get(styleName);
    if (!def) return;

    const speed = Number.isFinite(settings.speed) ? settings.speed! : 0.0;
    const intensity = Number.isFinite(settings.intensity) ? settings.intensity! : 5;
    const delay = Number.isFinite(settings.delay) ? settings.delay! : 0.0;
    const replay = !!settings.replay;
    const alt = !!settings.alt;
    const staggerValue = settings.stagger;
    const stagger = typeof staggerValue === 'number' && Number.isFinite(staggerValue) && staggerValue >= 0 ? staggerValue : false;
    const staggerOrder = settings.staggerOrder || 'default';
    const staggerSelector = settings.staggerSelector || null;
    const threshold = Number.isFinite(settings.threshold) ? settings.threshold! : 3;
    const state = settings.initialState ?? null;

    let scrollEventThreshold = 0.2;
    switch (threshold) {
      case 1:
        scrollEventThreshold = 0.0;
        break;
      case 2:
        scrollEventThreshold = 0.125;
        break;
      default:
      case 3:
        scrollEventThreshold = 0.25;
        break;
      case 4:
        scrollEventThreshold = 0.375;
        break;
      case 5:
        scrollEventThreshold = 0.475;
        break;
    }

    const nodes = document.querySelectorAll(selector);
    nodes.forEach((node) => {
      if (stagger !== false && staggerSelector === ':scope > *') expandTextNodes(node);

      const children = stagger !== false && staggerSelector ? node.querySelectorAll(staggerSelector) : null;
      const targetElement = resolveTarget(node, def, settings);

      if (children) {
      children.forEach((child) => {
        if (typeof def.rewind === 'function') def.rewind.call(child as HTMLElement, intensity, true);
      });
    } else {
      if (typeof def.rewind === 'function') def.rewind.call(targetElement as HTMLElement, intensity);
    }

    let enter: (this: HTMLElement, children?: NodeListOf<Element>, staggerDelay?: number) => void;
      let leave: (this: HTMLElement, children?: NodeListOf<Element>) => void;

      switch (def.type) {
        case 'transition': {
          const adjustedIntensity = (intensity / 10) * 1.75 + 0.25;

          enter = function (this: HTMLElement, _children?: NodeListOf<Element>, staggerDelay = 0): void {
            const _this = this;
            const transitionOrig = _this.style.transition;
            _this.style.setProperty('backface-visibility', 'hidden');
            if (def.transition) {
              _this.style.transition = def.transition(speed / 1000, (delay + staggerDelay) / 1000);
            }
            if (def.play) def.play.call(_this, adjustedIntensity, !!_children);
            setTimeout(() => {
              _this.style.removeProperty('backface-visibility');
              _this.style.transition = transitionOrig;
            }, (speed + delay + staggerDelay) * 2);
          };

          leave = function (this: HTMLElement, _children?: NodeListOf<Element>): void {
            const _this = this;
            const transitionOrig = _this.style.transition;
            _this.style.setProperty('backface-visibility', 'hidden');
            if (def.transition) {
              _this.style.transition = def.transition(speed / 1000, 0);
            }
            if (def.rewind) def.rewind.call(_this, adjustedIntensity, !!_children);
            setTimeout(() => {
              _this.style.removeProperty('backface-visibility');
              _this.style.transition = transitionOrig;
            }, speed * 2);
          };
          break;
        }

        case 'animate': {
          const adjustedIntensity = (intensity / 10) * 1.75 + 0.25;

          enter = function (this: HTMLElement, _children?: NodeListOf<Element>, staggerDelay = 0): void {
            const _this = this;
            setTimeout(() => {
              if (def.play) def.play.call(_this, adjustedIntensity);
              if (def.keyframes && def.options) {
                _this.animate(def.keyframes(intensity), def.options(speed, delay));
              }
            }, delay + staggerDelay);
          };

          leave = function (this: HTMLElement, _children?: NodeListOf<Element>): void {
            const _this = this;
            if (def.keyframes && def.options) {
              const a = _this.animate(def.keyframes(intensity), def.options(speed, delay));
              a.reverse();
              a.addEventListener('finish', () => {
                if (def.rewind) def.rewind.call(_this);
              });
            }
          };
          break;
        }

        case 'manual': {
          enter = function (this: HTMLElement, _children?: NodeListOf<Element>, staggerDelay = 0): void {
            const _this = this;
            if (def.play) def.play.call(_this, speed / 1000, (delay + staggerDelay) / 1000, intensity);
          };

          leave = function (this: HTMLElement, _children?: NodeListOf<Element>): void {
            const _this = this;
            if (def.rewind) def.rewind.call(_this, intensity, !!_children);
          };
          break;
        }

        default:
          enter = function (): void {};
          leave = function (): void {};
      }

      let triggerElement: Element = node;
      const parentNode = node.parentNode as HTMLElement | null;
      if (parentNode) {
        if (parentNode.dataset.onvisibleTrigger) {
          triggerElement = parentNode;
        } else {
          const grandParent = parentNode.parentNode as HTMLElement | null;
          if (grandParent && grandParent.dataset.onvisibleTrigger) {
            triggerElement = grandParent;
          }
      }
    }

    scrollEvents.add({
        element: node as HTMLElement,
        triggerElement: triggerElement as HTMLElement,
        initialState: state,
        threshold: scrollEventThreshold,
        enter: children
          ? function (this: HTMLElement): void {
              let staggerDelay = 0;
              const childHandler = function (e: Element): void {
                enter.call(e as HTMLElement, children, staggerDelay);
                if (stagger !== false) staggerDelay += stagger;
              };

              if (staggerOrder === 'default') {
                children.forEach(childHandler);
              } else {
                let a = Array.from(children);
                switch (staggerOrder) {
                  case 'reverse':
                    a.reverse();
                    break;
                  case 'random':
                    a.sort(() => Math.random() - 0.5);
                    break;
                }
                a.forEach(childHandler);
              }
            }
          : enter,
        leave: replay
          ? children
            ? function (this: HTMLElement): void {
                children.forEach((e) => {
                  leave.call(e as HTMLElement, children);
                });
              }
            : leave
          : null,
      });
    });
  }

  return { registerEffect, add };
}

