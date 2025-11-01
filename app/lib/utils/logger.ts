const isDevelopment = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';

export const logger = {
  error: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.error(...args);
    }
  },
  warn: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  log: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  info: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  debug: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.debug(...args);
    }
  }
};

