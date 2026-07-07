const fs = require('fs');
const path = require('path');
const https = require('https');

// Load settings
const settingsPath = path.join(__dirname, '..', 'config', 'settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
const username = settings.github_username;

const targetDir = path.join(__dirname, '..', 'assets', 'svg', 'stats');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Check for GITHUB_TOKEN in env
const token = process.env.GITHUB_TOKEN;

// ============================================================================
// MOCK DATA — LOCAL DEVELOPMENT FALLBACK ONLY
// ============================================================================
// WARNING: This data is PLACEHOLDER ONLY for local development when no
// GITHUB_TOKEN is available. It MUST NEVER be used on the real GitHub profile.
// When GITHUB_TOKEN is present (CI environment), real API data is fetched.
// These numbers are NOT real and are NOT intended to represent actual stats.
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
  streak: {
    totalContributions: 175,
    currentStreak: 0,
    longestStreak: 0
  }
};

// Main function
async function run() {
  let data = mockData;

  if (token) {
    console.log('GITHUB_TOKEN detected. Fetching live GitHub statistics...');
    try {
      data = await fetchLiveStats(username, token);
    } catch (err) {
      console.error('Failed to fetch live stats, falling back to mock data:', err.message);
      // ⚠ FALLBACK: Using placeholder mock data because live fetch failed.
      // This should be investigated — the profile will show mock numbers.
      data = mockData;
    }
  } else {
    console.log('⚠ No GITHUB_TOKEN environment variable found.');
    console.log('  Generating SVGs using MOCK/PLACEHOLDER data.');
    console.log('  These numbers are NOT real — do not deploy this to the live profile.');
  }

  // Generate SVGs
  generateStatsSVG(data);
  generateLanguagesSVG(data);
  generateStreakSVG(data);
}

/**
 * Calculate current streak and longest streak from a contribution calendar.
 * @param {Array<{date: string, contributionCount: number}>} days - Array of daily contributions
 * @returns {{currentStreak: number, longestStreak: number}}
 */
function calculateStreaks(days) {
  // Sort days chronologically
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));

  let longestStreak = 0;
  let currentStreak = 0;
  let tempStreak = 0;

  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].contributionCount > 0) {
      tempStreak++;
    } else {
      if (tempStreak > longestStreak) longestStreak = tempStreak;
      tempStreak = 0;
    }
  }
  // Check final run
  if (tempStreak > longestStreak) longestStreak = tempStreak;

  // Current streak: count backwards from most recent day
  currentStreak = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    // Skip today if it has 0 contributions (day might not be over yet)
    if (i === sorted.length - 1 && sorted[i].contributionCount === 0) {
      continue;
    }
    if (sorted[i].contributionCount > 0) {
      currentStreak++;
    } else {
      break;
    }
  }

  return { currentStreak, longestStreak };
}

