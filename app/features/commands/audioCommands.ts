/**
 * Audio-related command handlers
 */

import type { CommandHandler, CommandContext } from './commandRegistry';
import type { TerminalOutput } from '../../types/terminal';

export const playCommand: CommandHandler = {
  execute: (params: string[], context: CommandContext): void => {
    if (context.audioManager) {
      context.audioManager.start();
      context.onOutput({ type: "output", text: "The music was turned on. To stop playback enter 'stop'" });
    }
  }
};

export const stopCommand: CommandHandler = {
  execute: (params: string[], context: CommandContext): void => {
    if (context.audioManager) {
      context.audioManager.stop();
      context.onOutput({ type: "output", text: "The music was turned off. To continue playing please enter 'play'" });
    }
  }
};

export const lyricsCommand: CommandHandler = {
  execute: (params: string[], context: CommandContext): void => {
    if (!context.audioManager?.isPlaying() || !context.lyricsManager) {
      return;
    }
    if (context.lyricsManager.isDisplaying()) {
      return;
    }
    context.lyricsManager.startSync();
  }
};

export const lyricsStopCommand: CommandHandler = {
  execute: (params: string[], context: CommandContext): void => {
    if (context.lyricsManager) {
      context.lyricsManager.stopSync();
    }
  }
};

export const lyricsLoadCommand: CommandHandler = {
  execute: (params: string[], context: CommandContext): void => {
    if (!context.lyricsManager) return;
    
    if (params[0]) {
      try {
        const lyricsData = JSON.parse(params.join(' ')) as unknown;
        context.lyricsManager.loadCustomLyrics(lyricsData);
      } catch (error) {
        // Ignore parsing errors
      }
    } else {
      const lyricsJson = JSON.stringify(context.lyricsManager.getState().lyrics, null, 2);
      context.onOutput({ type: "output", text: lyricsJson });
    }
  }
};

export const startCommand: CommandHandler = {
  execute: (params: string[], context: CommandContext): void => {
    if (context.executeStartCommand) {
      context.executeStartCommand();
    }
  }
};

