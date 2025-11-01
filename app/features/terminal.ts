/**
 * Main Terminal orchestrator class
 * Refactored to use dependency injection pattern
 */

import type { TerminalConfig, TerminalOutput, TerminalInternalState } from '../types/terminal';
import type { TerminalDependencies } from './terminalDependencies';
import { escapeHtml } from './terminalUtils';

export class Terminal {
  private terminal: HTMLElement | null = null;
  private input: HTMLInputElement | null = null;
  private outputContainer: HTMLElement | null = null;
  private suggestEl: HTMLElement | null = null;

  private state: TerminalInternalState;
  private username: string;

  private dependencies: TerminalDependencies;

  private refs: { suggestEl?: HTMLElement; input?: HTMLInputElement } = {};

  constructor(config: TerminalConfig = {}, dependencies: TerminalDependencies) {
    this.username = config.username || 'reina';
    this.dependencies = dependencies;

    this.state = {
      commandHistory: [],
      historyIndex: -1,
      isProcessing: false,
      output: [],
      suggestedCommand: null,
      pauseRef: { current: false },
      cache: new Map()
    };
  }

  init(target: string = '#terminal-container'): void {
    this.terminal = document.querySelector<HTMLElement>(target);
    if (!this.terminal) return;

    this.createTerminalElements();
    this.setupEventListeners();
    this.setupVisibilityHandling();

    this.addTerminalOutput({ type: "output", text: "Type \"help\" to see available commands." });
    this.addTerminalOutput({ type: "output", text: "" });
  }

  private createTerminalElements(): void {
    if (!this.terminal) return;

    this.terminal.innerHTML = `
      <div class="terminal-header bg-ctp-mantle p-5 rounded-t-3xl">
        <div class="flex items-center gap-4">
          <div class="w-4 h-4 rounded-full bg-ctp-red"></div>
          <div class="w-4 h-4 rounded-full bg-ctp-yellow"></div>
          <div class="w-4 h-4 rounded-full bg-ctp-green"></div>
        </div>
      </div>
      <div class="terminal-body bg-ctp-base p-5 rounded-b-3xl min-h-[60vh] lg:min-h-[70vh] max-h-[60vh] lg:max-h-[70vh] overflow-auto prompt">
        <div class="terminal-output text-ctp-subtext0 text-sm"></div>
        <!-- PRE-ALLOCATED LYRICS ZONE - Always present but hidden by default -->
        <div id="lyrics-zone" class="lyrics-zone-fixed">
          <div id="lyrics-container" class="lyrics-container"></div>
        </div>
        <div class="flex items-center gap-2 text-sm" style="display: flex;">
          <div class="text-ctp-subtext0 font-jetbrains">
            <span class="text-ctp-blue">${this.username}</span>@
            <span class="text-ctp-pink">${this.username}</span>:
            <span>~</span>$
          </div>
          <div class="relative w-full flex items-center text-sm">
            <span class="terminal-suggest" aria-hidden="true"></span>
            <input type="text" class="terminal-input bg-transparent border-none outline-none w-full font-jetbrains relative z-20 text-ctp-subtext0" placeholder="confused? type 'help' and press Enter to get started!" autocomplete="off" />
          </div>
        </div>
      </div>
    `;

    this.input = this.terminal.querySelector<HTMLInputElement>('.terminal-input');
    this.outputContainer = this.terminal.querySelector<HTMLElement>('.terminal-output');
    this.suggestEl = this.terminal.querySelector<HTMLElement>('.terminal-suggest');

    this.refs = { suggestEl: this.suggestEl!, input: this.input! };
  }

  private setupEventListeners(): void {
    if (!this.input) return;

    this.input.focus();

    this.input.addEventListener('keydown', (e) => this.handleKeyDown(e));
    this.input.addEventListener('input', (e) => this.handleInputChange(e));

    this.terminal?.addEventListener('click', () => this.input?.focus());
  }

  private setupVisibilityHandling(): void {
    document.addEventListener('visibilitychange', () => {
      const audio = this.dependencies.audioManager.getState().audio;
      if (!audio) return;

      if (document.visibilityState === 'hidden' && !audio.paused) {
        audio.pause();
      } else if (document.visibilityState === 'visible' && this.dependencies.audioManager.isPlaying()) {
        audio.play().catch(() => {});
      }
    });

    const startAudioOnClick = (): void => {
      const state = this.dependencies.audioManager.getState();
      if (!state.hasStarted && state.initialAutoplayEnabled && !state.hasCompletedInitialPlay) {
        this.dependencies.audioManager.start();
        document.removeEventListener('click', startAudioOnClick);
        document.removeEventListener('keydown', startAudioOnClick);
      }
    };

    document.addEventListener('click', startAudioOnClick);
    document.addEventListener('keydown', startAudioOnClick);
  }

