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

  async getUser(): Promise<GitHubUser> {
    const url = `https://api.github.com/users/${this.apiUser}`;
    if (this.cache.has(url)) return this.cache.get(url) as GitHubUser;

    const res = await fetch(url);
    const data = await res.json() as GitHubUser;
    this.cache.set(url, data);
    return data;
  }

  async getTopRepos(limit: number = 6): Promise<GitHubRepo[]> {
    const url = `https://api.github.com/users/${this.apiUser}/repos?per_page=12&sort=updated`;
    if (this.cache.has(url)) return this.cache.get(url) as GitHubRepo[];

    const res = await fetch(url);
    const repos = await res.json() as GitHubRepo[] | unknown;

    if (!Array.isArray(repos)) {
      return [];
    }

    const top = repos
      .filter((r): r is GitHubRepo => typeof r === 'object' && r !== null && !('fork' in r) || !r.fork)
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
