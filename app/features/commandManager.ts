import type { TerminalCommandDefinition, TerminalOutput } from '../types/terminal';
import { GitHubService } from './githubService';
import { AudioManager } from './audioManager';
import { LyricsManager } from './lyricsManager';
import { commandRegistry } from './commands';
import type { CommandContext } from './commands/commandRegistry';

interface TerminalIcons {
  [key: string]: string;
}

export class CommandManager {
  private commands: TerminalCommandDefinition[];
  private icons: TerminalIcons;
  private githubService: GitHubService;
  private audioManager: AudioManager;
  private lyricsManager: LyricsManager;
  private onOutput: (item: TerminalOutput) => void;

  constructor(
    githubService: GitHubService,
    audioManager: AudioManager,
    lyricsManager: LyricsManager,
    onOutput: (item: TerminalOutput) => void
  ) {
    this.githubService = githubService;
    this.audioManager = audioManager;
    this.lyricsManager = lyricsManager;
    this.onOutput = onOutput;

    this.icons = {
      b64: '<>',
      db64: '<>',
      clear: '◈',
      echo: '{}',
      fun: '*',
      help: '?',
      info: 'i',
      whoami: '@',
      banner: '▦',
      repo: '#',
      email: '@',
      social: '+',
      myip: '.',
      play: '▶',
      stop: '■',
      projects: '#',
      random: '?',
      lyrics: '~',
      'lyrics-stop': '⏹'
    };

    this.commands = this.createCommands();
  }

  private createCommands(): TerminalCommandDefinition[] {
    return [
      { command: "help", display: "help", description: "List all available commands" },
      { command: "info", display: "info", description: "Get info about me" },
      { command: "whoami", display: "whoami", description: "Display logged-in user." },
      { command: "projects", display: "projects", description: "Display a list of my major projects." },
      { command: "repo", display: "repo", description: "Open repository link." },
      { command: "social", display: "social", description: "Show social links." },
      { command: "email", display: "email", description: "Show contact email." },
      { command: "banner", display: "banner", description: "Print the banner." },
      { command: "echo", display: "echo [arg ...]", description: "Write arguments to the standard output." },
      { command: "random", display: "random <num>", description: "Return a pseudo-random number between 0 and 1, or you can try to predict the result!" },
      { command: "clear", display: "clear", description: "Clear the terminal screen." },
      { command: "fun", display: "fun", description: "Try it and see" },
      { command: "play", display: "play", description: "Play soundtrack (mp3)" },
      { command: "stop", display: "stop", description: "Stop soundtrack" },
      { command: "myip", display: "myip", description: "Return your IPv4" },
      { command: "b64", display: "b64 [string]", description: "Encode to Base64 format" },
      { command: "db64", display: "db64 [base64]", description: "Decode from Base64 format" },
      { command: "lyrics", display: "lyrics", description: "Show synced lyrics with audio" },
      { command: "lyrics-stop", display: "lyrics-stop", description: "Stop lyrics display" },
      { command: "lyrics-load", display: "lyrics-load [json]", description: "Load custom lyrics" },
      { command: "start", display: "start", description: "Start/restart terminal autoplay demo" },
    ].sort((a, b) => a.command.localeCompare(b.command));
  }

  async executeCommand(rawCommand: string): Promise<void> {
    const args = rawCommand.split(/ +/g);
    const rawCmd = args.shift() || '';
    const aliasMap: Record<string, string> = { about: 'info' };
    const lower = rawCmd.toLowerCase();
    const cmd = aliasMap[lower] || lower;
    const params = args;

    await this.executeCommandByName(cmd, params);
  }

  private async executeCommandByName(cmd: string, params: string[]): Promise<void> {
    if (cmd === 'clear') {
      return;
    }

    const handler = commandRegistry[cmd];

    if (handler) {
      const context: CommandContext = {
        githubService: this.githubService,
        audioManager: this.audioManager,
        lyricsManager: this.lyricsManager,
        onOutput: this.onOutput,
        commands: this.commands,
        icons: this.icons,
      };

      try {
        await handler(params, context);
      } catch (error) {
        this.onOutput({
          type: "error",
          text: `Error executing command "${cmd}": ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    } else {
      const found = this.commands.find(c => c.command === cmd);
      if (found && found.body) {
        try {
          const result = await found.body();
          const isHTML = /<[^>]*>/.test(result);
          this.onOutput({ type: "output", text: result, isHTML });
        } catch (error) {
          this.onOutput({
            type: "error",
            text: `Error executing command "${cmd}": ${error instanceof Error ? error.message : 'Unknown error'}`
          });
        }
      } else if (cmd !== "") {
        this.onOutput({
          type: "error",
          text: `Command not found: ${cmd}. Type "help" for available commands.`
        });
      }
    }
  }

  getCommands(): TerminalCommandDefinition[] {
    return [...this.commands];
  }

  findCommand(commandName: string): TerminalCommandDefinition | undefined {
    return this.commands.find(cmd => cmd.command === commandName);
  }

  findCommandStartingWith(prefix: string): TerminalCommandDefinition | undefined {
    return this.commands.find(cmd => cmd.command.startsWith(prefix));
  }

  setOnOutput(callback: (item: TerminalOutput) => void): void {
    this.onOutput = callback;
  }
}
