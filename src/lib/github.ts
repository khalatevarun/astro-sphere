import { marked } from 'marked';

export interface GitHubActivityItem {
  id: string;
  type: string;
  description: string;
  detail: string;
  eventUrl: string;
  date: Date;
}

export interface GitHubRepoActivity {
  repo: string;
  repoUrl: string;
  items: GitHubActivityItem[];
}

const EVENT_TYPES = ['PushEvent', 'PullRequestEvent', 'IssuesEvent', 'CreateEvent', 'ForkEvent'] as const;
const MAX_ITEMS_PER_REPO = 5;

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max).trimEnd() + '...' : str;
}

interface EventDescription {
  description: string;
  detail: string;
  eventUrl: string;
}

// Enriches a push event — fetches commit messages from the compare API when inline data is missing
async function describePush(event: any, repoUrl: string, headers: Record<string, string>): Promise<EventDescription> {
  const commits = event.payload.commits ?? [];
  const sha = event.payload.head;
  const before = event.payload.before;
  const branch = event.payload.ref?.replace('refs/heads/', '') ?? '';
  const repoName = event.repo.name;

  // Try inline commit messages first
  let messages = commits
    .filter((c: any) => c.message)
    .map((c: any) => c.message.split('\n')[0])
    .slice(0, 3);

  // If inline data is empty, fetch from compare API
  let count = event.payload.size ?? commits.length;
  if (messages.length === 0 && sha && before) {
    try {
      const res = await fetch(
        `https://api.github.com/repos/${repoName}/compare/${before.slice(0, 7)}...${sha.slice(0, 7)}`,
        { headers },
      );
      if (res.ok) {
        const data = await res.json();
        count = data.total_commits ?? count;
        messages = (data.commits ?? [])
          .map((c: any) => c.commit?.message?.split('\n')[0])
          .filter(Boolean)
          .slice(0, 3);
      }
    } catch { /* fall through */ }
  }

  const detail = messages.length
    ? messages.map((m: string) => truncate(m, 80)).join(' · ')
    : '';
  const description = count > 0
    ? `Pushed ${count} commit${count !== 1 ? 's' : ''} to ${branch}`
    : `Pushed to ${branch}`;
  const eventUrl = sha && before
    ? `${repoUrl}/compare/${before.slice(0, 7)}...${sha.slice(0, 7)}`
    : sha ? `${repoUrl}/commit/${sha}` : repoUrl;
  return { description, detail, eventUrl };
}

function describeCreate(event: any, repoUrl: string): EventDescription {
  const refType = event.payload.ref_type;
  const ref = event.payload.ref;
  return {
    description: `Created ${refType}${ref ? ` ${ref}` : ''}`,
    detail: '',
    eventUrl: ref && refType === 'branch' ? `${repoUrl}/tree/${ref}` : repoUrl,
  };
}

function describeFork(event: any, repoUrl: string): EventDescription {
  return {
    description: `Forked repository`,
    detail: event.payload.forkee?.description ? truncate(event.payload.forkee.description, 120) : '',
    eventUrl: event.payload.forkee?.html_url ?? repoUrl,
  };
}

// Fetches real PR/issue details since the Events API often returns null for title/body
async function fetchPrOrIssueDetails(
  repoFullName: string,
  type: 'pulls' | 'issues',
  number: number,
  headers: Record<string, string>,
): Promise<{ title: string; body: string; htmlUrl: string; merged?: boolean }> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${repoFullName}/${type}/${number}`,
      { headers },
    );
    if (!res.ok) return { title: `#${number}`, body: '', htmlUrl: `https://github.com/${repoFullName}/${type}/${number}` };
    const data = await res.json();
    return {
      title: data.title ?? `#${number}`,
      body: data.body ? truncate(data.body.replace(/\r?\n/g, ' ').trim(), 120) : '',
      htmlUrl: data.html_url ?? `https://github.com/${repoFullName}/${type}/${number}`,
      merged: data.merged ?? (data.pull_request?.merged_at != null),
    };
  } catch {
    return { title: `#${number}`, body: '', htmlUrl: `https://github.com/${repoFullName}/${type}/${number}` };
  }
}

