export type Timeline = ReturnType<typeof import('gsap').gsap.timeline>;

export interface TerminalConfig {
  target?: string;
  username?: string;
  audioSrc?: string;
}

export interface AudioState {
  audio: HTMLAudioElement | null;
  isPlaying: boolean;
  hasStarted: boolean;
  hasCompletedInitialPlay: boolean;
  isWaitingForStartCommand: boolean;
  initialAutoplayEnabled: boolean;
}

export interface LyricLine {
  text: string;
  startTime: number;
  endTime: number;
}

export interface AnimationFrame {
  [key: string]: unknown;
}

export interface LyricsState {
  lyrics: LyricLine[];
  currentIndex: number;
  activeIndex: number;
  isDisplaying: boolean;
  syncInterval: NodeJS.Timeout | null;
  displayedLyrics: Set<number>;
  activeLyricElements: Map<number, string>;
  gsapTimeline: Timeline | null;
  gsapExitTimeline: Timeline | null;
  lastTransitionTime: number;
  animationQueue: AnimationFrame[];
  disappearTimeouts: Map<string, NodeJS.Timeout>;
}

export interface TerminalCommand {
  icon: string;
  description: string;
  execute: (args: string[]) => Promise<void> | void;
}

export interface TerminalCommandDefinition {
  command: string;
  display: string;
  description: string;
  body?: () => void | Promise<void>;
}

export type TerminalOutputType = 'prompt' | 'output' | 'error' | 'command';

export interface TerminalOutput {
  type: TerminalOutputType;
  text?: string;
  username?: string;
  isHTML?: boolean;
  isNewLine?: boolean;
}

export interface TerminalInternalState {
  commandHistory: string[];
  historyIndex: number;
  isProcessing: boolean;
  output: TerminalOutput[];
  suggestedCommand: string | null;
  pauseRef: { current: boolean };
  cache: Map<string, unknown>;
}

