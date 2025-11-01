/**
 * Audio-related command handlers
 */

import type { CommandHandler } from './commandRegistry';
import { logger } from '../../lib/utils/logger';

export const playCommand: CommandHandler = (_params, { audioManager, onOutput }) => {
  audioManager.start();
  onOutput({ type: 'output', text: 'The music was turned on. To stop playback enter \'stop\'' });
};

export const stopCommand: CommandHandler = (_params, { audioManager, onOutput }) => {
  audioManager.stop();
  onOutput({ type: 'output', text: 'The music was turned off. To continue playing please enter \'play\'' });
};

export const lyricsCommand: CommandHandler = (_params, { audioManager, lyricsManager }) => {
  if (!audioManager.isPlaying()) {
    return;
  }
  if (lyricsManager.isDisplaying()) {
    return;
  }
  lyricsManager.startSync();
};

export const lyricsStopCommand: CommandHandler = (_params, { lyricsManager }) => {
  lyricsManager.stopSync();
};

export const lyricsLoadCommand: CommandHandler = (params, { lyricsManager, onOutput }) => {
  if (params[0]) {
    try {
      const lyricsData = JSON.parse(params.join(' ')) as unknown;
      lyricsManager.loadCustomLyrics(lyricsData);
    } catch (error) {
      logger.error('Error parsing custom lyrics JSON:', error);
      onOutput({ type: 'error', text: 'Error: Invalid JSON format for lyrics' });
    }
  } else {
    const lyricsJson = JSON.stringify(lyricsManager.getState().lyrics, null, 2);
    onOutput({ type: 'output', text: lyricsJson });
  }
};

export const startCommand: CommandHandler = (_params, { audioManager, onOutput }) => {
  const state = audioManager.getState();
  if (state.hasCompletedInitialPlay || state.isWaitingForStartCommand) {
    audioManager.reset();
    audioManager.start();
  } else if (!state.hasStarted) {
    audioManager.start();
  } else {
    onOutput({ type: 'output', text: 'Terminal autoplay is already running. Wait for it to complete or type \'stop\' first.' });
  }
};

