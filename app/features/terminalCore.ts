/**
 * Terminal core - refactored to use dependency injection
 */

import type { TerminalConfig, TerminalOutput } from '../types/terminal';
import { Terminal } from './terminal';
import { createTerminalDependencies } from './terminalDependencies';

interface TerminalAPI {
  execute: (command: string) => Promise<void>;
  addOutput: (item: TerminalOutput) => void;
  clear: () => void;
}

export function initTerminal(config: TerminalConfig = {}): TerminalAPI | undefined {
  // Create a callback that will be set later
  let outputCallback: ((item: TerminalOutput) => void) | null = null;

  // Create dependencies via DI factory
  const dependencies = createTerminalDependencies({
    githubUser: 'reinamaccredy',
    githubDisplayName: 'ReinaMacCredy',
    audioSrc: config.audioSrc || '/assets/media/hope.mp3',
    onOutput: (item: TerminalOutput) => {
      // Forward to terminal's output method once it's set
      if (outputCallback) {
        outputCallback(item);
      }
    }
  });

  // Create terminal with injected dependencies
  const terminal = new Terminal(config, dependencies);
  
  // Set the output callback to use terminal's method
  outputCallback = (item: TerminalOutput) => terminal.addOutput(item);
  
  // Update commandManager to use the terminal's output method directly
  // This breaks the circular dependency by wiring after both are created
  dependencies.commandManager.setOnOutput((item: TerminalOutput) => terminal.addOutput(item));
  
  terminal.init(config.target);
  
  return terminal;
}
