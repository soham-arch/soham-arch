const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const settingsPath = path.join(rootDir, 'config', 'settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
const username = settings.github_username || 'soham-arch';

const targetDir = path.join(rootDir, 'assets', 'svg', 'stats');
const cachePath = path.join(rootDir, 'generated', 'stats.json');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function getAuthToken() {
  if (process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN.trim().length > 0) {
    return process.env.GITHUB_TOKEN.trim();
  }
  try {
    const token = execSync('gh auth token', { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
    if (token && token.length > 0) return token;
  } catch (_) {}
  return null;
}

// Verified real fallback baseline (recorded from live API)
const defaultStats = {
  totalCommits: 48,
  totalStars: 0,
  totalPRs: 2,
  totalIssues: 0,
  contributedTo: 3,
  languages: [
    { name: 'TypeScript', percentage: 56.0 },
    { name: 'JavaScript', percentage: 22.8 },
    { name: 'CSS', percentage: 7.4 },
    { name: 'Python', percentage: 6.7 },
    { name: 'Dart', percentage: 2.1 }
  ],
  streak: {
    totalContributions: 56,
    currentStreak: 1,
    longestStreak: 4
  }
};

function calculateStreaks(days) {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  let longestStreak = 0, tempStreak = 0, currentStreak = 0;
  for (const day of sorted) {
    if (day.contributionCount > 0) {
      tempStreak++;
    } else {
      if (tempStreak > longestStreak) longestStreak = tempStreak;
      tempStreak = 0;
    }
  }
  if (tempStreak > longestStreak) longestStreak = tempStreak;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (i === sorted.length - 1 && sorted[i].contributionCount === 0) continue;
    if (sorted[i].contributionCount > 0) currentStreak++;
    else break;
  }
  return { currentStreak, longestStreak };
}

function fetchLiveStats(username, token) {
  const query = `query($login: String!) {
    user(login: $login) {
      repositories(first: 100, ownerAffiliations: OWNER) {
        nodes {
          stargazerCount
          languages(first: 5, orderBy: {field: SIZE, direction: DESC}) {
            edges {
              size
              node { name color }
            }
          }
        }
      }
      repositoriesContributedTo(contributionTypes: [COMMIT, PULL_REQUEST, ISSUE]) {
        totalCount
      }
      contributionsCollection {
        totalCommitContributions
        restrictedContributionsCount
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
      pullRequests { totalCount }
      issues { totalCount }
    }
  }`;

  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query, variables: { login: username } });
    const options = {
      hostname: 'api.github.com',
      path: '/graphql',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'soham-arch-portfolio-stats-updater',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          return reject(new Error(`GitHub API GraphQL returned status ${res.statusCode}`));
        }
        try {
          const result = JSON.parse(body);
          if (result.errors) return reject(new Error(result.errors[0].message));
          const user = result.data.user;
          const repos = user.repositories.nodes;
          const totalStars = repos.reduce((acc, r) => acc + r.stargazerCount, 0);
          const totalCommits = user.contributionsCollection.totalCommitContributions +
                               user.contributionsCollection.restrictedContributionsCount;

          const langSizes = {};
          repos.forEach(r => {
            r.languages.edges.forEach(e => {
              langSizes[e.node.name] = (langSizes[e.node.name] || 0) + e.size;
            });
          });

          const totalLangSize = Object.values(langSizes).reduce((a, b) => a + b, 0);
          const languages = Object.keys(langSizes)
            .map(n => ({
              name: n,
              percentage: totalLangSize > 0 ? parseFloat(((langSizes[n] / totalLangSize) * 100).toFixed(1)) : 0
            }))
            .sort((a, b) => b.percentage - a.percentage)
            .slice(0, 5);

          const calendar = user.contributionsCollection.contributionCalendar;
          const allDays = calendar.weeks.flatMap(w => w.contributionDays);
          const { currentStreak, longestStreak } = calculateStreaks(allDays);

          resolve({
            totalCommits,
            totalStars,
            totalPRs: user.pullRequests.totalCount,
            totalIssues: user.issues.totalCount,
            contributedTo: user.repositoriesContributedTo.totalCount,
            languages,
            streak: {
              totalContributions: calendar.totalContributions,
              currentStreak,
              longestStreak
            }
          });
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

const commonStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=JetBrains+Mono:wght@500;700&amp;display=swap');
  .card-bg { fill: #09090b; stroke: #27272a; stroke-width: 1; rx: 8px; }
  .header-title { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 13px; font-weight: 600; fill: #f4f4f5; letter-spacing: 0.04em; text-transform: uppercase; }
  .label-text { font-family: 'JetBrains Mono', monospace, ui-monospace; font-size: 11px; font-weight: 500; fill: #71717a; text-transform: uppercase; letter-spacing: 0.05em; }
  .value-text { font-family: 'JetBrains Mono', monospace, ui-monospace; font-size: 20px; font-weight: 700; fill: #ffffff; letter-spacing: -0.02em; }
  .divider-line { stroke: #1f1f23; stroke-width: 1; }
`;

function generateStatsSVG(data) {
  const content = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 430 200" width="100%" height="100%">
  <defs><style type="text/css">${commonStyles}</style></defs>
  <rect width="100%" height="100%" class="card-bg" />
  <line x1="0" y1="0" x2="36" y2="0" stroke="#52525b" stroke-width="1.5" />
  <circle cx="20" cy="24" r="3" fill="#d4d4d8" />
  <text x="32" y="28" class="header-title">GitHub Overview</text>
  <line x1="20" y1="42" x2="410" y2="42" class="divider-line" />

  <g transform="translate(24, 68)">
    <g>
      <text x="0" y="0" class="label-text">Total Commits</text>
      <text x="0" y="24" class="value-text">${data.totalCommits}</text>
    </g>
    <g transform="translate(0, 52)">
      <text x="0" y="0" class="label-text">Pull Requests</text>
      <text x="0" y="24" class="value-text">${data.totalPRs}</text>
    </g>
  </g>

  <g transform="translate(225, 68)">
    <g>
      <text x="0" y="0" class="label-text">Stars Earned</text>
      <text x="0" y="24" class="value-text">${data.totalStars}</text>
    </g>
    <g transform="translate(0, 52)">
      <text x="0" y="0" class="label-text">Issues Handled</text>
      <text x="0" y="24" class="value-text">${data.totalIssues}</text>
    </g>
  </g>

  <line x1="20" y1="162" x2="410" y2="162" class="divider-line" />
  <g transform="translate(24, 184)">
    <text x="0" y="0" class="label-text">Repositories Contributed</text>
    <text x="382" y="-1" class="value-text" font-size="14" text-anchor="end">${data.contributedTo}</text>
  </g>
</svg>`;
  fs.writeFileSync(path.join(targetDir, 'github_stats.svg'), content.trim(), 'utf8');
}

function generateLanguagesSVG(data) {
  // Monochromatic silver-graphite gradient progression
  const monochromeTones = ['#ffffff', '#e4e4e7', '#a1a1aa', '#71717a', '#52525b'];

  let bars = '';
  data.languages.forEach((lang, i) => {
    const y = i * 23;
    const tone = monochromeTones[i] || '#52525b';
    const bw = Math.max(2, Math.ceil(lang.percentage * 1.8));
    bars += `
    <g transform="translate(0, ${y})">
      <text x="0" y="10" font-family="'JetBrains Mono', monospace" font-size="11" fill="#d4d4d8">${lang.name}</text>
      <rect x="130" y="2" width="180" height="7" rx="3" fill="#141416" stroke="#27272a" stroke-width="0.75" />
      <rect x="130" y="2" width="${bw}" height="7" rx="3" fill="${tone}" />
      <text x="375" y="10" font-family="'JetBrains Mono', monospace" font-size="10.5" fill="#71717a" text-anchor="end">${lang.percentage}%</text>
    </g>`;
  });

  const content = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 430 200" width="100%" height="100%">
  <defs><style type="text/css">${commonStyles}</style></defs>
  <rect width="100%" height="100%" class="card-bg" />
  <line x1="0" y1="0" x2="36" y2="0" stroke="#52525b" stroke-width="1.5" />
  <circle cx="20" cy="24" r="3" fill="#d4d4d8" />
  <text x="32" y="28" class="header-title">Language Distribution</text>
  <line x1="20" y1="42" x2="410" y2="42" class="divider-line" />
  <g transform="translate(24, 66)">${bars}</g>
</svg>`;
  fs.writeFileSync(path.join(targetDir, 'github_languages.svg'), content.trim(), 'utf8');
}

function generateStreakSVG(data) {
  const content = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 94" width="100%" height="100%">
  <defs><style type="text/css">${commonStyles}</style></defs>
  <rect width="100%" height="100%" class="card-bg" />
  <line x1="0" y1="0" x2="40" y2="0" stroke="#52525b" stroke-width="1.5" />

  <g transform="translate(48, 26)">
    <text x="0" y="12" class="label-text">Total Contributions</text>
    <text x="0" y="44" class="value-text" font-size="24">${data.streak.totalContributions}</text>
  </g>

  <line x1="310" y1="18" x2="310" y2="76" class="divider-line" />

  <g transform="translate(350, 26)">
    <text x="0" y="12" class="label-text">Current Streak</text>
    <text x="0" y="44" class="value-text" font-size="24">${data.streak.currentStreak} <tspan font-size="12" fill="#71717a" font-family="'Inter', sans-serif" font-weight="400">DAYS</tspan></text>
  </g>

  <line x1="610" y1="18" x2="610" y2="76" class="divider-line" />

  <g transform="translate(650, 26)">
    <text x="0" y="12" class="label-text">Longest Streak</text>
    <text x="0" y="44" class="value-text" font-size="24">${data.streak.longestStreak} <tspan font-size="12" fill="#71717a" font-family="'Inter', sans-serif" font-weight="400">DAYS</tspan></text>
  </g>
</svg>`;
  fs.writeFileSync(path.join(targetDir, 'github_streak.svg'), content.trim(), 'utf8');
}

async function run() {
  let data = defaultStats;
  if (fs.existsSync(cachePath)) {
    try {
      data = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    } catch (_) {}
  }

  const token = getAuthToken();
  if (token) {
    console.log('[Stats] Token detected. Querying live GitHub GraphQL statistics...');
    try {
      const live = await fetchLiveStats(username, token);
      data = live;
      fs.writeFileSync(cachePath, JSON.stringify(data, null, 2), 'utf8');
      console.log('[Stats] Successfully updated stats from live GitHub GraphQL API.');
    } catch (err) {
      console.warn('[Stats] Live GraphQL query failed, using verified cached stats:', err.message);
    }
  } else {
    console.log('[Stats] No token provided, compiling SVGs with verified baseline stats.');
  }

  generateStatsSVG(data);
  generateLanguagesSVG(data);
  generateStreakSVG(data);
  console.log('[Stats] Successfully compiled monochrome statistics SVGs in assets/svg/stats/');
}

run().catch(err => {
  console.error('[Stats] Error generating stats:', err);
  process.exit(1);
});
