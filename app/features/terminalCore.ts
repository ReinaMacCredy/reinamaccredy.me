/**
 * Terminal core - refactored to use modular architecture
 */

import type { TerminalConfig, TerminalOutput } from '../types/terminal';
import { Terminal } from './terminal';

interface TerminalAPI {
  execute: (command: string) => Promise<void>;
  addOutput: (item: TerminalOutput) => void;
  clear: () => void;
}

export function initTerminal(config: TerminalConfig = {}): TerminalAPI | undefined {
  const terminal = new Terminal(config);
  terminal.init(config.target);
  return terminal;
}
