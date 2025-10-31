import type { TerminalConfig, AudioState, LyricsState, LyricLine, TerminalOutput } from '../types/terminal';
import { createEntranceAnimation, createExitAnimation, killAllAnimations } from './lyricsAnimations';

interface CommandDefinition {
  command: string;
  display: string;
  description: string;
  body?: () => string | Promise<string>;
}

interface TerminalIcons {
  [key: string]: string;
}

interface InitRefs {
  suggestEl: HTMLElement;
  input: HTMLInputElement;
}

interface GitHubUser {
  avatar_url?: string;
  name?: string;
  followers?: number;
  following?: number;
}

interface GitHubRepo {
  name?: string;
  html_url?: string;
  fork?: boolean;
  stargazers_count?: number;
  forks_count?: number;
}

interface TerminalAPI {
  execute: (command: string) => Promise<void>;
  addOutput: (item: TerminalOutput) => void;
  clear: () => void;
}

export function initTerminal({ target = '#terminal-container', username = 'reina', audioSrc = '/assets/media/hope.mp3' }: TerminalConfig = {}): TerminalAPI | undefined {
  const terminal = document.querySelector<HTMLElement>(target);
  if (!terminal) return;

  let commandHistory: string[] = [];
  let historyIndex: number = -1;
  let isProcessing: boolean = false;
  let output: TerminalOutput[] = [];
  let suggestedCommand: CommandDefinition | null = null;
  let pauseRef: { current: boolean } = { current: false };
  const GITHUB_API_USER = 'reinamaccredy';
  const GITHUB_HTML_USER = 'ReinaMacCredy';
  const audioState: AudioState = { 
    audio: null, 
    isPlaying: false, 
    hasStarted: false,
    hasCompletedInitialPlay: false,
    isWaitingForStartCommand: false,
    initialAutoplayEnabled: true
  };
  
  const lyricsState: LyricsState = {
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

  async function loadLyricsFromJSON(): Promise<void> {
    if (lyricsState.lyrics.length > 0) {
      return;
    }

    try {
      const response = await fetch('/data/lyrics.json');
      if (!response.ok) {
        console.error(`Failed to load lyrics: ${response.status} ${response.statusText}`);
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
          lyricsState.lyrics = lyricsData as LyricLine[];
        } else {
          console.error('Invalid lyrics format: items must have text, startTime, and endTime');
        }
      } else {
        console.error('Invalid lyrics format: must be an array');
      }
    } catch (error) {
      console.error('Error loading lyrics from JSON:', error);
    }
  }

  loadLyricsFromJSON();

  const cache = new Map<string, unknown>();

  const ICONS: TerminalIcons = {
    b64: '<>',
    db64: '<>',
    clear: '◈',
    echo: '{}',
    fun: '*',
    help: '?',
    info: 'i',
    whoami: '@',
    banner: '▦',
    repo: '#',
    email: '@',
    social: '+',
    myip: '.',
    play: '▶',
    stop: '■',
    projects: '#',
    random: '?',
    lyrics: '~',
    'lyrics-stop': '⏹'
  };

  const toBase64Utf8 = (s: string): string => { 
    const bytes = new TextEncoder().encode(s); 
    let bin = ''; 
    for (const b of bytes) bin += String.fromCharCode(b); 
    return btoa(bin); 
  };
  const fromBase64Utf8 = (b64: string): string => { 
    const cleaned = b64.replace(/\s+/g, ''); 
    const bin = atob(cleaned); 
    const bytes = Uint8Array.from(bin, c => c.charCodeAt(0)); 
    return new TextDecoder().decode(bytes); 
  };
  const escapeHtml = (s: string = ''): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  const commands: CommandDefinition[] = [
    { command: "help", display: "help", description: "List all available commands", body: () => helpCommand() },
    { command: "info", display: "info", description: "Get info about me", body: () => infoCommand() },
    { command: "whoami", display: "whoami", description: "Display logged-in user.", body: () => whoamiCommand() },
    { command: "projects", display: "projects", description: "Display a list of my major projects.", body: () => projectsCommand() },
    { command: "repo", display: "repo", description: "Open repository link.", body: () => repoCommand() },
    { command: "social", display: "social", description: "Show social links.", body: () => socialCommand() },
    { command: "email", display: "email", description: "Show contact email.", body: () => emailCommand() },
    { command: "banner", display: "banner", description: "Print the banner.", body: () => bannerCommand() },
    { command: "echo", display: "echo [arg ...]", description: "Write arguments to the standard output." },
    { command: "random", display: "random <num>", description: "Return a pseudo-random number between 0 and 1, or you can try to predict the result!" },
    { command: "clear", display: "clear", description: "Clear the terminal screen." },
    { command: "fun", display: "fun", description: "Try it and see" },
    { command: "play", display: "play", description: "Play soundtrack (mp3)" },
    { command: "stop", display: "stop", description: "Stop soundtrack" },
    { command: "myip", display: "myip", description: "Return your IPv4" },
    { command: "b64", display: "b64 [string]", description: "Encode to Base64 format" },
    { command: "db64", display: "db64 [base64]", description: "Decode from Base64 format" },
    { command: "lyrics", display: "lyrics", description: "Show synced lyrics with audio" },
    { command: "lyrics-stop", display: "lyrics-stop", description: "Stop lyrics display" },
    { command: "lyrics-load", display: "lyrics-load [json]", description: "Load custom lyrics" },
    { command: "start", display: "start", description: "Start/restart terminal autoplay demo" },
  ].sort((a, b) => a.command.localeCompare(b.command));

  function helpCommand(): string {
    const [major, minor, patch] = '1.0.3'.split('.');
    const title = `<div class="help-header">Available Commands - Web bash v<span class="text-ctp-green">${major}</span>.<span class="text-ctp-blue">${minor}</span>.<span class="text-ctp-red">${patch}</span></div>`;
    const subtitle = `<div class="help-subtitle">Type any command below and press Enter. Use <span class="text-ctp-blue">Tab</span> or <span class="text-ctp-blue">→</span> to autocomplete.</div>`;
    const rows = commands.map((cmd) => {
      const icon = ICONS[cmd.command] || '·';
      return `<div class="help-row"><div class="cmd-col"><span class="icon">${icon}</span><span class="text-ctp-green">${cmd.display}</span></div><div class="desc-col">${escapeHtml(cmd.description)}</div></div>`;
    }).join('\n');
    return `${title}\n${subtitle}\n<div class="help-list">${rows}</div>`;
  }

  async function getGitHubUser(): Promise<GitHubUser> {
    const url = `https://api.github.com/users/${GITHUB_API_USER}`;
    if (cache.has(url)) return cache.get(url) as GitHubUser;
    const res = await fetch(url);
    const data = await res.json() as GitHubUser;
    cache.set(url, data);
    return data;
  }

  async function infoCommand(): Promise<string> {
    try {
      const u = await getGitHubUser();
      const avatar = escapeHtml(u.avatar_url || '');
      const name = escapeHtml(u.name || GITHUB_HTML_USER);
      const followers = Number(u.followers || 0);
      const following = Number(u.following || 0);
      return [
        `<div class="my-2 font-jetbrains flex flex-col lg:flex-row items-center gap-4 info-block">`,
        `  <img src="${avatar}" alt="avatar-github" class="rounded-full w-[250px] h-[250px]" />`,
        `  <div class="max-w-[500px]">`,
        `    <div class="flex flex-col lg:flex-row items-center gap-0 md:gap-3 header">`,
        `      <h5 class="font-semibold text-lg underline"><a href="https://github.com/${GITHUB_HTML_USER}" target="_blank" rel="noreferrer" class="underline" style="color: inherit; text-decoration: underline;">${name}</a></h5>`,
        `      <span class="text-ctp-blue">@${GITHUB_HTML_USER.toLowerCase()}</span>`,
        `      <span>(${followers} followers · ${following} following)</span>`,
        `    </div>`,
        `    <p>Hewwo! I'm a student from Vietnam.</p>`,
        `    <p>I enjoy playing <span class="text-ctp-green">Open-world, FPS Games, Adventure, Platformer, Rhythm </span>and <span class="italic">some lewd visual novels (shhh, don't tell anyone!)</span></p>`,
        `    <p>I <span class="text-ctp-red">love</span> programming and have a few small projects (check out my github!)</p>`,
        `  </div>`,
        `</div>`
      ].join('');
    } catch (e) {
      return `GitHub: https://github.com/${GITHUB_HTML_USER}`;
    }
  }

  function whoamiCommand(): string { return `${username}`; }
  function repoCommand(): string { return `GitHub: https://github.com/${GITHUB_HTML_USER}`; }
  function socialCommand(): string { return [`GitHub  → https://github.com/${GITHUB_HTML_USER}`, `Email   → reina.maccredy@outlook.com`].join('\n'); }
  function emailCommand(): string { return `reina.maccredy@outlook.com`; }
  function bannerCommand(): string { return 'Hi~'; }

  async function projectsCommand(): Promise<string> {
    try {
      const res = await fetch(`https://api.github.com/users/${GITHUB_API_USER}/repos?per_page=12&sort=updated`);
      const repos = await res.json() as GitHubRepo[] | unknown;
      if (!Array.isArray(repos)) return `GitHub: https://github.com/${GITHUB_HTML_USER}`;
      const top = repos
        .filter((r): r is GitHubRepo => typeof r === 'object' && r !== null && !('fork' in r) || !r.fork)
        .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
        .slice(0, 6);
      const lines = top.map((r) => {
        const safeName = escapeHtml(r.name || '');
        const safeUrl = typeof r.html_url === 'string' && r.html_url.startsWith('https://github.com/')
          ? r.html_url
          : `https://github.com/${GITHUB_HTML_USER}`;
        const stars = Number(r.stargazers_count) || 0;
        const forks = Number(r.forks_count) || 0;
        return `• <a class="text-ctp-blue underline" href="${safeUrl}" target="_blank" rel="noreferrer">${safeName}</a> — Stars: ${stars}  Forks: ${forks}`;
      });
      return [
        'Major Projects:',
        ...lines,
        `\nGitHub: https://github.com/${GITHUB_HTML_USER}`,
      ].join('\n');
    } catch (_) {
      return `GitHub: https://github.com/${GITHUB_HTML_USER}`;
    }
  }

  function createTerminalElements(): void {
    terminal.innerHTML = `
      <div class="terminal-header bg-ctp-mantle p-5 rounded-t-3xl">
        <div class="flex items-center gap-4">
          <div class="w-4 h-4 rounded-full bg-ctp-red"></div>
          <div class="w-4 h-4 rounded-full bg-ctp-yellow"></div>
          <div class="w-4 h-4 rounded-full bg-ctp-green"></div>
        </div>
      </div>
      <div class="terminal-body bg-ctp-base p-5 rounded-b-3xl min-h-[60vh] lg:min-h-[70vh] max-h-[60vh] lg:max-h-[70vh] overflow-auto prompt">
        <div class="terminal-output text-ctp-subtext0 text-sm"></div>
        <!-- PRE-ALLOCATED LYRICS ZONE - Always present but hidden by default -->
        <div id="lyrics-zone" class="lyrics-zone-fixed">
          <div id="lyrics-container" class="lyrics-container"></div>
        </div>
        <div class="flex items-center gap-2 text-sm" style="display: flex;">
          <div class="text-ctp-subtext0 font-jetbrains">
            <span class="text-ctp-blue">${username}</span>@
            <span class="text-ctp-pink">${username}</span>:
            <span>~</span>$
          </div>
          <div class="relative w-full flex items-center text-sm">
            <span class="terminal-suggest" aria-hidden="true"></span>
            <input type="text" class="terminal-input bg-transparent border-none outline-none w-full font-jetbrains relative z-20 text-ctp-subtext0" placeholder="confused? type 'help' and press Enter to get started!" autocomplete="off" />
          </div>
        </div>
      </div>
    `;
  }

  function init(): void {
    createTerminalElements();
    
    const input = terminal.querySelector<HTMLInputElement>('.terminal-input');
    const outputContainer = terminal.querySelector<HTMLElement>('.terminal-output');
    const suggestEl = terminal.querySelector<HTMLElement>('.terminal-suggest');
    
    if (!input) return;
    
    input.focus();
    
    addOutput({ type: "output", text: "Type \"help\" to see available commands." });
    addOutput({ type: "output", text: "" });
    
    input.addEventListener('keydown', handleKeyDown);
    input.addEventListener('input', handleInputChange);
    
    terminal.addEventListener('click', () => input.focus());
    (init as unknown as { refs?: InitRefs }).refs = { suggestEl: suggestEl!, input };
    
    document.addEventListener('visibilitychange', () => {
      if (!audioState.audio) return;
      if (document.visibilityState === 'hidden' && !audioState.audio.paused) {
        audioState.audio.pause();
      } else if (document.visibilityState === 'visible' && audioState.isPlaying) {
        audioState.audio.play().catch(() => {});
      }
    });
    
    const startAudioOnClick = (): void => {
      if (!audioState.hasStarted && audioState.initialAutoplayEnabled && !audioState.hasCompletedInitialPlay) {
        audioState.hasStarted = true;
        startAudio();
        document.removeEventListener('click', startAudioOnClick);
        document.removeEventListener('keydown', startAudioOnClick);
      }
    };
    
    document.addEventListener('click', startAudioOnClick);
    document.addEventListener('keydown', startAudioOnClick);
  }

  function handleInputChange(e: Event): void {
    if (pauseRef.current) return;
    const target = e.target as HTMLInputElement;
    if (!target) return;

    const raw = target.value;
    const trimmedLeading = raw.replace(/(^ +)/g, "");
    const firstSpace = trimmedLeading.indexOf(" ");
    const rawFirstWord = firstSpace === -1 ? trimmedLeading : trimmedLeading.slice(0, firstSpace);
    const searchFirstWord = rawFirstWord.toLowerCase();
    const hasSpace = firstSpace !== -1;

    const input = [searchFirstWord, ...(firstSpace === -1 ? [] : trimmedLeading.slice(firstSpace + 1).split(" "))].join(" ");

    const found = commands.find(cmd => cmd.command.startsWith(searchFirstWord));
    suggestedCommand = found || null;
    const refs = (init as unknown as { refs?: InitRefs }).refs;
    const suggestEl = refs?.suggestEl;
    const inputEl = refs?.input;

    if (suggestEl) {
      const atEnd = inputEl && inputEl.selectionStart === inputEl.value.length && inputEl.selectionEnd === inputEl.value.length;
      if (!hasSpace && atEnd && searchFirstWord && suggestedCommand && suggestedCommand.command !== searchFirstWord) {
        const remainingSuggestion = suggestedCommand.command.substring(searchFirstWord.length);
        suggestEl.textContent = remainingSuggestion;

        if (inputEl) {
          const cs = getComputedStyle(inputEl);
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) return;
          const fontSize = cs.fontSize || '14px';
          const fontFamily = cs.fontFamily || '"JetBrains Mono", monospace';
          context.font = `${fontSize} ${fontFamily}`;

          const typedWidth = context.measureText(rawFirstWord).width;
          const paddingLeft = parseFloat(cs.paddingLeft || '0') || 0;

          suggestEl.style.left = `${paddingLeft + typedWidth}px`;
          suggestEl.style.opacity = '0.4';
        }
      } else {
        suggestEl.textContent = '';
        suggestEl.style.left = '0px';
      }
    }
  }

  function handleKeyDown(event: KeyboardEvent): void {
    if (pauseRef.current) return;
    const target = event.target as HTMLInputElement;
    if (!target) return;
    
    if (event.key === 'Enter') {
      const command = target.value.trim();
      if (command) {
        executeCommand(command);
        target.value = '';
        addToHistory(command);
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      navigateHistory('up');
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      navigateHistory('down');
    } else if (event.key === 'ArrowRight') {
      const inputEl = target;
      const atEnd = inputEl.selectionStart === inputEl.value.length && inputEl.selectionEnd === inputEl.value.length;
      if (atEnd && suggestedCommand) {
        event.preventDefault();
        inputEl.value = suggestedCommand.command;
        suggestedCommand = null;
        const refs = (init as unknown as { refs?: InitRefs }).refs;
        const suggestEl = refs?.suggestEl;
        if (suggestEl) suggestEl.textContent = '';
      }
    } else if (event.key === 'Tab') {
      event.preventDefault();
      if (suggestedCommand) {
        target.value = suggestedCommand.command;
        suggestedCommand = null;
        const refs = (init as unknown as { refs?: InitRefs }).refs;
        const suggestEl = refs?.suggestEl;
        if (suggestEl) suggestEl.textContent = '';
      }
    }
  }

  async function executeCommand(command: string): Promise<void> {
    const args = command.split(/ +/g);
    const rawCmd = args.shift() || '';
    const aliasMap: Record<string, string> = { about: 'info' };
    const lower = rawCmd.toLowerCase();
    const cmd = aliasMap[lower] || lower;
    const params = args;
    
    addOutput({ 
      type: "prompt", 
      text: createPromptLine(command, "", true),
      isHTML: true
    });
    
    switch (cmd) {
      case "play": {
        startAudio();
        addOutput({ type: "output", text: "The music was turned on. To stop playback enter 'stop'" });
        break;
      }
      case "stop":
        stopAudio();
        addOutput({ type: "output", text: "The music was turned off. To continue playing please enter 'play'" });
        break;
      case "fun":
        executeFunCommand();
        break;
      case "myip":
        executeMyIpCommand();
        break;
      case "clear":
        clearOutput();
        break;
      case "echo": {
        const text = params.join(' ') || 'ECHO is on.';
        addOutput({ type: "output", text: text });
        break;
      }
      case "b64": {
        if (params[0]) {
          const encoded = toBase64Utf8(params.join(' '));
          addOutput({ type: "output", text: encoded });
        } else {
          addOutput({ type: "output", text: "Error: Empty string" });
        }
        break;
      }
      case "db64": {
        if (params[0]) {
          try {
            const decoded = fromBase64Utf8(params.join(''));
            addOutput({ type: "output", text: decoded });
          } catch (error) {
            addOutput({ type: "output", text: "Error: Invalid Base64 string" });
          }
        } else {
          addOutput({ type: "output", text: "Error: Empty string" });
        }
        break;
      }
      case "random": {
        const num = params[0];
        const result = Math.random();
        
        if (num) {
          const isCorrect = Number(num) === result;
          addOutput({ 
            type: "output", 
            text: `${isCorrect ? 'You predicted the correct number' : 'You predicted the wrong number'}`
          });
          addOutput({ 
            type: "output", 
            text: `The correct answer is: ${result}`
          });
          addOutput({ 
            type: "output", 
            text: `Take a look at https://github.com/aiko-chan-ai/v8-randomness-predictor`
          });
        } else {
          addOutput({ type: "output", text: result.toString() });
        }
        break;
      }
      case 'help': {
        const text = await helpCommand();
        addOutput({ type: 'output', text, isHTML: true });
        break;
      }
      case 'info': {
        const text = await infoCommand();
        addOutput({ type: 'output', text, isHTML: true });
        break;
      }
      case 'whoami': {
        const text = whoamiCommand();
        addOutput({ type: 'output', text });
        break;
      }
      case 'projects': {
        const text = await projectsCommand();
        addOutput({ type: 'output', text, isHTML: true });
        break;
      }
      case 'repo': {
        const text = repoCommand();
        addOutput({ type: 'output', text });
        break;
      }
      case 'social': {
        const text = socialCommand();
        addOutput({ type: 'output', text });
        break;
      }
      case 'email': {
        const text = emailCommand();
        addOutput({ type: 'output', text });
        break;
      }
      case 'banner': {
        const text = bannerCommand();
        addOutput({ type: 'output', text });
        break;
      }
      case "lyrics": {
        if (!audioState.audio) {
          break;
        }
        
        if (lyricsState.isDisplaying) {
          break;
        }
        
        startLyricsSync();
        break;
      }
      case "lyrics-stop": {
        stopLyricsSync();
        break;
      }
      case "lyrics-load": {
        if (params[0]) {
          try {
            const lyricsData = JSON.parse(params.join(' ')) as unknown;
            if (Array.isArray(lyricsData)) {
              lyricsState.lyrics = lyricsData as LyricLine[];
            }
          } catch (error) {
          }
        } else {
          addOutput({ type: "output", text: JSON.stringify(lyricsState.lyrics, null, 2) });
        }
        break;
      }
      case "start": {
        executeStartCommand();
        break;
      }
      default: {
        const found = commands.find(c => c.command === cmd);
        if (found && found.body) {
          const result = await found.body();
          const isHTML = /<[^>]*>/.test(result);
          addOutput({ type: "output", text: result, isHTML });
        } else if (cmd !== "") {
          addOutput({ 
            type: "error", 
            text: `Command not found: ${cmd}. Type "help" for available commands.`
          });
        }
        break;
      }
    }
    
    addOutput({ type: "output", text: "" });
  }

  function executeStartCommand(): void {
    if (audioState.hasCompletedInitialPlay || audioState.isWaitingForStartCommand) {
      audioState.hasStarted = false;
      audioState.hasCompletedInitialPlay = false;
      audioState.isWaitingForStartCommand = false;
      audioState.isPlaying = false;
      
      if (audioState.audio) {
        audioState.audio.currentTime = 0;
        audioState.audio.pause();
      }
      
      startAudio();
    } else if (!audioState.hasStarted) {
      audioState.hasStarted = true;
      startAudio();
    } else {
      addOutput({ type: "output", text: "Terminal autoplay is already running. Wait for it to complete or type 'stop' first." });
    }
  }

  function ensureAudio(): HTMLAudioElement {
    if (!audioState.audio) {
      const a = new Audio(audioSrc);
      a.loop = false;
      a.volume = 0.12;
      audioState.audio = a;
      
      a.addEventListener('error', (e) => {
        console.warn('Audio failed to load:', e);
        addOutput({ type: "error", text: "Audio failed to load. Check the audio file path." });
      });
      
      a.addEventListener('ended', () => {
        audioState.isPlaying = false;
        audioState.hasCompletedInitialPlay = true;
        audioState.isWaitingForStartCommand = true;
        
        if (lyricsState.isDisplaying) {
          stopLyricsSync();
        }
        

      });
    }
    return audioState.audio;
  }

  function startAudio(): void {
    const a = ensureAudio();
    audioState.isPlaying = true;
    
    a.play().then(() => {
      loadLyricsFromJSON().then(() => {
        setTimeout(() => {
          if (!lyricsState.isDisplaying) {
            startLyricsSync();
          }
        }, 2000);
      });
    }).catch((error: Error) => {
      addOutput({ type: "error", text: `Audio error: ${error.message}` });
      audioState.isPlaying = false;
    });
  }

  function stopAudio(): void {
    if (!audioState.audio) return;
    audioState.isPlaying = false;
    
    if (lyricsState.isDisplaying) {
      stopLyricsSync();
    }
    
    try {
      audioState.audio.pause();
      audioState.audio.currentTime = 0;
    } catch (_) {}
  }
  
  function executeFunCommand(): void {
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
    
    pauseRef.current = true;
    setTimeout(() => {
      document.head.removeChild(style);
      pauseRef.current = false;
      addOutput({ type: "output", text: "Done!" });
    }, 4900);
  }
  
  function executeMyIpCommand(): void {
    const loadingStates = [
      "Please wait",
      "Please wait.",
      "Please wait..",
      "Please wait..."
    ];
    
    let currentState = 0;
    const loadingInterval = setInterval(() => {
      addOutput({ 
        type: "prompt", 
        text: loadingStates[currentState],
        isNewLine: false
      });
      currentState = (currentState + 1) % loadingStates.length;
    }, 200);
    
    fetch("https://api.ipify.org/")
      .then(response => response.text())
      .then(ip => {
        clearInterval(loadingInterval);
        addOutput({ type: "prompt", text: ip });
      })
      .catch((error: Error) => {
        clearInterval(loadingInterval);
        addOutput({ type: "prompt", text: `Error: ${error.message}` });
      });
  }
  
  function createPromptLine(input: string, output: string, isCommand: boolean): string {
    return `
      <div class="text-ctp-subtext0 font-jetbrains">
        <div class="flex items-center gap-2 relative">
          <div>
            <span class="text-ctp-blue">${username}</span>@
            <span class="text-ctp-pink">${username}</span>:
            <span>~</span>$
          </div>
          <span class="${isCommand ? 'text-ctp-green' : 'text-ctp-red'}">${input}</span>
        </div>
        ${isCommand ? `<span class="text-ctp-text">${output}</span>` : `<span>Command not found: ${input}</span>`}
      </div>
    `;
  }
  
  function addOutput(item: TerminalOutput): void {
    output.push(item);
    renderOutput();
  }
  
  function clearOutput(): void {
    output = [];
    renderOutput();
  }
  
  function renderOutput(): void {
    const outputContainer = terminal.querySelector<HTMLElement>('.terminal-output');
    if (!outputContainer) return;
    
    outputContainer.innerHTML = output
      .filter(item => {
        return !(item.isHTML && item.text?.includes('lyrics-container-fixed'));
      })
      .map(item => {
        if (item.type === "prompt") {
          return `<div class="${item.type}">${item.isHTML ? item.text : escapeHtml(item.text || '')}</div>`;
        } else if (item.type === "output") {
          return `<div class="${item.type}">${item.isHTML ? item.text : escapeHtml(item.text || '')}</div>`;
        } else if (item.type === "error") {
          return `<div class="${item.type}">${item.text || ''}</div>`;
        }
        return '';
      }).join('');
    
    outputContainer.scrollTop = outputContainer.scrollHeight;
  }
  
  function addToHistory(command: string): void {
    commandHistory.push(command);
    historyIndex = commandHistory.length;
  }
  
  function navigateHistory(direction: 'up' | 'down'): void {
    const input = terminal.querySelector<HTMLInputElement>('.terminal-input');
    if (!input) return;
    
    if (direction === 'up' && historyIndex > 0) {
      historyIndex--;
      input.value = commandHistory[historyIndex] || '';
    } else if (direction === 'down' && historyIndex < commandHistory.length - 1) {
      historyIndex++;
      input.value = commandHistory[historyIndex] || '';
    } else if (direction === 'down' && historyIndex === commandHistory.length - 1) {
      historyIndex = commandHistory.length;
      input.value = '';
    }
  }
  
  function startLyricsSync(): void {
    lyricsState.isDisplaying = true;
    lyricsState.currentIndex = -1;
    lyricsState.displayedLyrics.clear();
    
    const lyricsZone = document.getElementById('lyrics-zone');
    if (lyricsZone) {
      lyricsZone.classList.add('active');
    }
    
    lyricsState.syncInterval = setInterval(updateLyricsDisplay, 100) as unknown as NodeJS.Timeout;
  }

  function stopLyricsSync(): void {
    lyricsState.isDisplaying = false;
    lyricsState.currentIndex = -1;
    lyricsState.activeIndex = -1;
    lyricsState.displayedLyrics.clear();
    
    killAllAnimations(lyricsState.gsapTimeline, lyricsState.gsapExitTimeline);
    lyricsState.gsapTimeline = null;
    lyricsState.gsapExitTimeline = null;
    
    const lyricsContainer = document.getElementById('lyrics-container');
    if (lyricsContainer) {
      const currentLyric = lyricsContainer.querySelector<HTMLElement>('.lyric-line');
      if (currentLyric) {
        const exitTimeline = createExitAnimation(currentLyric);
        lyricsState.gsapExitTimeline = exitTimeline;
        
        exitTimeline.eventCallback('onComplete', () => {
          lyricsContainer.innerHTML = '';
          lyricsState.gsapExitTimeline = null;
        });
      } else {
        lyricsContainer.innerHTML = '';
      }
    }
    
    const lyricsZone = document.getElementById('lyrics-zone');
    if (lyricsZone) {
      lyricsZone.classList.remove('active');
    }
    
    lyricsState.activeLyricElements.clear();
    lyricsState.animationQueue = [];
    
    lyricsState.disappearTimeouts.forEach((timeout) => {
      clearTimeout(timeout);
    });
    lyricsState.disappearTimeouts.clear();
    
    if (lyricsState.syncInterval) {
      clearInterval(lyricsState.syncInterval);
      lyricsState.syncInterval = null;
    }
  }

  function clearAllAnimationTimers(): void {
    for (let i = 1; i < 10000; i++) {
      clearTimeout(i);
      clearInterval(i);
    }
  }

  function updateLyricsDisplay(): void {
    if (!lyricsState.isDisplaying || !audioState.audio) return;
    
    const currentTime = audioState.audio.currentTime;
    
    for (let i = 0; i < lyricsState.lyrics.length; i++) {
      const lyric = lyricsState.lyrics[i];
      
      if (currentTime >= lyric.startTime && 
          currentTime <= lyric.endTime && 
          !lyricsState.displayedLyrics.has(i)) {
        
        lyricsState.displayedLyrics.add(i);
        lyricsState.currentIndex = i;
        displayCurrentLyric(lyric, currentTime);
        break;
      }
    }
  }

  function scheduleDisappear(lyricId: string, lyric: LyricLine): void {
    const element = document.getElementById(lyricId);
    if (!element) return;
    
    const disappearTimeline = createExitAnimation(element, {
      stagger: 0.02,
      duration: 0.4,
      blur: 8,
      direction: 'forward'
    });
    
    lyricsState.gsapExitTimeline = disappearTimeline;
    
    disappearTimeline.eventCallback('onComplete', () => {
      if (element.parentNode) {
        element.remove();
      }
      lyricsState.gsapExitTimeline = null;
    });
  }

  function displayCurrentLyric(lyric: LyricLine, currentTime: number): void {
    const lyricId = `lyric-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const lyricText = escapeHtml(lyric.text);
    
    const lyricsContainer = document.getElementById('lyrics-container');
    if (!lyricsContainer) return;
    
    killAllAnimations(lyricsState.gsapTimeline, lyricsState.gsapExitTimeline);
    lyricsState.gsapTimeline = null;
    lyricsState.gsapExitTimeline = null;
    
    lyricsState.disappearTimeouts.forEach((timeout) => {
      clearTimeout(timeout);
    });
    lyricsState.disappearTimeouts.clear();
    
    const currentLyric = lyricsContainer.querySelector<HTMLElement>('.lyric-line');
    if (currentLyric) {
      const exitTimeline = createExitAnimation(currentLyric);
      lyricsState.gsapExitTimeline = exitTimeline;
      
      exitTimeline.eventCallback('onComplete', () => {
        if (currentLyric.parentNode) {
          currentLyric.remove();
        }
        lyricsState.gsapExitTimeline = null;
      });
      
      setTimeout(() => {
        createNewLyric();
      }, 50);
    } else {
      createNewLyric();
    }
    
    function createNewLyric(): void {
      lyricsContainer.innerHTML = `<div id="${lyricId}" class="lyric-line" data-lyric-text="${lyricText}">${lyricText}</div>`;
      
      const newElement = document.getElementById(lyricId);
      if (!newElement) return;
      
      lyricsState.activeLyricElements.clear();
      lyricsState.activeLyricElements.set(lyric.startTime, lyricId);
      lyricsState.activeIndex = lyricsState.currentIndex;
      
      requestAnimationFrame(() => {
        const entranceTimeline = createEntranceAnimation(newElement, lyric.text);
        lyricsState.gsapTimeline = entranceTimeline;
        
        entranceTimeline.eventCallback('onComplete', () => {
          const updatedCurrentTime = audioState.audio?.currentTime ?? currentTime;
          
          const disappearDuration = 0.4;
          const disappearTime = lyric.endTime - 1.15;
          
          const timeUntilDisappear = (disappearTime - updatedCurrentTime) * 1000;
          
          if (timeUntilDisappear > disappearDuration * 1000) {
            const timeoutId = setTimeout(() => {
              scheduleDisappear(lyricId, lyric);
              lyricsState.disappearTimeouts.delete(lyricId);
            }, timeUntilDisappear);
            
            lyricsState.disappearTimeouts.set(lyricId, timeoutId);
          } else if (timeUntilDisappear > 0) {
            scheduleDisappear(lyricId, lyric);
          }
        });
      });
    }
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function transitionPreviousLyricsToStatic(currentStartTime: number): void {
    lyricsState.activeLyricElements.forEach((lyricId, startTime) => {
      if (startTime < currentStartTime) {
        const element = document.getElementById(lyricId);
        if (element) {
          const exitTimeline = createExitAnimation(element);
          exitTimeline.eventCallback('onComplete', () => {
            if (element.parentNode) {
              element.parentNode.removeChild(element);
            }
          });
        }
        lyricsState.activeLyricElements.delete(startTime);
      }
    });
  }
  
  function scheduleOldLyricsExit(currentStartTime: number): void {
  }
  
  init();
  
  return {
    execute: executeCommand,
    addOutput: addOutput,
    clear: clearOutput
  };
}

