/**
 * Command registry - aggregates all command handlers
 */

import type { CommandRegistry } from './commandRegistry';
import { playCommand, stopCommand, lyricsCommand, lyricsStopCommand, lyricsLoadCommand, startCommand } from './audioCommands';
import { helpCommand, infoCommand, whoamiCommand, repoCommand, socialCommand, emailCommand, bannerCommand, projectsCommand } from './infoCommands';
import { echoCommand, b64Command, db64Command, randomCommand, funCommand, myipCommand } from './utilityCommands';

export const commandRegistry: CommandRegistry = {
  play: playCommand,
  stop: stopCommand,
  lyrics: lyricsCommand,
  'lyrics-stop': lyricsStopCommand,
  'lyrics-load': lyricsLoadCommand,
  start: startCommand,
  help: helpCommand,
  info: infoCommand,
  whoami: whoamiCommand,
  repo: repoCommand,
  social: socialCommand,
  email: emailCommand,
  banner: bannerCommand,
  projects: projectsCommand,
  echo: echoCommand,
  b64: b64Command,
  db64: db64Command,
  random: randomCommand,
  fun: funCommand,
  myip: myipCommand,
};