  private handleInputChange(e: Event): void {
    if (this.state.pauseRef.current) return;

    const target = e.target as HTMLInputElement;
    if (!target) return;

    const raw = target.value;
    const trimmedLeading = raw.replace(/(^ +)/g, "");
    const firstSpace = trimmedLeading.indexOf(" ");
    const rawFirstWord = firstSpace === -1 ? trimmedLeading : trimmedLeading.slice(0, firstSpace);
    const searchFirstWord = rawFirstWord.toLowerCase();
    const hasSpace = firstSpace !== -1;

    const input = [searchFirstWord, ...(firstSpace === -1 ? [] : trimmedLeading.slice(firstSpace + 1).split(" "))].join(" ");

    const found = this.dependencies.commandManager.findCommandStartingWith(searchFirstWord);
    const suggestedCommand = found || null;

    if (this.suggestEl) {
      const atEnd = this.input && this.input.selectionStart === this.input.value.length && this.input.selectionEnd === this.input.value.length;
      if (!hasSpace && atEnd && searchFirstWord && suggestedCommand && suggestedCommand.command !== searchFirstWord) {
        const remainingSuggestion = suggestedCommand.command.substring(searchFirstWord.length);
        this.suggestEl.textContent = remainingSuggestion;

        if (this.input) {
          const cs = getComputedStyle(this.input);
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) return;
          const fontSize = cs.fontSize || '14px';
          const fontFamily = cs.fontFamily || '"JetBrains Mono", monospace';
          context.font = `${fontSize} ${fontFamily}`;

          const typedWidth = context.measureText(rawFirstWord).width;
          const paddingLeft = parseFloat(cs.paddingLeft || '0') || 0;

          this.suggestEl.style.left = `${paddingLeft + typedWidth}px`;
          this.suggestEl.style.opacity = '0.4';
        }
      } else {
        this.suggestEl.textContent = '';
        this.suggestEl.style.left = '0px';
      }
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (this.state.pauseRef.current) return;

    const target = event.target as HTMLInputElement;
    if (!target) return;

    if (event.key === 'Enter') {
      const command = target.value.trim();
      if (command) {
        this.executeCommand(command);
        target.value = '';
        this.addToHistory(command);
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.navigateHistory('up');
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.navigateHistory('down');
    } else if (event.key === 'ArrowRight') {
      const inputEl = target;
      const atEnd = inputEl.selectionStart === inputEl.value.length && inputEl.selectionEnd === inputEl.value.length;
      const suggestedCommand = this.dependencies.commandManager.findCommandStartingWith(target.value.toLowerCase());

      if (atEnd && suggestedCommand) {
        event.preventDefault();
        inputEl.value = suggestedCommand.command;
        if (this.suggestEl) this.suggestEl.textContent = '';
      }
    } else if (event.key === 'Tab') {
      event.preventDefault();
      const suggestedCommand = this.dependencies.commandManager.findCommandStartingWith(target.value.toLowerCase());
      if (suggestedCommand) {
        target.value = suggestedCommand.command;
        if (this.suggestEl) this.suggestEl.textContent = '';
      }
    }
  }

  async executeCommand(command: string): Promise<void> {
    const args = command.split(/ +/g);
    const rawCmd = args.shift() || '';
    const aliasMap: Record<string, string> = { about: 'info' };
    const lower = rawCmd.toLowerCase();
    const cmd = aliasMap[lower] || lower;

    this.addTerminalOutput({
    type: "prompt",
    text: this.createPromptLine(command, "", true),
    isHTML: true
    });

    if (cmd === 'clear') {
    this.clearOutput();
    } else {
    await this.dependencies.commandManager.executeCommand(command);
    }

    this.addTerminalOutput({ type: "output", text: "" });
  }

  private createPromptLine(input: string, output: string, isCommand: boolean): string {
    return `
      <div class="text-ctp-subtext0 font-jetbrains">
        <div class="flex items-center gap-2 relative">
          <div>
            <span class="text-ctp-blue">${this.username}</span>@
            <span class="text-ctp-pink">${this.username}</span>:
            <span>~</span>$
          </div>
          <span class="${isCommand ? 'text-ctp-green' : 'text-ctp-red'}">${input}</span>
        </div>
        ${isCommand ? `<span class="text-ctp-text">${output}</span>` : `<span>Command not found: ${input}</span>`}
      </div>
    `;
  }

  private addTerminalOutput(item: TerminalOutput): void {
    this.state.output.push(item);
    this.renderOutput();
  }

  private clearOutput(): void {
    this.state.output = [];
    this.renderOutput();
  }

  private renderOutput(): void {
    if (!this.outputContainer) return;

    this.outputContainer.innerHTML = this.state.output
      .filter(item => {
        return !(item.isHTML && item.text?.includes('lyrics-container-fixed'));
      })
      .map(item => {
        if (item.type === "prompt") {
          return `<div class="${item.type}">${item.isHTML ? item.text : escapeHtml(item.text || '')}</div>`;
        } else if (item.type === "output") {
          return `<div class="${item.type}">${item.isHTML ? item.text : escapeHtml(item.text || '')}</div>`;
        } else if (item.type === "error") {
          return `<div class="${item.type}">${item.text || ''}</div>`;
        }
        return '';
      }).join('');

    this.outputContainer.scrollTop = this.outputContainer.scrollHeight;
  }

  private addToHistory(command: string): void {
    this.state.commandHistory.push(command);
    this.state.historyIndex = this.state.commandHistory.length;
  }

  private navigateHistory(direction: 'up' | 'down'): void {
    if (!this.input) return;

    if (direction === 'up' && this.state.historyIndex > 0) {
      this.state.historyIndex--;
      this.input.value = this.state.commandHistory[this.state.historyIndex] || '';
    } else if (direction === 'down' && this.state.historyIndex < this.state.commandHistory.length - 1) {
      this.state.historyIndex++;
      this.input.value = this.state.commandHistory[this.state.historyIndex] || '';
    } else if (direction === 'down' && this.state.historyIndex === this.state.commandHistory.length - 1) {
      this.state.historyIndex = this.state.commandHistory.length;
      this.input.value = '';
    }
  }

  // Public API methods
  execute = (command: string) => this.executeCommand(command);
  addOutput = (item: TerminalOutput) => this.addTerminalOutput(item);
  clear = () => this.clearOutput();
}
