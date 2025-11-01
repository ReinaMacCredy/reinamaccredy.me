/**
 * Information-related command handlers
 */

import type { CommandHandler, CommandContext } from './commandRegistry';
import type { TerminalOutput } from '../../types/terminal';
import { escapeHtml } from '../terminalUtils';

export const infoCommand: CommandHandler = {
  execute: async (params: string[], context: CommandContext): Promise<void> => {
    if (context.infoCommand && context.githubService) {
      const result = await context.infoCommand();
      const isHTML = /<[^>]*>/.test(result);
      context.onOutput({ type: "output", text: result, isHTML });
    }
  }
};

export const whoamiCommand: CommandHandler = {
  execute: (params: string[], context: CommandContext): void => {
    if (context.whoamiCommand) {
      const result = context.whoamiCommand();
      context.onOutput({ type: "output", text: result });
    }
  }
};

export const repoCommand: CommandHandler = {
  execute: (params: string[], context: CommandContext): void => {
    if (context.repoCommand) {
      const result = context.repoCommand();
      context.onOutput({ type: "output", text: result });
    }
  }
};

export const socialCommand: CommandHandler = {
  execute: (params: string[], context: CommandContext): void => {
    if (context.socialCommand) {
      const result = context.socialCommand();
      context.onOutput({ type: "output", text: result });
    }
  }
};

export const emailCommand: CommandHandler = {
  execute: (params: string[], context: CommandContext): void => {
    if (context.emailCommand) {
      const result = context.emailCommand();
      context.onOutput({ type: "output", text: result });
    }
  }
};

export const bannerCommand: CommandHandler = {
  execute: (params: string[], context: CommandContext): void => {
    if (context.bannerCommand) {
      const result = context.bannerCommand();
      context.onOutput({ type: "output", text: result });
    }
  }
};

export const projectsCommand: CommandHandler = {
  execute: async (params: string[], context: CommandContext): Promise<void> => {
    if (context.projectsCommand) {
      const result = await context.projectsCommand();
      context.onOutput({ type: "output", text: result });
    }
  }
};

export const helpCommand: CommandHandler = {
  execute: (params: string[], context: CommandContext): void => {
    if (context.helpCommand) {
      const result = context.helpCommand();
      context.onOutput({ type: "output", text: result, isHTML: true });
    }
  }
};