// Fetch stats via GraphQL API
function fetchLiveStats(username, token) {
  const query = `
    query($login: String!) {
      user(login: $login) {
        repositories(first: 100, ownerAffiliations: OWNER) {
          nodes {
            stargazerCount
            languages(first: 5, orderBy: {field: SIZE, direction: DESC}) {
              edges {
                size
                node {
                  name
                  color
                }
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
        pullRequests {
          totalCount
        }
        issues {
          totalCount
        }
      }
    }
  `;

  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query, variables: { login: username } });

    const options = {
      hostname: 'api.github.com',
      path: '/graphql',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'soham-arch-portfolio-updater',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          return reject(new Error(`GitHub GraphQL API responded with status ${res.statusCode}`));
        }
        
        try {
          const result = JSON.parse(body);
          if (result.errors) {
            return reject(new Error(result.errors[0].message));
          }
          
          const user = result.data.user;
          const repos = user.repositories.nodes;
          
          // Calculate stars — real count only, no padding
          const totalStars = repos.reduce((acc, repo) => acc + repo.stargazerCount, 0);
          
          // Calculate commits — real API data only, NO artificial padding
          const publicCommits = user.contributionsCollection.totalCommitContributions;
          const privateCommits = user.contributionsCollection.restrictedContributionsCount;
          const totalCommits = publicCommits + privateCommits;

          // Calculate languages
          const langSizes = {};
          const langColors = {};
          repos.forEach(repo => {
            repo.languages.edges.forEach(edge => {
              const name = edge.node.name;
              const size = edge.size;
              langSizes[name] = (langSizes[name] || 0) + size;
              langColors[name] = edge.node.color || '#cccccc';
            });
          });

          const totalLangSize = Object.values(langSizes).reduce((a, b) => a + b, 0);
          const languages = Object.keys(langSizes).map(name => ({
            name,
            percentage: parseFloat(((langSizes[name] / totalLangSize) * 100).toFixed(1)),
            color: langColors[name]
          })).sort((a, b) => b.percentage - a.percentage).slice(0, 5);

          // Calculate streaks from real contribution calendar data
          const calendar = user.contributionsCollection.contributionCalendar;
          const allDays = calendar.weeks.flatMap(week => week.contributionDays);
          const { currentStreak, longestStreak } = calculateStreaks(allDays);

          // Real total contributions from the API
          const totalContributions = calendar.totalContributions;

          // Real contributed-to repos count from API
          const contributedTo = user.repositoriesContributedTo.totalCount;

          resolve({
            totalCommits,
            totalStars,
            totalPRs: user.pullRequests.totalCount,
            totalIssues: user.issues.totalCount,
            contributedTo,
            languages,
            streak: {
              totalContributions,
              currentStreak,
              longestStreak
            }
          });
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(postData);
    req.end();
  });
}

// Design Helper: Light theme styles — Inter + Space Grotesk
const commonStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&amp;family=Inter:wght@400;500;600&amp;display=swap');
  
  .card-bg {
    fill: #ffffff;
    stroke: #e2e8f0;
    stroke-width: 1.5;
    rx: 12px;
  }
  .header-title {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-size: 14px;
    font-weight: 700;
    fill: #0a0a0a;
    letter-spacing: 0.02em;
  }
  .label-text {
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 12px;
    font-weight: 400;
    fill: #64748b;
  }
  .value-text {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-size: 18px;
    font-weight: 700;
    fill: #0a0a0a;
  }
`;

// 1. generateStatsSVG — Light theme, no grid pattern
function generateStatsSVG(data) {
  const content = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 200" width="100%" height="100%">
  <defs>
    <style type="text/css">
      ${commonStyles}
    </style>
  </defs>

  <rect width="100%" height="100%" class="card-bg" />
  <path d="M 20 0 L 100 0" stroke="#0a0a0a" stroke-width="2" stroke-linecap="round" />

  <!-- Header -->
  <circle cx="20" cy="30" r="4" fill="#0a0a0a" />
  <text x="32" y="34" class="header-title">GitHub Overview</text>

  <!-- Left Column -->
  <g transform="translate(25, 65)">
    <!-- Commits -->
    <g transform="translate(0, 0)">
      <text x="0" y="0" class="label-text">Total Commits</text>
      <text x="0" y="22" class="value-text" fill="#0a0a0a">${data.totalCommits}</text>
    </g>
    <!-- PRs -->
    <g transform="translate(0, 48)">
      <text x="0" y="0" class="label-text">Pull Requests</text>
      <text x="0" y="22" class="value-text">${data.totalPRs}</text>
    </g>
  </g>

  <!-- Right Column -->
  <g transform="translate(200, 65)">
    <!-- Stars -->
    <g transform="translate(0, 0)">
      <text x="0" y="0" class="label-text">Stars Earned</text>
      <text x="0" y="22" class="value-text" fill="#ca8a04">${data.totalStars}</text>
    </g>
    <!-- Issues -->
    <g transform="translate(0, 48)">
      <text x="0" y="0" class="label-text">Issues Closed</text>
      <text x="0" y="22" class="value-text">${data.totalIssues}</text>
    </g>
  </g>

  <!-- Bottom Divider Line & Repos count -->
  <line x1="20" y1="160" x2="360" y2="160" stroke="#e2e8f0" stroke-width="1" />
  <g transform="translate(25, 182)">
    <text x="0" y="0" class="label-text" font-size="11.5">Contributed Repositories</text>
    <text x="315" y="-2" class="value-text" font-size="14" text-anchor="end" fill="#3b82f6">${data.contributedTo}</text>
  </g>
</svg>
  `;
  fs.writeFileSync(path.join(targetDir, 'github_stats.svg'), content.trim());
}

