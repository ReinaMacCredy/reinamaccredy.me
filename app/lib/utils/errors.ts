export function handleErrors(handler: (message: string) => void): void {
  window.onerror = function (_message: string, _url: string, _line: number, _column: number, error?: Error | null): boolean {
    try {
      handler(error?.message || 'Unknown error');
    } catch (_) {
    }
    return true;
  };
}

export function unhandleErrors(): void {
  window.onerror = null;
}

