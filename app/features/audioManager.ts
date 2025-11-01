/**
 * Audio manager for handling terminal soundtrack playback
 */

import type { AudioState, TerminalOutput } from '../types/terminal';
import { logger } from '../lib/utils/logger';

export class AudioManager {
  private state: AudioState;
  private audioSrc: string;
  private onOutput?: (item: TerminalOutput) => void;
  private onPlayStart?: () => void;

  constructor(audioSrc: string, onOutput?: (item: TerminalOutput) => void, onPlayStart?: () => void) {
    this.audioSrc = audioSrc;
    this.onOutput = onOutput;
    this.onPlayStart = onPlayStart;
    this.state = {
      audio: null,
      isPlaying: false,
      hasStarted: false,
      hasCompletedInitialPlay: false,
      isWaitingForStartCommand: false,
      initialAutoplayEnabled: true
    };
  }

  getState(): AudioState {
    return { ...this.state };
  }

  ensureAudio(): HTMLAudioElement {
    if (!this.state.audio) {
      const a = new Audio(this.audioSrc);
      a.loop = false;
      a.volume = 0.12;
      this.state.audio = a;

      a.addEventListener('error', (e) => {
        logger.warn('Audio failed to load:', e);
        this.onOutput?.({
          type: "error",
          text: "Audio failed to load. Check the audio file path."
        });
      });

      a.addEventListener('ended', () => {
        this.state.isPlaying = false;
        this.state.hasCompletedInitialPlay = true;
        this.state.isWaitingForStartCommand = true;
      });

      a.addEventListener('play', () => {
        this.onPlayStart?.();
      });
    }
    return this.state.audio;
  }

  start(): void {
    const a = this.ensureAudio();
    this.state.isPlaying = true;

    a.play().catch((error: Error) => {
      this.onOutput?.({
        type: "error",
        text: `Audio error: ${error.message}`
      });
      this.state.isPlaying = false;
    });
  }

  stop(): void {
    if (!this.state.audio) return;
    this.state.isPlaying = false;

    try {
      this.state.audio.pause();
      this.state.audio.currentTime = 0;
    } catch (_) {}
  }

  reset(): void {
    this.state.hasStarted = false;
    this.state.hasCompletedInitialPlay = false;
    this.state.isWaitingForStartCommand = false;
    this.state.isPlaying = false;

    if (this.state.audio) {
      this.state.audio.currentTime = 0;
      this.state.audio.pause();
    }
  }

  setInitialAutoplay(enabled: boolean): void {
    this.state.initialAutoplayEnabled = enabled;
  }

  getCurrentTime(): number {
    return this.state.audio?.currentTime || 0;
  }

  isPlaying(): boolean {
    return this.state.isPlaying;
  }
}