export async function fetchGitHubActivity(username: string, days = 7): Promise<GitHubRepoActivity[]> {
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'astro-portfolio',
    };

    const token = import.meta.env.GITHUB_TOKEN ?? process.env.GITHUB_TOKEN;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // With a token, use the authenticated endpoint to include private repo activity
    const eventsPath = token
      ? `https://api.github.com/users/${username}/events`
      : `https://api.github.com/users/${username}/events/public`;

    const allEvents: any[] = [];
    for (let page = 1; page <= 3; page++) {
      const res = await fetch(
        `${eventsPath}?per_page=100&page=${page}`,
        { headers }
      );
      if (!res.ok) break;
      const events = await res.json();
      if (!events.length) break;
      allEvents.push(...events);
    }

    // Filter to relevant events within the time window
    const filtered = allEvents.filter(
      (e) => EVENT_TYPES.includes(e.type) && new Date(e.created_at) >= cutoff,
    );

    // Dedupe PR/issue events — only keep the latest action per PR/issue number
    const prIssueSeen = new Set<string>();
    const deduped = filtered.filter((e) => {
      if (e.type === 'PullRequestEvent') {
        const key = `pr:${e.repo.name}:${e.payload.pull_request?.number}`;
        if (prIssueSeen.has(key)) return false;
        prIssueSeen.add(key);
        return true;
      }
      if (e.type === 'IssuesEvent') {
        const key = `issue:${e.repo.name}:${e.payload.issue?.number}`;
        if (prIssueSeen.has(key)) return false;
        prIssueSeen.add(key);
        return true;
      }
      return true;
    });

    // Batch-fetch PR and issue details (the Events API often returns null for titles)
    const enrichPromises: Promise<{ event: any; desc: EventDescription }>[] = deduped.map(async (e) => {
      const repoName = e.repo.name;
      const repoUrl = `https://github.com/${repoName}`;

      if (e.type === 'PushEvent') {
        return { event: e, desc: await describePush(e, repoUrl, headers) };
      }
      if (e.type === 'CreateEvent') {
        return { event: e, desc: describeCreate(e, repoUrl) };
      }
      if (e.type === 'ForkEvent') {
        return { event: e, desc: describeFork(e, repoUrl) };
      }
      if (e.type === 'PullRequestEvent') {
        const pr = e.payload.pull_request;
        const number = pr?.number;
        if (!number) return { event: e, desc: { description: 'PR activity', detail: '', eventUrl: repoUrl } };
        const details = await fetchPrOrIssueDetails(repoName, 'pulls', number, headers);
        const action = e.payload.action;
        const actionLabel = action === 'closed' && details.merged
          ? 'Merged'
          : action.charAt(0).toUpperCase() + action.slice(1);
        return {
          event: e,
          desc: {
            description: `${actionLabel} PR #${number}: ${details.title}`,
            detail: details.body,
            eventUrl: details.htmlUrl,
          },
        };
      }
      if (e.type === 'IssuesEvent') {
        const issue = e.payload.issue;
        const number = issue?.number;
        if (!number) return { event: e, desc: { description: 'Issue activity', detail: '', eventUrl: repoUrl } };
        const details = await fetchPrOrIssueDetails(repoName, 'issues', number, headers);
        const action = e.payload.action;
        return {
          event: e,
          desc: {
            description: `${action.charAt(0).toUpperCase() + action.slice(1)} issue #${number}: ${details.title}`,
            detail: details.body,
            eventUrl: details.htmlUrl,
          },
        };
      }
      return { event: e, desc: { description: e.type, detail: '', eventUrl: repoUrl } };
    });

    const enriched = await Promise.all(enrichPromises);

    // Group by repo, capped at MAX_ITEMS_PER_REPO each
    const repoMap = new Map<string, { repoUrl: string; items: GitHubActivityItem[] }>();

    for (const { event: e, desc } of enriched) {
      const repoName = e.repo.name;
      if (!repoMap.has(repoName)) {
        repoMap.set(repoName, {
          repoUrl: `https://github.com/${repoName}`,
          items: [],
        });
      }

      const group = repoMap.get(repoName)!;
      if (group.items.length >= MAX_ITEMS_PER_REPO) continue;

      group.items.push({
        id: e.id,
        type: e.type.replace('Event', ''),
        description: desc.description,
        detail: desc.detail,
        eventUrl: desc.eventUrl,
        date: new Date(e.created_at),
      });
    }

    // Sort repos by most recent activity
    return Array.from(repoMap.entries())
      .map(([repo, data]) => ({ repo, ...data }))
      .sort((a, b) => b.items[0].date.getTime() - a.items[0].date.getTime());
  } catch (error) {
    console.error('Error fetching GitHub activity:', error);
    return [];
  }
}

export async function fetchGitHubReadme(repoUrl: string): Promise<string | null> {
  try {
    // Extract owner and repo from GitHub URL
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return null;
    
    const [, owner, repo] = match;
    const cleanRepo = repo.replace('.git', '');
    
    // Fetch README from GitHub API
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${cleanRepo}/readme`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3.raw',
          'User-Agent': 'astro-portfolio'
        }
      }
    );
    
    if (!response.ok) {
      console.warn(`Failed to fetch README for ${owner}/${cleanRepo}:`, response.status);
      return null;
    }
    
    const readmeContent = await response.text();
    
    // Remove the first H1 title since we'll use the project title
    const contentWithoutTitle = readmeContent.replace(/^#\s+.*$/m, '').trim();
    
    // Fix relative image URLs to absolute GitHub URLs
    const contentWithFixedImages = fixImageUrls(contentWithoutTitle, owner, cleanRepo);
    
    // Convert markdown to HTML - marked.parse is synchronous in newer versions
    const htmlContent = marked.parse(contentWithFixedImages);
    
    // Handle both sync and async returns
    return typeof htmlContent === 'string' ? htmlContent : await htmlContent;
  } catch (error) {
    console.error('Error fetching README:', error);
    return null;
  }
}

function fixImageUrls(content: string, owner: string, repo: string): string {
  // GitHub raw content base URL
  const baseUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main`;
  
  // Replace relative image paths with absolute GitHub URLs
  return content
    // Fix markdown image syntax: ![alt](./path/image.jpg) or ![alt](path/image.jpg)
    .replace(/!\[([^\]]*)\]\((?!https?:\/\/)([^)]+)\)/g, (match, alt, path) => {
      // Remove leading ./ if present
      const cleanPath = path.startsWith('./') ? path.slice(2) : path;
      return `![${alt}](${baseUrl}/${cleanPath})`;
    })
    // Fix HTML img tags: <img src="./path/image.jpg"> or <img src="path/image.jpg">
    .replace(/<img([^>]*?)src=["'](?!https?:\/\/)([^"']+)["']([^>]*?)>/g, (match, before, path, after) => {
      // Remove leading ./ if present
      const cleanPath = path.startsWith('./') ? path.slice(2) : path;
      return `<img${before}src="${baseUrl}/${cleanPath}"${after}>`;
    });
}

export function extractRepoFromUrl(repoUrl: string): { owner: string; repo: string } | null {
  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) return null;
  
  const [, owner, repo] = match;
  return { owner, repo: repo.replace('.git', '') };
}