const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const templatePath = path.join(rootDir, 'templates', 'README.template.md');
const reposDataPath = path.join(rootDir, 'generated', 'repositories.json');
const outputPath = path.join(rootDir, 'README.md');

function formatDate(isoString) {
  if (!isoString) return 'Recent';
  try {
    const d = new Date(isoString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  } catch (_) {
    return 'Recent';
  }
}

function renderFeaturedProjects(repos) {
  if (!repos || repos.length === 0) {
    return '<p style="color: #71717a;">No featured repositories configured.</p>';
  }

  let html = '<table width="100%" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; border-spacing: 0 14px;">\n';

  for (const repo of repos) {
    const lang = repo.language || 'Plain Text';
    const dateStr = formatDate(repo.pushed_at || repo.updated_at);
    const desc = repo.description || 'No repository description provided.';

    html += `  <tr>
    <td style="background-color: #09090b; border: 1px solid #27272a; border-radius: 8px; padding: 20px 24px;">
      <table width="100%" border="0" cellpadding="0" cellspacing="0">
        <tr>
          <td valign="top">
            <h3 style="margin: 0 0 8px 0; font-size: 17px; font-weight: 700; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <a href="${repo.html_url}" style="color: #ffffff; text-decoration: none;">${repo.name}</a>
              <span style="color: #71717a; font-size: 13px; font-weight: 400; margin-left: 4px;">↗</span>
            </h3>
            <p style="margin: 0 0 16px 0; font-size: 13.5px; color: #a1a1aa; line-height: 1.55; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              ${desc}
            </p>
          </td>
        </tr>
        <tr>
          <td>
            <table border="0" cellpadding="0" cellspacing="0" style="font-family: monospace; font-size: 11.5px;">
              <tr>
                <td style="background-color: #141416; border: 1px solid #27272a; border-radius: 4px; padding: 3px 8px; color: #d4d4d8;">
                  ${lang}
                </td>
                <td style="padding-left: 14px; color: #71717a;">★ ${repo.stars}</td>
                <td style="padding-left: 14px; color: #71717a;">⑂ ${repo.forks}</td>
                <td style="padding-left: 14px; color: #52525b;">Updated ${dateStr}</td>
                <td style="padding-left: 20px;">
                  <a href="${repo.html_url}" style="color: #d4d4d8; text-decoration: none; font-weight: 600;">View Repository →</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>\n`;
  }

  html += '</table>';
  return html;
}

function renderRecentProjects(repos) {
  if (!repos || repos.length === 0) {
    return '<p style="color: #71717a;">No additional repositories found.</p>';
  }

  let html = '<table width="100%" border="0" cellpadding="8" cellspacing="0" style="border-collapse: separate; border-spacing: 12px 12px;">\n';

  for (let i = 0; i < repos.length; i += 2) {
    html += '  <tr>\n';

    const renderCard = (repo) => {
      const lang = repo.language || 'Plain Text';
      const desc = repo.description || 'No repository description provided.';
      const dateStr = formatDate(repo.pushed_at || repo.updated_at);
      return `<div style="background-color: #09090b; border: 1px solid #27272a; border-radius: 8px; padding: 18px 20px; min-height: 120px;">
        <h4 style="margin: 0 0 8px 0; font-size: 14.5px; font-weight: 700; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <a href="${repo.html_url}" style="color: #ffffff; text-decoration: none;">${repo.name}</a>
          <span style="color: #71717a; font-size: 12px; font-weight: 400; margin-left: 3px;">↗</span>
        </h4>
        <p style="margin: 0 0 14px 0; font-size: 12.5px; color: #a1a1aa; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          ${desc}
        </p>
        <div style="font-family: monospace; font-size: 11px; color: #71717a;">
          <span style="color: #d4d4d8; background-color: #141416; border: 1px solid #27272a; border-radius: 4px; padding: 2px 6px; margin-right: 10px;">${lang}</span>
          <span style="margin-right: 10px;">★ ${repo.stars}</span>
          <span style="margin-right: 10px;">⑂ ${repo.forks}</span>
          <span style="color: #52525b;">${dateStr}</span>
        </div>
      </div>`;
    };

    html += `    <td width="50%" valign="top" style="padding: 0; border: none;">${renderCard(repos[i])}</td>\n`;

    if (repos[i + 1]) {
      html += `    <td width="50%" valign="top" style="padding: 0; border: none;">${renderCard(repos[i + 1])}</td>\n`;
    } else {
      html += '    <td width="50%" style="padding: 0; border: none;"></td>\n';
    }

    html += '  </tr>\n';
  }

  html += '</table>';
  return html;
}

function replaceSection(content, startMarker, endMarker, replacement, isInline = false) {
  const startIndex = content.indexOf(startMarker);
  const endIndex = content.indexOf(endMarker);
  if (startIndex === -1 || endIndex === -1) {
    console.warn(`Section markers not found: ${startMarker}`);
    return content;
  }
  if (isInline) {
    return content.substring(0, startIndex + startMarker.length) +
      replacement +
      content.substring(endIndex);
  }
  return content.substring(0, startIndex + startMarker.length) +
    '\n' + replacement + '\n' +
    content.substring(endIndex);
}

function main() {
  console.log('[README Compiler] Compiling README.md from template...');

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template file not found: ${templatePath}`);
  }

  let reposData = { featured: [], recent: [] };
  if (fs.existsSync(reposDataPath)) {
    try {
      reposData = JSON.parse(fs.readFileSync(reposDataPath, 'utf8'));
    } catch (e) {
      console.warn('[README Compiler] Could not parse repositories.json, using fallback.');
    }
  }

  let template = fs.readFileSync(templatePath, 'utf8');

  // Inject Featured Projects
  const featuredHtml = renderFeaturedProjects(reposData.featured || []);
  template = replaceSection(template, '<!-- START_SECTION:featured_projects -->', '<!-- END_SECTION:featured_projects -->', featuredHtml);

  // Inject Recent Projects
  const recentHtml = renderRecentProjects(reposData.recent || []);
  template = replaceSection(template, '<!-- START_SECTION:recent_projects -->', '<!-- END_SECTION:recent_projects -->', recentHtml);

  // Inject Update Date
  const today = new Date().toISOString().split('T')[0];
  template = replaceSection(template, '<!-- START_SECTION:update_date -->', '<!-- END_SECTION:update_date -->', today, true);

  fs.writeFileSync(outputPath, template, 'utf8');
  console.log(`[README Compiler] Successfully compiled ${outputPath}`);
}

main();
