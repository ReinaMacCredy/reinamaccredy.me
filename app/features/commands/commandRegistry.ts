/**
 * Command registry pattern for terminal commands
 */

import type { TerminalCommandDefinition, TerminalOutput } from '../../types/terminal';
import type { GitHubService } from '../githubService';
import type { AudioManager } from '../audioManager';
import type { LyricsManager } from '../lyricsManager';

export interface CommandContext {
  githubService: GitHubService;
  audioManager: AudioManager;
  lyricsManager: LyricsManager;
  onOutput: (item: TerminalOutput) => void;
  commands: TerminalCommandDefinition[];
  icons: { [key: string]: string };
}

export type CommandHandler = (params: string[], context: CommandContext) => Promise<void> | void;

export interface CommandRegistry {
  [key: string]: CommandHandler;
}

