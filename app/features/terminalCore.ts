import type { TerminalConfig, TerminalOutput } from '../types/terminal';
import { Terminal } from './terminal';
import { createTerminalDependencies } from './terminalDependencies';

interface TerminalAPI {
  execute: (command: string) => Promise<void>;
  addOutput: (item: TerminalOutput) => void;
  clear: () => void;
}

export function initTerminal(config: TerminalConfig = {}): TerminalAPI | undefined {
  let outputCallback: ((item: TerminalOutput) => void) | null = null;

  const dependencies = createTerminalDependencies({
    githubUser: 'reinamaccredy',
    githubDisplayName: 'ReinaMacCredy',
    audioSrc: config.audioSrc || '/assets/media/hope.mp3',
    onOutput: (item: TerminalOutput) => {
      if (outputCallback) {
        outputCallback(item);
      }
    }
  });

  const terminal = new Terminal(config, dependencies);
  
  outputCallback = (item: TerminalOutput) => terminal.addOutput(item);
  
  dependencies.commandManager.setOnOutput((item: TerminalOutput) => terminal.addOutput(item));
  
  terminal.init(config.target);
  
  return terminal;
}
