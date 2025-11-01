/**
 * Dependency injection interfaces and factory for Terminal
 */

import type { TerminalOutput } from '../types/terminal';
import { GitHubService } from './githubService';
import { AudioManager } from './audioManager';
import { LyricsManager } from './lyricsManager';
import { CommandManager } from './commandManager';

export interface TerminalDependencies {
  githubService: GitHubService;
  audioManager: AudioManager;
  lyricsManager: LyricsManager;
  commandManager: CommandManager;
}

export interface TerminalServicesConfig {
  githubUser: string;
  githubDisplayName: string;
  audioSrc: string;
  onOutput: (item: TerminalOutput) => void;
}

/**
 * Factory function to create all Terminal dependencies with proper DI
 */
export function createTerminalDependencies(config: TerminalServicesConfig): TerminalDependencies {
  // Create services in order, avoiding circular dependencies
  
  // 1. GitHub service (no dependencies)
  const githubService = new GitHubService(config.githubUser, config.githubDisplayName);

  // 2. Audio manager (depends on onOutput callback)
  const audioManager = new AudioManager(config.audioSrc, config.onOutput);

  // 3. Lyrics manager (depends on audio manager callbacks)
  const lyricsManager = new LyricsManager({
    getCurrentTime: () => audioManager.getCurrentTime(),
    isPlaying: () => audioManager.isPlaying()
  });

  // 4. Command manager (depends on all services)
  const commandManager = new CommandManager(
    githubService,
    audioManager,
    lyricsManager,
    config.onOutput
  );

  // 5. Wire up audio manager callback to auto-start lyrics
  // Set callback after lyrics manager is created to avoid circular dependency
  audioManager.setOnPlayStart(() => {
    const lyricsState = lyricsManager.getState();
    if (lyricsState.lyrics.length > 0 && !lyricsManager.isDisplaying()) {
      lyricsManager.startSync();
    }
  });

  // Load lyrics initially
  lyricsManager.loadLyrics();

  return {
    githubService,
    audioManager,
    lyricsManager,
    commandManager
  };
}

