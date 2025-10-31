export type EventListenerOptions = boolean | AddEventListenerOptions;

export type QuerySelector = <T extends Element = Element>(selector: string) => T | null;

export type QuerySelectorAll = <T extends Element = Element>(selector: string) => NodeListOf<T>;

