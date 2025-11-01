import type { CommandHandler } from './commandRegistry';
import { toBase64Utf8, fromBase64Utf8 } from '../terminalUtils';
import { logger } from '../../lib/utils/logger';

export const echoCommand: CommandHandler = (params, { onOutput }) => {
  const text = params.join(' ') || 'ECHO is on.';
  onOutput({ type: 'output', text: text });
};

export const b64Command: CommandHandler = (params, { onOutput }) => {
  if (params[0]) {
    const encoded = toBase64Utf8(params.join(' '));
    onOutput({ type: 'output', text: encoded });
  } else {
    onOutput({ type: 'output', text: 'Error: Empty string' });
  }
};

export const db64Command: CommandHandler = (params, { onOutput }) => {
  if (params[0]) {
    try {
      const decoded = fromBase64Utf8(params.join(''));
      onOutput({ type: 'output', text: decoded });
    } catch (error) {
      logger.error('Error decoding Base64 string:', error);
      onOutput({ type: 'output', text: 'Error: Invalid Base64 string' });
    }
  } else {
    onOutput({ type: 'output', text: 'Error: Empty string' });
  }
};

export const randomCommand: CommandHandler = (params, { onOutput }) => {
  const num = params[0];
  const result = Math.random();

  if (num) {
    const isCorrect = Number(num) === result;
    onOutput({
      type: 'output',
      text: `${isCorrect ? 'You predicted the correct number' : 'You predicted the wrong number'}`
    });
    onOutput({
      type: 'output',
      text: `The correct answer is: ${result}`
    });
    onOutput({
      type: 'output',
      text: `Take a look at https://github.com/aiko-chan-ai/v8-randomness-predictor`
    });
  } else {
    onOutput({ type: 'output', text: result.toString() });
  }
};

export const funCommand: CommandHandler = (_params, { onOutput }) => {
  const style = document.createElement('style');
  style.innerHTML = `
    html:after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      opacity: 0.9;
      mix-blend-mode: hue;
      z-index: 999999999999;
      pointer-events: none;
    }
    @keyframes rotate {
      from { transform: rotateZ(0deg); }
      to { transform: rotateZ(360deg); }
    }
    #terminal-container {
      animation: rotate 5s infinite alternate;
    }
  `;
  document.head.appendChild(style);

  setTimeout(() => {
    document.head.removeChild(style);
    onOutput({ type: 'output', text: 'Done!' });
  }, 4900);
};

export const myipCommand: CommandHandler = (params, { onOutput }) => {
  const loadingStates = [
    'Please wait',
    'Please wait.',
    'Please wait..',
    'Please wait...'
  ];

  let currentState = 0;
  const loadingInterval = setInterval(() => {
    onOutput({
      type: 'prompt',
      text: loadingStates[currentState],
      isNewLine: false
    });
    currentState = (currentState + 1) % loadingStates.length;
  }, 200);

  fetch('https://api.ipify.org/')
    .then(response => response.text())
    .then(ip => {
      clearInterval(loadingInterval);
      onOutput({ type: 'prompt', text: ip });
    })
    .catch((error: Error) => {
      clearInterval(loadingInterval);
      logger.error('Error fetching IP address:', error);
      onOutput({ type: 'prompt', text: `Error: ${error.message}` });
    });
};

