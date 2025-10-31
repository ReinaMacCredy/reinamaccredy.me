import { initTerminal } from './terminalCore';
import { detectClient } from '../lib/utils/client';
import type { ScrollEvents } from '../types/core';

interface TerminalContainerResult {
  container: Element | null;
  initialized: boolean;
}

export function registerTerminalContainer({ scrollEvents }: { scrollEvents: ScrollEvents }): TerminalContainerResult | undefined {
  const container = document.querySelector('#container05');
  if (!container) {
    return;
  }

  const client = detectClient();
  const isMobile = client.mobile;

  const initializeTerminal = (): void => {
    try {
      initTerminal({ 
        target: '#terminal-container',
        username: 'reina',
        audioSrc: '/assets/media/hope.mp3'
      });
    } catch (error) {
      if (isMobile && !(initializeTerminal as unknown as { retried?: boolean }).retried) {
        (initializeTerminal as unknown as { retried: boolean }).retried = true;
        setTimeout(initializeTerminal, 1000);
      }
    }
  };

  const timeout = isMobile ? 500 : 100;
  setTimeout(initializeTerminal, timeout);

  return {
    container,
    initialized: true
  };
}

export default registerTerminalContainer;

