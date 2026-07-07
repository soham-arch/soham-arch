const fs = require('fs');
const path = require('path');
const https = require('https');

const rootDir = path.join(__dirname, '..');
const settingsPath = path.join(rootDir, 'config', 'settings.json');
const templatePath = path.join(rootDir, 'templates', 'README.template.md');
const outputPath = path.join(rootDir, 'README.md');

const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
const username = settings.github_username;
const token = process.env.GITHUB_TOKEN;

// ⚠ FALLBACK ONLY — local dev placeholder, NOT real data
const fallbackRepos = settings.projects.map(p => ({
  name: p.name, html_url: p.github_link, description: p.description,
  stargazers_count: 0, forks_count: 0, language: p.tech[0]
}));

function fetchLatestRepos(username, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/users/${username}/repos?sort=updated&direction=desc&per_page=5`,
      method: 'GET',
      headers: { 'User-Agent': 'soham-arch-portfolio-updater' }
    };
    if (token) options.headers['Authorization'] = `token ${token}`;
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) return reject(new Error(`GitHub API status ${res.statusCode}`));
        try {
          const repos = JSON.parse(body);
          if (Array.isArray(repos)) {
            resolve(repos.filter(r => r.name.toLowerCase() !== username.toLowerCase()).slice(0, 4));
          } else reject(new Error('Invalid response'));
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

// Dark theme repo cards
function formatReposMarkdown(repos) {
  let md = '<table width="100%" border="0" cellpadding="8" cellspacing="0">\n';
  for (let i = 0; i < repos.length; i += 2) {
    md += '  <tr style="border: none;">\n';
    const renderCard = (repo) => `
      <div style="background-color: #0a0f1e; border: 1px solid #1e293b; border-radius: 12px; padding: 18px; min-height: 120px;">
        <h4 style="margin: 0 0 10px 0; font-family: sans-serif;">
          <a href="${repo.html_url}" target="_blank" style="color: #38bdf8; text-decoration: none; font-weight: 700;">📂 ${repo.name}</a>
        </h4>
        <p style="margin: 0 0 14px 0; font-size: 13px; color: #94a3b8; line-height: 1.5; font-family: sans-serif;">
          ${repo.description || 'No description provided.'}
        </p>
        <div style="font-size: 11px; color: #64748b; font-family: sans-serif;">
          <span style="margin-right: 15px;">⭐ ${repo.stargazers_count || 0}</span>
          <span style="margin-right: 15px;">🍴 ${repo.forks_count || 0}</span>
          <span style="color: #3b82f6;">●</span> ${repo.language || 'Code'}
        </div>
      </div>`;
    
    md += `    <td width="50%" valign="top" style="border: none; padding-bottom: 15px;">${renderCard(repos[i])}\n    </td>\n`;
    if (repos[i + 1]) {
      md += `    <td width="50%" valign="top" style="border: none; padding-bottom: 15px;">${renderCard(repos[i + 1])}\n    </td>\n`;
    } else {
      md += '    <td width="50%" style="border: none;"></td>\n';
    }
    md += '  </tr>\n';
  }
  md += '</table>';
  return md;
}

async function main() {
  console.log('Compiling README.md from template...');
  let repos = fallbackRepos;
  try {
    const fetched = await fetchLatestRepos(username, token);
    if (fetched && fetched.length > 0) { repos = fetched; console.log(`Fetched ${repos.length} repos.`); }
  } catch (err) { console.warn('Fallback repos used:', err.message); }

  const reposMarkdown = formatReposMarkdown(repos);
  let template = fs.readFileSync(templatePath, 'utf8');
  
  // Replace LATEST_REPOS
  const sr = '<!-- START_SECTION:latest_repos -->', er = '<!-- END_SECTION:latest_repos -->';
  const si = template.indexOf(sr), ei = template.indexOf(er);
  if (si !== -1 && ei !== -1) template = template.substring(0, si + sr.length) + '\n' + reposMarkdown + '\n' + template.substring(ei);
  
  // Replace date
  const sd = '<!-- START_SECTION:update_date -->', ed = '<!-- END_SECTION:update_date -->';
  const sdi = template.indexOf(sd), edi = template.indexOf(ed);
  if (sdi !== -1 && edi !== -1) template = template.substring(0, sdi + sd.length) + new Date().toISOString().split('T')[0] + template.substring(edi);
  
  fs.writeFileSync(outputPath, template);
  console.log('README.md compiled successfully!');
}

main().catch(console.error);