// 2. generateLanguagesSVG — Light theme, no grid pattern
function generateLanguagesSVG(data) {
  let barsHTML = '';
  data.languages.forEach((lang, index) => {
    const y = index * 24;
    const barWidth = Math.ceil(lang.percentage * 1.5);
    barsHTML += `
    <g transform="translate(0, ${y})">
      <!-- Language Name -->
      <text x="0" y="11" class="label-text" font-size="11.5">${lang.name}</text>
      
      <!-- Progress Bar Track -->
      <rect x="110" y="2" width="150" height="8" rx="4" fill="#f1f5f9" stroke="#e2e8f0" stroke-width="0.5" />
      
      <!-- Progress Bar Fill -->
      <rect x="110" y="2" width="${barWidth}" height="8" rx="4" fill="${lang.color}" />
      
      <!-- Percentage Text -->
      <text x="270" y="11" class="label-text" font-size="11" fill="#64748b">${lang.percentage}%</text>
    </g>
    `;
  });

  const content = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 200" width="100%" height="100%">
  <defs>
    <style type="text/css">
      ${commonStyles}
    </style>
  </defs>

  <rect width="100%" height="100%" class="card-bg" />
  <path d="M 20 0 L 100 0" stroke="#0a0a0a" stroke-width="2" stroke-linecap="round" />

  <!-- Header -->
  <circle cx="20" cy="30" r="4" fill="#0a0a0a" />
  <text x="32" y="34" class="header-title">Top Languages</text>

  <!-- Language List -->
  <g transform="translate(25, 62)">
    ${barsHTML}
  </g>
</svg>
  `;
  fs.writeFileSync(path.join(targetDir, 'github_languages.svg'), content.trim());
}

// 3. generateStreakSVG — Light theme, no grid pattern, real streak data
function generateStreakSVG(data) {
  const content = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 780 110" width="100%" height="100%">
  <defs>
    <style type="text/css">
      ${commonStyles}
      .streak-val {
        font-family: 'Space Grotesk', system-ui, sans-serif;
        font-size: 26px;
        font-weight: 700;
        fill: #0a0a0a;
      }
      .streak-label {
        font-family: 'Space Grotesk', system-ui, sans-serif;
        font-size: 12px;
        font-weight: 600;
        fill: #64748b;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }
    </style>
  </defs>

  <rect width="100%" height="100%" class="card-bg" />
  <path d="M 30 0 L 150 0" stroke="#0a0a0a" stroke-width="2" stroke-linecap="round" />

  <!-- Columns -->
  <!-- Col 1: Total Contributions -->
  <g transform="translate(60, 30)">
    <text x="0" y="15" class="streak-label">Total Contributions</text>
    <text x="0" y="50" class="streak-val" fill="#0a0a0a">${data.streak.totalContributions}</text>
  </g>

  <!-- Divider -->
  <line x1="280" y1="20" x2="280" y2="90" stroke="#e2e8f0" stroke-width="1.5" />

  <!-- Col 2: Current Streak -->
  <g transform="translate(320, 30)">
    <text x="0" y="15" class="streak-label" fill="#dc2626">🔥 Current Streak</text>
    <text x="0" y="50" class="streak-val" fill="#dc2626">${data.streak.currentStreak} <tspan font-size="14" font-family="Inter" fill="#64748b" font-weight="400">days</tspan></text>
  </g>

  <!-- Divider -->
  <line x1="520" y1="20" x2="520" y2="90" stroke="#e2e8f0" stroke-width="1.5" />

  <!-- Col 3: Longest Streak -->
  <g transform="translate(560, 30)">
    <text x="0" y="15" class="streak-label" fill="#ca8a04">🏆 Longest Streak</text>
    <text x="0" y="50" class="streak-val" fill="#ca8a04">${data.streak.longestStreak} <tspan font-size="14" font-family="Inter" fill="#64748b" font-weight="400">days</tspan></text>
  </g>
</svg>
  `;
  fs.writeFileSync(path.join(targetDir, 'github_streak.svg'), content.trim());
}

// Run the script
run().catch(console.error);
