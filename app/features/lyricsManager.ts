/**
 * Lyrics manager for handling synchronized lyrics display
 */

import type { LyricLine, LyricsState } from '../types/terminal';

type GsapTimeline = ReturnType<typeof import('gsap').gsap.timeline>;
import { createEntranceAnimation, createExitAnimation, killAllAnimations } from './lyricsAnimations';
import { escapeHtml } from './terminalUtils';
import { logger } from '../lib/utils/logger';

export class LyricsManager {
  private state: LyricsState;
  private audioManager: { getCurrentTime: () => number; isPlaying: () => boolean };

  constructor(audioManager: { getCurrentTime: () => number; isPlaying: () => boolean }) {
    this.audioManager = audioManager;
    this.state = {
      lyrics: [],
      currentIndex: -1,
      activeIndex: -1,
      isDisplaying: false,
      syncInterval: null,
      displayedLyrics: new Set<number>(),
      activeLyricElements: new Map<number, string>(),
      gsapTimeline: null,
      gsapExitTimeline: null,
      lastTransitionTime: 0,
      animationQueue: [],
      disappearTimeouts: new Map()
    };
  }

  getState(): LyricsState {
    return { ...this.state };
  }

  async loadLyrics(): Promise<void> {
    if (this.state.lyrics.length > 0) {
      return;
    }

    try {
      const response = await fetch('/data/lyrics.json');
      if (!response.ok) {
        logger.error(`Failed to load lyrics: ${response.status} ${response.statusText}`);
        return;
      }

      const lyricsData = await response.json() as unknown;

      if (Array.isArray(lyricsData)) {
        const isValid = lyricsData.every((item: unknown) => {
          return (
            typeof item === 'object' &&
            item !== null &&
            'text' in item &&
            'startTime' in item &&
            'endTime' in item &&
            typeof (item as { text: unknown }).text === 'string' &&
            typeof (item as { startTime: unknown }).startTime === 'number' &&
            typeof (item as { endTime: unknown }).endTime === 'number'
          );
        });

        if (isValid) {
          this.state.lyrics = lyricsData as LyricLine[];
        } else {
          logger.error('Invalid lyrics format: items must have text, startTime, and endTime');
        }
      } else {
        logger.error('Invalid lyrics format: must be an array');
      }
    } catch (error) {
      logger.error('Error loading lyrics from JSON:', error);
    }
  }

  loadCustomLyrics(lyricsData: unknown): void {
    if (Array.isArray(lyricsData)) {
      this.state.lyrics = lyricsData as LyricLine[];
    } else {
      logger.error('Invalid lyrics format: must be an array');
    }
  }

  startSync(): void {
    this.state.isDisplaying = true;
    this.state.currentIndex = -1;
    this.state.displayedLyrics.clear();

    const lyricsZone = document.getElementById('lyrics-zone');
    if (lyricsZone) {
      lyricsZone.classList.add('active');
    }

    this.state.syncInterval = setInterval(() => this.updateDisplay(), 100) as unknown as NodeJS.Timeout;
  }

  async stopSync(): Promise<void> {
    this.state.isDisplaying = false;
    this.state.currentIndex = -1;
    this.state.activeIndex = -1;
    this.state.displayedLyrics.clear();

    killAllAnimations(this.state.gsapTimeline, this.state.gsapExitTimeline);
    this.state.gsapTimeline = null;
    this.state.gsapExitTimeline = null;

    const lyricsContainer = document.getElementById('lyrics-container');
    if (lyricsContainer) {
      const currentLyric = lyricsContainer.querySelector<HTMLElement>('.lyric-line');
      if (currentLyric) {
        const exitTimeline = await createExitAnimation(currentLyric);
        this.state.gsapExitTimeline = exitTimeline as import('../types/terminal').Timeline;
        exitTimeline.eventCallback('onComplete', () => {
          lyricsContainer.innerHTML = '';
          this.state.gsapExitTimeline = null;
        });
      } else {
        lyricsContainer.innerHTML = '';
      }
    }

    const lyricsZone = document.getElementById('lyrics-zone');
    if (lyricsZone) {
      lyricsZone.classList.remove('active');
    }

    this.state.activeLyricElements.clear();
    this.state.animationQueue = [];

    this.state.disappearTimeouts.forEach((timeout) => {
      clearTimeout(timeout);
    });
    this.state.disappearTimeouts.clear();

    if (this.state.syncInterval) {
      clearInterval(this.state.syncInterval);
      this.state.syncInterval = null;
    }
  }

