/**
 * Command manager for handling terminal commands
 */

import type { TerminalCommandDefinition, TerminalOutput } from '../types/terminal';
import { GitHubService } from './githubService';
import { AudioManager } from './audioManager';
import { LyricsManager } from './lyricsManager';
import { toBase64Utf8, fromBase64Utf8, escapeHtml } from './terminalUtils';

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
      { command: "help", display: "help", description: "List all available commands", body: () => this.helpCommand() },
      { command: "info", display: "info", description: "Get info about me", body: () => this.infoCommand() },
      { command: "whoami", display: "whoami", description: "Display logged-in user.", body: () => this.whoamiCommand() },
      { command: "projects", display: "projects", description: "Display a list of my major projects.", body: () => this.projectsCommand() },
      { command: "repo", display: "repo", description: "Open repository link.", body: () => this.repoCommand() },
      { command: "social", display: "social", description: "Show social links.", body: () => this.socialCommand() },
      { command: "email", display: "email", description: "Show contact email.", body: () => this.emailCommand() },
      { command: "banner", display: "banner", description: "Print the banner.", body: () => this.bannerCommand() },
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
    switch (cmd) {
      case "play": {
        this.audioManager.start();
        this.onOutput({ type: "output", text: "The music was turned on. To stop playback enter 'stop'" });
        break;
      }
      case "stop":
        this.audioManager.stop();
        this.onOutput({ type: "output", text: "The music was turned off. To continue playing please enter 'play'" });
        break;
      case "fun":
        this.executeFunCommand();
        break;
      case "myip":
        this.executeMyIpCommand();
        break;
      case "clear":
        // Handled by terminal orchestrator
        break;
      case "echo": {
        const text = params.join(' ') || 'ECHO is on.';
        this.onOutput({ type: "output", text: text });
        break;
      }
      case "b64": {
        if (params[0]) {
          const encoded = toBase64Utf8(params.join(' '));
          this.onOutput({ type: "output", text: encoded });
        } else {
          this.onOutput({ type: "output", text: "Error: Empty string" });
        }
        break;
      }
      case "db64": {
        if (params[0]) {
          try {
            const decoded = fromBase64Utf8(params.join(''));
            this.onOutput({ type: "output", text: decoded });
          } catch (error) {
            this.onOutput({ type: "output", text: "Error: Invalid Base64 string" });
          }
        } else {
          this.onOutput({ type: "output", text: "Error: Empty string" });
        }
        break;
      }
      case "random": {
        const num = params[0];
        const result = Math.random();

        if (num) {
          const isCorrect = Number(num) === result;
          this.onOutput({
            type: "output",
            text: `${isCorrect ? 'You predicted the correct number' : 'You predicted the wrong number'}`
          });
          this.onOutput({
            type: "output",
            text: `The correct answer is: ${result}`
          });
          this.onOutput({
            type: "output",
            text: `Take a look at https://github.com/aiko-chan-ai/v8-randomness-predictor`
          });
        } else {
          this.onOutput({ type: "output", text: result.toString() });
        }
        break;
      }
      case "lyrics": {
        if (!this.audioManager.isPlaying()) {
          break;
        }

        if (this.lyricsManager.isDisplaying()) {
          break;
        }

        this.lyricsManager.startSync();
        break;
      }
      case "lyrics-stop": {
        this.lyricsManager.stopSync();
        break;
      }
      case "lyrics-load": {
        if (params[0]) {
          try {
            const lyricsData = JSON.parse(params.join(' ')) as unknown;
            this.lyricsManager.loadCustomLyrics(lyricsData);
          } catch (error) {
            // Ignore parsing errors
          }
        } else {
          const lyricsJson = JSON.stringify(this.lyricsManager.getState().lyrics, null, 2);
          this.onOutput({ type: "output", text: lyricsJson });
        }
        break;
      }
      case "start": {
        this.executeStartCommand();
        break;
      }
      default: {
        const found = this.commands.find(c => c.command === cmd);
        if (found && found.body) {
          const result = await found.body();
          const isHTML = /<[^>]*>/.test(result);
          this.onOutput({ type: "output", text: result, isHTML });
        } else if (cmd !== "") {
          this.onOutput({
            type: "error",
            text: `Command not found: ${cmd}. Type "help" for available commands.`
          });
        }
        break;
      }
    }
  }

  private helpCommand(): string {
    const [major, minor, patch] = '1.0.3'.split('.');
    const title = `<div class="help-header">Available Commands - Web bash v<span class="text-ctp-green">${major}</span>.<span class="text-ctp-blue">${minor}</span>.<span class="text-ctp-red">${patch}</span></div>`;
    const subtitle = `<div class="help-subtitle">Type any command below and press Enter. Use <span class="text-ctp-blue">Tab</span> or <span class="text-ctp-blue">→</span> to autocomplete.</div>`;
    const rows = this.commands.map((cmd) => {
      const icon = this.icons[cmd.command] || '·';
      return `<div class="help-row"><div class="cmd-col"><span class="icon">${icon}</span><span class="text-ctp-green">${cmd.display}</span></div><div class="desc-col">${escapeHtml(cmd.description)}</div></div>`;
    }).join('\n');
    return `${title}\n${subtitle}\n<div class="help-list">${rows}</div>`;
  }

  private async infoCommand(): Promise<string> {
    try {
      const u = await this.githubService.getUser();
      const avatar = escapeHtml(u.avatar_url || '');
      const name = escapeHtml(u.name || this.githubService.getHtmlUser());
      const followers = Number(u.followers || 0);
      const following = Number(u.following || 0);
      return [
        `<div class="my-2 font-jetbrains flex flex-col lg:flex-row items-center gap-4 info-block">`,
        `  <img src="${avatar}" alt="avatar-github" class="rounded-full w-[250px] h-[250px]" />`,
        `  <div class="max-w-[500px]">`,
        `    <div class="flex flex-col lg:flex-row items-center gap-0 md:gap-3 header">`,
        `      <h5 class="font-semibold text-lg underline"><a href="https://github.com/${this.githubService.getHtmlUser()}" target="_blank" rel="noreferrer" class="underline" style="color: inherit; text-decoration: underline;">${name}</a></h5>`,
        `      <span class="text-ctp-blue">@${this.githubService.getHtmlUser().toLowerCase()}</span>`,
        `      <span>(${followers} followers · ${following} following)</span>`,
        `    </div>`,
        `    <p>Hewwo! I'm a student from Vietnam.</p>`,
        `    <p>I enjoy playing <span class="text-ctp-green">Open-world, FPS Games, Adventure, Platformer, Rhythm </span>and <span class="italic">some lewd visual novels (shhh, don't tell anyone!)</span></p>`,
        `    <p>I <span class="text-ctp-red">love</span> programming and have a few small projects (check out my github!)</p>`,
        `  </div>`,
        `</div>`
      ].join('');
    } catch (e) {
      return `GitHub: https://github.com/${this.githubService.getHtmlUser()}`;
    }
  }

  private whoamiCommand(): string {
    return this.githubService.getHtmlUser();
  }

  private repoCommand(): string {
    return `GitHub: https://github.com/${this.githubService.getHtmlUser()}`;
  }

  private socialCommand(): string {
    return [`GitHub  → https://github.com/${this.githubService.getHtmlUser()}`, `Email   → reina.maccredy@outlook.com`].join('\n');
  }

  private emailCommand(): string {
    return `reina.maccredy@outlook.com`;
  }

  private bannerCommand(): string {
    return 'Hi~';
  }

  private async projectsCommand(): Promise<string> {
    try {
      const repos = await this.githubService.getTopRepos(6);
      const lines = repos.map((r) => {
        const safeName = escapeHtml(r.name || '');
        const safeUrl = typeof r.html_url === 'string' && r.html_url.startsWith('https://github.com/')
          ? r.html_url
          : `https://github.com/${this.githubService.getHtmlUser()}`;
        const stars = Number(r.stargazers_count) || 0;
        const forks = Number(r.forks_count) || 0;
        return `• <a class="text-ctp-blue underline" href="${safeUrl}" target="_blank" rel="noreferrer">${safeName}</a> — Stars: ${stars}  Forks: ${forks}`;
      });
      return [
        'Major Projects:',
        ...lines,
        `\nGitHub: https://github.com/${this.githubService.getHtmlUser()}`,
      ].join('\n');
    } catch (_) {
      return `GitHub: https://github.com/${this.githubService.getHtmlUser()}`;
    }
  }

  private executeFunCommand(): void {
    const style = document.createElement('style');
    style.innerHTML = `
      html:after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        opacity: 0.9;
        mix-blend-mode: hue;
        z-index: 999999999999;
        pointer-events: none;
      }
      @keyframes rotate {
        from { transform: rotateZ(0deg); }
        to { transform: rotateZ(360deg); }
      }
      #terminal-container {
        animation: rotate 5s infinite alternate;
      }
    `;
    document.head.appendChild(style);

    setTimeout(() => {
      document.head.removeChild(style);
      this.onOutput({ type: "output", text: "Done!" });
    }, 4900);
  }

  private executeMyIpCommand(): void {
    const loadingStates = [
      "Please wait",
      "Please wait.",
      "Please wait..",
      "Please wait..."
    ];

    let currentState = 0;
    const loadingInterval = setInterval(() => {
      this.onOutput({
        type: "prompt",
        text: loadingStates[currentState],
        isNewLine: false
      });
      currentState = (currentState + 1) % loadingStates.length;
    }, 200);

    fetch("https://api.ipify.org/")
      .then(response => response.text())
      .then(ip => {
        clearInterval(loadingInterval);
        this.onOutput({ type: "prompt", text: ip });
      })
      .catch((error: Error) => {
        clearInterval(loadingInterval);
        this.onOutput({ type: "prompt", text: `Error: ${error.message}` });
      });
  }

  private executeStartCommand(): void {
    const state = this.audioManager.getState();
    if (state.hasCompletedInitialPlay || state.isWaitingForStartCommand) {
      this.audioManager.reset();
      this.audioManager.start();
    } else if (!state.hasStarted) {
      this.audioManager.start();
    } else {
      this.onOutput({ type: "output", text: "Terminal autoplay is already running. Wait for it to complete or type 'stop' first." });
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
}
