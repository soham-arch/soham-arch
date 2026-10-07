const fs = require('fs');
const path = require('path');

const settingsPath = path.join(__dirname, '..', 'config', 'settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
const techStack = settings.tech_stack || {};

const targetDir = path.join(__dirname, '..', 'assets', 'svg');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const SVG_WIDTH = 880;
const COLUMNS = 3;
const SPACING = 16;
const MARGIN = 0;
const CARD_WIDTH = (SVG_WIDTH - (SPACING * (COLUMNS - 1))) / COLUMNS;
const CARD_HEIGHT = 175;
const ROW_SPACING = 16;

const categories = Object.keys(techStack);
const totalRows = Math.ceil(categories.length / COLUMNS);
const SVG_HEIGHT = (totalRows * CARD_HEIGHT) + ((totalRows - 1) * ROW_SPACING);

let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SVG_WIDTH} ${SVG_HEIGHT}" width="100%" height="100%">
  <defs>
    <style type="text/css">
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700&amp;family=JetBrains+Mono:wght@400;500&amp;display=swap');
      .card-bg { fill: #09090b; stroke: #27272a; stroke-width: 1; rx: 8px; }
      .card-header { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 13px; font-weight: 600; fill: #f4f4f5; letter-spacing: 0.04em; text-transform: uppercase; }
      .card-subline { font-family: 'JetBrains Mono', monospace; font-size: 10px; fill: #71717a; }
      .pill-bg { fill: #141416; stroke: #27272a; stroke-width: 1; rx: 4px; }
      .pill-text { font-family: 'JetBrains Mono', monospace, ui-monospace; font-size: 11px; font-weight: 500; fill: #d4d4d8; }
    </style>
  </defs>
  <rect width="100%" height="100%" fill="none" />
`;

categories.forEach((category, index) => {
  const col = index % COLUMNS;
  const row = Math.floor(index / COLUMNS);
  const x = col * (CARD_WIDTH + SPACING);
  const y = row * (CARD_HEIGHT + ROW_SPACING);

  svgContent += `
  <g transform="translate(${x}, ${y})">
    <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" class="card-bg" />
    <!-- Fine technical corner accent -->
    <line x1="0" y1="0" x2="30" y2="0" stroke="#52525b" stroke-width="1.5" />
    <circle cx="20" cy="24" r="3" fill="#d4d4d8" />
    <text x="32" y="28" class="card-header">${category}</text>
    <line x1="20" y1="42" x2="${CARD_WIDTH - 20}" y2="42" stroke="#1f1f23" stroke-width="1" />
    <g transform="translate(18, 56)">`;

  const items = techStack[category] || [];
  let cx = 0, cy = 0;
  const cw = CARD_WIDTH - 36;

  items.forEach((item) => {
    // Width estimation based on monospace character width
    const tw = Math.ceil(item.length * 6.8);
    const pw = 16 + tw, ph = 24;
    if (cx + pw > cw && cx > 0) {
      cx = 0;
      cy += ph + 8;
    }

    svgContent += `
      <g transform="translate(${cx}, ${cy})">
        <rect width="${pw}" height="${ph}" class="pill-bg" />
        <text x="${pw / 2}" y="16" text-anchor="middle" class="pill-text">${item}</text>
      </g>`;
    cx += pw + 6;
  });

  svgContent += `
    </g>
  </g>`;
});

svgContent += `\n</svg>`;
fs.writeFileSync(path.join(targetDir, 'tech_stack.svg'), svgContent, 'utf8');
console.log('[Tech Stack SVG] Successfully generated assets/svg/tech_stack.svg');
