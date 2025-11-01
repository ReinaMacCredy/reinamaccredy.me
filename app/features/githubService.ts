/**
 * GitHub API service for fetching user and repository data
 */

import type { GitHubUser, GitHubRepo } from '../types/terminal';

export class GitHubService {
  private cache = new Map<string, unknown>();
  private readonly apiUser: string;
  private readonly htmlUser: string;

  constructor(apiUser: string, htmlUser: string) {
    this.apiUser = apiUser;
    this.htmlUser = htmlUser;
  }

  private isGitHubUser(data: unknown): data is GitHubUser {
    return (
      typeof data === 'object' &&
      data !== null &&
      (typeof (data as GitHubUser).avatar_url === 'string' || (data as GitHubUser).avatar_url === undefined) &&
      (typeof (data as GitHubUser).name === 'string' || (data as GitHubUser).name === undefined) &&
      (typeof (data as GitHubUser).followers === 'number' || (data as GitHubUser).followers === undefined) &&
      (typeof (data as GitHubUser).following === 'number' || (data as GitHubUser).following === undefined)
    );
  }

  async getUser(): Promise<GitHubUser> {
    const url = `https://api.github.com/users/${this.apiUser}`;
    if (this.cache.has(url)) {
      const cached = this.cache.get(url);
      if (this.isGitHubUser(cached)) return cached;
    }

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
    }
    const data = await res.json() as unknown;
    if (!this.isGitHubUser(data)) {
      throw new Error('Invalid GitHub user data format');
    }
    this.cache.set(url, data);
    return data;
  }

  private isGitHubRepo(data: unknown): data is GitHubRepo {
    return (
      typeof data === 'object' &&
      data !== null &&
      (typeof (data as GitHubRepo).name === 'string' || (data as GitHubRepo).name === undefined) &&
      (typeof (data as GitHubRepo).html_url === 'string' || (data as GitHubRepo).html_url === undefined) &&
      (typeof (data as GitHubRepo).fork === 'boolean' || (data as GitHubRepo).fork === undefined) &&
      (typeof (data as GitHubRepo).stargazers_count === 'number' || (data as GitHubRepo).stargazers_count === undefined) &&
      (typeof (data as GitHubRepo).forks_count === 'number' || (data as GitHubRepo).forks_count === undefined)
    );
  }

  async getTopRepos(limit: number = 6): Promise<GitHubRepo[]> {
    const url = `https://api.github.com/users/${this.apiUser}/repos?per_page=12&sort=updated`;
    if (this.cache.has(url)) {
      const cached = this.cache.get(url);
      if (Array.isArray(cached) && cached.every(r => this.isGitHubRepo(r))) {
        return cached as GitHubRepo[];
      }
    }

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
    }
    const repos = await res.json() as unknown;

    if (!Array.isArray(repos)) {
      return [];
    }

    const validatedRepos = repos.filter((r): r is GitHubRepo => this.isGitHubRepo(r));
    const top = validatedRepos
      .filter((r) => !r.fork)
      .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
      .slice(0, limit);

    this.cache.set(url, top);
    return top;
  }

  getHtmlUser(): string {
    return this.htmlUser;
  }

  getApiUser(): string {
    return this.apiUser;
  }
}
