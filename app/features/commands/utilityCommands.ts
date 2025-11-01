/**
 * Utility command handlers
 */

import type { CommandHandler, CommandContext } from './commandRegistry';
import type { TerminalOutput } from '../../types/terminal';
import { toBase64Utf8, fromBase64Utf8 } from '../terminalUtils';

export const echoCommand: CommandHandler = {
  execute: (params: string[], context: CommandContext): void => {
    const text = params.join(' ') || 'ECHO is on.';
    context.onOutput({ type: "output", text: text });
  }
};

export const b64Command: CommandHandler = {
  execute: (params: string[], context: CommandContext): void => {
    if (params[0]) {
      const encoded = toBase64Utf8(params.join(' '));
      context.onOutput({ type: "output", text: encoded });
    } else {
      context.onOutput({ type: "output", text: "Error: Empty string" });
    }
  }
};

export const db64Command: CommandHandler = {
  execute: (params: string[], context: CommandContext): void => {
    if (params[0]) {
      try {
        const decoded = fromBase64Utf8(params.join(''));
        context.onOutput({ type: "output", text: decoded });
      } catch (error) {
        context.onOutput({ type: "output", text: "Error: Invalid Base64 string" });
      }
    } else {
      context.onOutput({ type: "output", text: "Error: Empty string" });
    }
  }
};

export const randomCommand: CommandHandler = {
  execute: (params: string[], context: CommandContext): void => {
    const num = params[0];
    const result = Math.random();

    if (num) {
      const isCorrect = Number(num) === result;
      context.onOutput({
        type: "output",
        text: `${isCorrect ? 'You predicted the correct number' : 'You predicted the wrong number'}`
      });
      context.onOutput({
        type: "output",
        text: `The correct answer is: ${result}`
      });
      context.onOutput({
        type: "output",
        text: `Take a look at https://github.com/aiko-chan-ai/v8-randomness-predictor`
      });
    } else {
      context.onOutput({ type: "output", text: result.toString() });
    }
  }
};

export const funCommand: CommandHandler = {
  execute: (params: string[], context: CommandContext): void => {
    if (context.executeFunCommand) {
      context.executeFunCommand();
    }
  }
};

export const myipCommand: CommandHandler = {
  execute: (params: string[], context: CommandContext): void => {
    if (context.executeMyIpCommand) {
      context.executeMyIpCommand();
    }
  }
};

