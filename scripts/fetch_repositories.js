const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const settingsPath = path.join(rootDir, 'config', 'settings.json');
const projectsConfigPath = path.join(rootDir, 'config', 'projects.json');
const generatedDir = path.join(rootDir, 'generated');
const outputPath = path.join(generatedDir, 'repositories.json');

if (!fs.existsSync(generatedDir)) {
  fs.mkdirSync(generatedDir, { recursive: true });
}

const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
const username = settings.github_username || 'soham-arch';

let projectsConfig = { featured: [], excluded: [], custom_descriptions: {} };
if (fs.existsSync(projectsConfigPath)) {
  try {
    projectsConfig = JSON.parse(fs.readFileSync(projectsConfigPath, 'utf8'));
  } catch (e) {
    console.warn('Warning: Could not parse config/projects.json, using defaults.');
  }
}

function getAuthToken() {
  if (process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN.trim().length > 0) {
    return process.env.GITHUB_TOKEN.trim();
  }
  // If running locally, check if GitHub CLI is authenticated
  try {
    const token = execSync('gh auth token', { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
    if (token && token.length > 0) {
      return token;
    }
  } catch (_) {
    // gh not available or not logged in
  }
  return null;
}

function fetchPage(username, page, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/users/${username}/repos?per_page=100&page=${page}&sort=pushed&direction=desc`,
      method: 'GET',
      headers: {
        'User-Agent': 'soham-arch-portfolio-fetcher',
        'Accept': 'application/vnd.github.v3+json'
      }
    };
    if (token) {
      options.headers['Authorization'] = `token ${token}`;
    }

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(new Error(`Failed to parse response: ${e.message}`));
          }
        } else if (res.statusCode === 403) {
          reject(new Error(`GitHub API rate limit exceeded (HTTP 403)`));
        } else {
          reject(new Error(`GitHub API returned HTTP ${res.statusCode}: ${body.slice(0, 100)}`));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function fetchAllRepos(username, token) {
  let allRepos = [];
  let page = 1;
  while (true) {
    const repos = await fetchPage(username, page, token);
    if (!Array.isArray(repos) || repos.length === 0) break;
    allRepos = allRepos.concat(repos);
    if (repos.length < 100) break;
    page++;
  }
  return allRepos;
}

function normalizeRepo(raw) {
  const customDesc = projectsConfig.custom_descriptions && projectsConfig.custom_descriptions[raw.name];
  const finalDesc = raw.description && raw.description.trim().length > 0
    ? raw.description.trim()
    : (customDesc || 'No repository description provided.');

  return {
    name: raw.name,
    full_name: raw.full_name,
    html_url: raw.html_url,
    description: finalDesc,
    language: raw.language || 'Plain Text',
    topics: Array.isArray(raw.topics) ? raw.topics : [],
    stars: raw.stargazers_count || 0,
    forks: raw.forks_count || 0,
    fork: Boolean(raw.fork),
    archived: Boolean(raw.archived),
    pushed_at: raw.pushed_at || raw.updated_at,
    updated_at: raw.updated_at,
    created_at: raw.created_at,
    default_branch: raw.default_branch || 'main'
  };
}

async function main() {
  console.log(`[Repository Discovery] Discovering repositories for user: ${username}...`);
  const token = getAuthToken();
  if (token) {
    console.log('[Repository Discovery] Authenticated request token detected.');
  } else {
    console.log('[Repository Discovery] No token detected. Running unauthenticated request (rate-limits may apply).');
  }

  let rawRepos = [];
  try {
    rawRepos = await fetchAllRepos(username, token);
    console.log(`[Repository Discovery] Successfully retrieved ${rawRepos.length} public repositories from GitHub API.`);
  } catch (err) {
    console.warn(`[Repository Discovery] Warning: Live fetch failed: ${err.message}`);
    // Check if we have an existing generated cache to preserve
    if (fs.existsSync(outputPath)) {
      console.log('[Repository Discovery] Preserving cached repositories.json fallback.');
      return;
    } else {
      throw err;
    }
  }

  const normalized = rawRepos.map(normalizeRepo);
  const excludedSet = new Set((projectsConfig.excluded || []).map(s => s.toLowerCase()));
  const eligibleRepos = normalized.filter(r => !excludedSet.has(r.name.toLowerCase()));

  // Curate Featured projects
  const featuredNames = projectsConfig.featured || [];
  const featuredMap = new Map(eligibleRepos.map(r => [r.name.toLowerCase(), r]));
  let featured = [];

  for (const name of featuredNames) {
    const repo = featuredMap.get(name.toLowerCase());
    if (repo) {
      featured.push(repo);
    }
  }

  // If featured is empty or has fewer than 3, auto-fill with best public non-fork repos
  if (featured.length < 3) {
    const featuredNamesSet = new Set(featured.map(r => r.name.toLowerCase()));
    const candidates = eligibleRepos
      .filter(r => !r.fork && !r.archived && !featuredNamesSet.has(r.name.toLowerCase()))
      .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));

    for (const cand of candidates) {
      if (featured.length >= 3) break;
      featured.push(cand);
      featuredNamesSet.add(cand.name.toLowerCase());
    }
  }

  const featuredNamesSet = new Set(featured.map(r => r.name.toLowerCase()));
  const recent = eligibleRepos
    .filter(r => !featuredNamesSet.has(r.name.toLowerCase()))
    .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));

  const dataset = {
    updated_at: new Date().toISOString(),
    username,
    total_public: rawRepos.length,
    featured,
    recent,
    all: eligibleRepos
  };

  fs.writeFileSync(outputPath, JSON.stringify(dataset, null, 2), 'utf8');
  console.log(`[Repository Discovery] Saved ${featured.length} featured & ${recent.length} recent repositories to ${outputPath}`);
}

main().catch(err => {
  console.error('[Repository Discovery] Fatal error:', err);
  process.exit(1);
});
