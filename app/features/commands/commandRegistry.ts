/**
 * Command registry pattern for terminal commands
 */

import type { TerminalOutput } from '../../types/terminal';

export interface CommandHandler {
  execute: (params: string[], context: CommandContext) => Promise<void> | void;
}

export interface CommandContext {
  onOutput: (item: TerminalOutput) => void;
  audioManager?: { start: () => void; stop: () => void; isPlaying: () => boolean };
  lyricsManager?: { startSync: () => void; stopSync: () => void; isDisplaying: () => boolean; getState: () => { lyrics: unknown[] }; loadCustomLyrics: (data: unknown) => void };
  githubService?: { getUser: () => Promise<{ avatar_url?: string; name?: string; followers?: number; following?: number }>; getTopRepos: (limit: number) => Promise<unknown[]>; getHtmlUser: () => string };
  executeFunCommand?: () => void;
  executeMyIpCommand?: () => void;
  executeStartCommand?: () => void;
  helpCommand?: () => string;
  infoCommand?: () => Promise<string>;
  whoamiCommand?: () => string;
  repoCommand?: () => string;
  socialCommand?: () => string;
  emailCommand?: () => string;
  bannerCommand?: () => string;
  projectsCommand?: () => Promise<string>;
}

export class CommandRegistry {
  private handlers = new Map<string, CommandHandler>();

  register(command: string, handler: CommandHandler): void {
    this.handlers.set(command, handler);
  }

  get(command: string): CommandHandler | undefined {
    return this.handlers.get(command);
  }

  has(command: string): boolean {
    return this.handlers.has(command);
  }
}

