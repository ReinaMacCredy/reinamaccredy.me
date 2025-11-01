import type { CommandHandler } from './commandRegistry';
import { escapeHtml } from '../terminalUtils';
import { logger } from '../../lib/utils/logger';

export const helpCommand: CommandHandler = (params, { commands, icons, onOutput }) => {
  const [major, minor, patch] = '1.0.3'.split('.');
  const title = `<div class="help-header">Available Commands - Web bash v<span class="text-ctp-green">${major}</span>.<span class="text-ctp-blue">${minor}</span>.<span class="text-ctp-red">${patch}</span></div>`;
  const subtitle = `<div class="help-subtitle">Type any command below and press Enter. Use <span class="text-ctp-blue">Tab</span> or <span class="text-ctp-blue">→</span> to autocomplete.</div>`;
  const rows = commands.map((cmd) => {
    const icon = icons[cmd.command] || '·';
    return `<div class="help-row"><div class="cmd-col"><span class="icon">${icon}</span><span class="text-ctp-green">${cmd.display}</span></div><div class="desc-col">${escapeHtml(cmd.description)}</div></div>`;
  }).join('\n');
  onOutput({ type: 'output', text: `${title}\n${subtitle}\n<div class="help-list">${rows}</div>`, isHTML: true });
};

export const infoCommand: CommandHandler = async (params, { githubService, onOutput }) => {
  try {
    const u = await githubService.getUser();
    const avatar = escapeHtml(u.avatar_url || '');
    const name = escapeHtml(u.name || githubService.getHtmlUser());
    const followers = Number(u.followers || 0);
    const following = Number(u.following || 0);
    const result = [
      `<div class="my-2 font-jetbrains flex flex-col lg:flex-row items-center gap-4 info-block">`,
      `  <img src="${avatar}" alt="avatar-github" class="rounded-full w-[250px] h-[250px]" />`,
      `  <div class="max-w-[500px]">`,
      `    <div class="flex flex-col lg:flex-row items-center gap-0 md:gap-3 header">`,
      `      <h5 class="font-semibold text-lg underline"><a href="https://github.com/${githubService.getHtmlUser()}" target="_blank" rel="noreferrer" class="underline" style="color: inherit; text-decoration: underline;">${name}</a></h5>`,
      `      <span class="text-ctp-blue">@${githubService.getHtmlUser().toLowerCase()}</span>`,
      `      <span>(${followers} followers · ${following} following)</span>`,
      `    </div>`,
      `    <p>Hewwo! I'm a student from Vietnam.</p>`,
      `    <p>I enjoy playing <span class="text-ctp-green">Open-world, FPS Games, Adventure, Platformer, Rhythm </span>and <span class="italic">some lewd visual novels (shhh, don't tell anyone!)</span></p>`,
      `    <p>I <span class="text-ctp-red">love</span> programming and have a few small projects (check out my github!)</p>`,
      `  </div>`,
      `</div>`
    ].join('');
    const isHTML = /<[^>]*>/.test(result);
    onOutput({ type: 'output', text: result, isHTML });
  } catch (e) {
    logger.error('Error fetching GitHub user info:', e);
    onOutput({ type: 'output', text: `GitHub: https://github.com/${githubService.getHtmlUser()}` });
  }
};

export const whoamiCommand: CommandHandler = (params, { githubService, onOutput }) => {
  onOutput({ type: 'output', text: githubService.getHtmlUser() });
};

export const repoCommand: CommandHandler = (params, { githubService, onOutput }) => {
  onOutput({ type: 'output', text: `GitHub: https://github.com/${githubService.getHtmlUser()}` });
};

export const socialCommand: CommandHandler = (params, { githubService, onOutput }) => {
  onOutput({ type: 'output', text: [`GitHub  → https://github.com/${githubService.getHtmlUser()}`, `Email   → reina.maccredy@outlook.com`].join('\n') });
};

export const emailCommand: CommandHandler = (params, { onOutput }) => {
  onOutput({ type: 'output', text: `reina.maccredy@outlook.com` });
};

export const bannerCommand: CommandHandler = (params, { onOutput }) => {
  onOutput({ type: 'output', text: 'Hi~' });
};

export const projectsCommand: CommandHandler = async (params, { githubService, onOutput }) => {
  try {
    const repos = await githubService.getTopRepos(6);
    const lines = repos.map((r) => {
      const safeName = escapeHtml(r.name || '');
      const safeUrl = typeof r.html_url === 'string' && r.html_url.startsWith('https://github.com/')
        ? r.html_url
        : `https://github.com/${githubService.getHtmlUser()}`;
      const stars = Number(r.stargazers_count) || 0;
      const forks = Number(r.forks_count) || 0;
      return `• <a class="text-ctp-blue underline" href="${safeUrl}" target="_blank" rel="noreferrer">${safeName}</a> — Stars: ${stars}  Forks: ${forks}`;
    });
    onOutput({
      type: 'output',
      text: [
        'Major Projects:',
        ...lines,
        `\nGitHub: https://github.com/${githubService.getHtmlUser()}`,
      ].join('\n')
    });
  } catch (e) {
    logger.error('Error fetching GitHub repositories:', e);
    onOutput({ type: 'output', text: `GitHub: https://github.com/${githubService.getHtmlUser()}` });
  }
};

