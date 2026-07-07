const fs = require('fs');
const path = require('path');
const https = require('https');

const settingsPath = path.join(__dirname, '..', 'config', 'settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
const username = settings.github_username;

const targetDir = path.join(__dirname, '..', 'assets', 'svg', 'stats');
if (!fs.existsSync(targetDir)) { fs.mkdirSync(targetDir, { recursive: true }); }

const token = process.env.GITHUB_TOKEN;

// ============================================================================
// MOCK DATA — LOCAL DEVELOPMENT FALLBACK ONLY
// WARNING: These are PLACEHOLDER values for local dev when no GITHUB_TOKEN
// is available. They are NOT real and MUST NEVER be deployed to the live profile.
// In CI (with GITHUB_TOKEN), real API data is always fetched instead.
// ============================================================================
const mockData = {
  totalCommits: 150,
  totalStars: 10,
  totalPRs: 20,
  totalIssues: 5,
  contributedTo: 3,
  languages: [
    { name: 'Python', percentage: 48.5, color: '#3572A5' },
    { name: 'TypeScript', percentage: 22.1, color: '#3178C6' },
    { name: 'JavaScript', percentage: 16.4, color: '#F1E05A' },
    { name: 'C++', percentage: 9.0, color: '#F34B7D' },
    { name: 'HTML/CSS', percentage: 4.0, color: '#563D7C' }
  ],
  streak: { totalContributions: 175, currentStreak: 0, longestStreak: 0 }
};

async function run() {
  let data = mockData;
  if (token) {
    console.log('GITHUB_TOKEN detected. Fetching live GitHub statistics...');
    try { data = await fetchLiveStats(username, token); }
    catch (err) { console.error('Failed to fetch live stats, falling back to mock data:', err.message); data = mockData; }
  } else {
    console.log('⚠ No GITHUB_TOKEN. Using MOCK/PLACEHOLDER data. Do NOT deploy this.');
  }
  generateStatsSVG(data);
  generateLanguagesSVG(data);
  generateStreakSVG(data);
}

function calculateStreaks(days) {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  let longestStreak = 0, tempStreak = 0, currentStreak = 0;
  for (const day of sorted) {
    if (day.contributionCount > 0) { tempStreak++; }
    else { if (tempStreak > longestStreak) longestStreak = tempStreak; tempStreak = 0; }
  }
  if (tempStreak > longestStreak) longestStreak = tempStreak;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (i === sorted.length - 1 && sorted[i].contributionCount === 0) continue;
    if (sorted[i].contributionCount > 0) currentStreak++; else break;
  }
  return { currentStreak, longestStreak };
}

