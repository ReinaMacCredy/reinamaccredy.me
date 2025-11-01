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

export function createTerminalDependencies(config: TerminalServicesConfig): TerminalDependencies {
  const githubService = new GitHubService(config.githubUser, config.githubDisplayName);

  const audioManager = new AudioManager(config.audioSrc, config.onOutput);

  const lyricsManager = new LyricsManager({
    getCurrentTime: () => audioManager.getCurrentTime(),
    isPlaying: () => audioManager.isPlaying()
  });

  const commandManager = new CommandManager(
    githubService,
    audioManager,
    lyricsManager,
    config.onOutput
  );

  audioManager.setOnPlayStart(() => {
    const lyricsState = lyricsManager.getState();
    if (lyricsState.lyrics.length > 0 && !lyricsManager.isDisplaying()) {
      lyricsManager.startSync();
    }
  });

  lyricsManager.loadLyrics();

  return {
    githubService,
    audioManager,
    lyricsManager,
    commandManager
  };
}

