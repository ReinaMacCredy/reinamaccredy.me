export function handleErrors(handler: (message: string) => void): void {
  window.onerror = function (event: string | Event, _url?: string, _line?: number, _column?: number, error?: Error | null): boolean {
    try {
      const message = error?.message || (typeof event === 'string' ? event : 'Unknown error');
      handler(message);
    } catch (_) {
    }
    return true;
  };
}

export function unhandleErrors(): void {
  window.onerror = null;
}