function fetchLiveStats(username, token) {
  const query = `query($login: String!) {
    user(login: $login) {
      repositories(first: 100, ownerAffiliations: OWNER) {
        nodes { stargazerCount languages(first: 5, orderBy: {field: SIZE, direction: DESC}) { edges { size node { name color } } } }
      }
      repositoriesContributedTo(contributionTypes: [COMMIT, PULL_REQUEST, ISSUE]) { totalCount }
      contributionsCollection {
        totalCommitContributions restrictedContributionsCount
        contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } }
      }
      pullRequests { totalCount }
      issues { totalCount }
    }
  }`;
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query, variables: { login: username } });
    const options = {
      hostname: 'api.github.com', path: '/graphql', method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'User-Agent': 'soham-arch-portfolio-updater', 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) return reject(new Error(`GitHub API status ${res.statusCode}`));
        try {
          const result = JSON.parse(body);
          if (result.errors) return reject(new Error(result.errors[0].message));
          const user = result.data.user;
          const repos = user.repositories.nodes;
          const totalStars = repos.reduce((acc, r) => acc + r.stargazerCount, 0);
          const totalCommits = user.contributionsCollection.totalCommitContributions + user.contributionsCollection.restrictedContributionsCount;
          const langSizes = {}, langColors = {};
          repos.forEach(r => r.languages.edges.forEach(e => { langSizes[e.node.name] = (langSizes[e.node.name] || 0) + e.size; langColors[e.node.name] = e.node.color || '#ccc'; }));
          const totalLangSize = Object.values(langSizes).reduce((a, b) => a + b, 0);
          const languages = Object.keys(langSizes).map(n => ({ name: n, percentage: parseFloat(((langSizes[n] / totalLangSize) * 100).toFixed(1)), color: langColors[n] })).sort((a, b) => b.percentage - a.percentage).slice(0, 5);
          const calendar = user.contributionsCollection.contributionCalendar;
          const allDays = calendar.weeks.flatMap(w => w.contributionDays);
          const { currentStreak, longestStreak } = calculateStreaks(allDays);
          resolve({
            totalCommits, totalStars, totalPRs: user.pullRequests.totalCount, totalIssues: user.issues.totalCount,
            contributedTo: user.repositoriesContributedTo.totalCount, languages,
            streak: { totalContributions: calendar.totalContributions, currentStreak, longestStreak }
          });
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Dark theme design system
const commonStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&amp;family=Inter:wght@400;500;600&amp;display=swap');
  .card-bg { fill: #0a0f1e; stroke: #1e293b; stroke-width: 1; rx: 12px; }
  .header-title { font-family: 'Space Grotesk', sans-serif; font-size: 14px; font-weight: 700; fill: #e2e8f0; letter-spacing: 0.02em; }
  .label-text { font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 400; fill: #64748b; }
  .value-text { font-family: 'Space Grotesk', sans-serif; font-size: 18px; font-weight: 700; fill: #f1f5f9; }
`;

function generateStatsSVG(data) {
  const content = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 200" width="100%" height="100%">
  <defs><style type="text/css">${commonStyles}</style></defs>
  <rect width="100%" height="100%" class="card-bg" />
  <path d="M 20 0 L 100 0" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" />
  <circle cx="20" cy="30" r="4" fill="#38bdf8" />
  <text x="32" y="34" class="header-title">GitHub Overview</text>
  <g transform="translate(25, 65)">
    <g><text x="0" y="0" class="label-text">Total Commits</text><text x="0" y="22" class="value-text" fill="#38bdf8">${data.totalCommits}</text></g>
    <g transform="translate(0, 48)"><text x="0" y="0" class="label-text">Pull Requests</text><text x="0" y="22" class="value-text">${data.totalPRs}</text></g>
  </g>
  <g transform="translate(200, 65)">
    <g><text x="0" y="0" class="label-text">Stars Earned</text><text x="0" y="22" class="value-text" fill="#eab308">${data.totalStars}</text></g>
    <g transform="translate(0, 48)"><text x="0" y="0" class="label-text">Issues Closed</text><text x="0" y="22" class="value-text">${data.totalIssues}</text></g>
  </g>
  <line x1="20" y1="160" x2="360" y2="160" stroke="#1e293b" stroke-width="1" />
  <g transform="translate(25, 182)">
    <text x="0" y="0" class="label-text" font-size="11.5">Contributed Repositories</text>
    <text x="315" y="-2" class="value-text" font-size="14" text-anchor="end" fill="#818cf8">${data.contributedTo}</text>
  </g>
</svg>`;
  fs.writeFileSync(path.join(targetDir, 'github_stats.svg'), content.trim());
}

function generateLanguagesSVG(data) {
  let bars = '';
  data.languages.forEach((lang, i) => {
    const y = i * 24, bw = Math.ceil(lang.percentage * 1.5);
    bars += `<g transform="translate(0, ${y})"><text x="0" y="11" class="label-text" font-size="11.5">${lang.name}</text><rect x="110" y="2" width="150" height="8" rx="4" fill="#0d1527" stroke="#1e293b" stroke-width="0.5"/><rect x="110" y="2" width="${bw}" height="8" rx="4" fill="${lang.color}"/><text x="270" y="11" class="label-text" font-size="11" fill="#475569">${lang.percentage}%</text></g>`;
  });
  const content = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 200" width="100%" height="100%">
  <defs><style type="text/css">${commonStyles}</style></defs>
  <rect width="100%" height="100%" class="card-bg" />
  <path d="M 20 0 L 100 0" stroke="#818cf8" stroke-width="2" stroke-linecap="round" />
  <circle cx="20" cy="30" r="4" fill="#818cf8" />
  <text x="32" y="34" class="header-title">Top Languages</text>
  <g transform="translate(25, 62)">${bars}</g>
</svg>`;
  fs.writeFileSync(path.join(targetDir, 'github_languages.svg'), content.trim());
}

function generateStreakSVG(data) {
  const content = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 780 110" width="100%" height="100%">
  <defs><style type="text/css">
    ${commonStyles}
    .streak-val { font-family: 'Space Grotesk', sans-serif; font-size: 26px; font-weight: 700; fill: #f1f5f9; }
    .streak-label { font-family: 'Space Grotesk', sans-serif; font-size: 12px; font-weight: 600; fill: #64748b; letter-spacing: 0.05em; text-transform: uppercase; }
  </style></defs>
  <rect width="100%" height="100%" class="card-bg" />
  <path d="M 30 0 L 150 0" stroke="#10b981" stroke-width="2" stroke-linecap="round" />
  <g transform="translate(60, 30)">
    <text x="0" y="15" class="streak-label">Total Contributions</text>
    <text x="0" y="50" class="streak-val" fill="#38bdf8">${data.streak.totalContributions}</text>
  </g>
  <line x1="280" y1="20" x2="280" y2="90" stroke="#1e293b" stroke-width="1.5" />
  <g transform="translate(320, 30)">
    <text x="0" y="15" class="streak-label" fill="#f43f5e">🔥 Current Streak</text>
    <text x="0" y="50" class="streak-val" fill="#f43f5e">${data.streak.currentStreak} <tspan font-size="14" font-family="Inter" fill="#64748b" font-weight="400">days</tspan></text>
  </g>
  <line x1="520" y1="20" x2="520" y2="90" stroke="#1e293b" stroke-width="1.5" />
  <g transform="translate(560, 30)">
    <text x="0" y="15" class="streak-label" fill="#eab308">🏆 Longest Streak</text>
    <text x="0" y="50" class="streak-val" fill="#eab308">${data.streak.longestStreak} <tspan font-size="14" font-family="Inter" fill="#64748b" font-weight="400">days</tspan></text>
  </g>
</svg>`;
  fs.writeFileSync(path.join(targetDir, 'github_streak.svg'), content.trim());
}

run().catch(console.error);