  private updateDisplay(): void {
    if (!this.state.isDisplaying || !this.audioManager.isPlaying()) return;

    const currentTime = this.audioManager.getCurrentTime();

    for (let i = 0; i < this.state.lyrics.length; i++) {
      const lyric = this.state.lyrics[i];

      if (currentTime >= lyric.startTime &&
          currentTime <= lyric.endTime &&
          !this.state.displayedLyrics.has(i)) {

        this.state.displayedLyrics.add(i);
        this.state.currentIndex = i;
        void this.displayCurrentLyric(lyric, currentTime);
        break;
      }
    }
  }

  private async displayCurrentLyric(lyric: LyricLine, currentTime: number): Promise<void> {
    const lyricId = `lyric-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const lyricText = escapeHtml(lyric.text);

    const lyricsContainer = document.getElementById('lyrics-container');
    if (!lyricsContainer) return;

    killAllAnimations(this.state.gsapTimeline, this.state.gsapExitTimeline);
    this.state.gsapTimeline = null;
    this.state.gsapExitTimeline = null;

    this.state.disappearTimeouts.forEach((timeout) => {
      clearTimeout(timeout);
    });
    this.state.disappearTimeouts.clear();

    const currentLyric = lyricsContainer.querySelector<HTMLElement>('.lyric-line');
    if (currentLyric) {
      const exitTimeline = await createExitAnimation(currentLyric);
      this.state.gsapExitTimeline = exitTimeline as import('../types/terminal').Timeline;
      exitTimeline.eventCallback('onComplete', () => {
        if (currentLyric.parentNode) {
          currentLyric.remove();
        }
        this.state.gsapExitTimeline = null;
      });

      setTimeout(() => {
        this.createNewLyric(lyricId, lyricText, lyric, currentTime);
      }, 50);
    } else {
      this.createNewLyric(lyricId, lyricText, lyric, currentTime);
    }
  }

  private createNewLyric(lyricId: string, lyricText: string, lyric: LyricLine, currentTime: number): void {
    const lyricsContainer = document.getElementById('lyrics-container');
    if (!lyricsContainer) return;

    lyricsContainer.innerHTML = `<div id="${lyricId}" class="lyric-line" data-lyric-text="${lyricText}">${lyricText}</div>`;

    const newElement = document.getElementById(lyricId);
    if (!newElement) return;

    this.state.activeLyricElements.clear();
    this.state.activeLyricElements.set(lyric.startTime, lyricId);
    this.state.activeIndex = this.state.currentIndex;

    requestAnimationFrame(async () => {
      const entranceTimeline = await createEntranceAnimation(newElement, lyric.text);
      this.state.gsapTimeline = entranceTimeline as import('../types/terminal').Timeline;

      entranceTimeline.eventCallback('onComplete', () => {
        const updatedCurrentTime = this.audioManager.getCurrentTime();

        const disappearDuration = 0.4;
        const disappearTime = lyric.endTime - 1.15;

        const timeUntilDisappear = (disappearTime - updatedCurrentTime) * 1000;

        if (timeUntilDisappear > disappearDuration * 1000) {
          const timeoutId = setTimeout(() => {
            void this.scheduleDisappear(lyricId);
            this.state.disappearTimeouts.delete(lyricId);
          }, timeUntilDisappear);

          this.state.disappearTimeouts.set(lyricId, timeoutId);
        } else if (timeUntilDisappear > 0) {
          void this.scheduleDisappear(lyricId);
        }
      });
    });
  }

  private async scheduleDisappear(lyricId: string): Promise<void> {
    const element = document.getElementById(lyricId);
    if (!element) return;

    const disappearTimeline = await createExitAnimation(element, {
      stagger: 0.02,
      duration: 0.4,
      blur: 8,
      direction: 'forward'
    });

    this.state.gsapExitTimeline = disappearTimeline as import('../types/terminal').Timeline;
    disappearTimeline.eventCallback('onComplete', () => {
      if (element.parentNode) {
        element.remove();
      }
      this.state.gsapExitTimeline = null;
    });
  }

  isDisplaying(): boolean {
    return this.state.isDisplaying;
  }
}
