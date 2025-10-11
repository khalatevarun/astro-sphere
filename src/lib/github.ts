import { marked } from 'marked';

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