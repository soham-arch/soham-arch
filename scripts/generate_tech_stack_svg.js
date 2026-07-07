const fs = require('fs');
const path = require('path');

const settingsPath = path.join(__dirname, '..', 'config', 'settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
const techStack = settings.tech_stack;

const targetDir = path.join(__dirname, '..', 'assets', 'svg');
if (!fs.existsSync(targetDir)) { fs.mkdirSync(targetDir, { recursive: true }); }

const SVG_WIDTH = 800;
const COLUMNS = 3;
const SPACING = 15;
const MARGIN = 10;
const CARD_WIDTH = (SVG_WIDTH - (MARGIN * 2) - (SPACING * (COLUMNS - 1))) / COLUMNS;
const CARD_HEIGHT = 185;
const ROW_SPACING = 15;

const categories = Object.keys(techStack);
const totalRows = Math.ceil(categories.length / COLUMNS);
const SVG_HEIGHT = (totalRows * CARD_HEIGHT) + ((totalRows - 1) * ROW_SPACING) + (MARGIN * 2);

const indicatorColors = {
  "Languages": "#38bdf8",
  "Frontend": "#3b82f6",
  "Backend": "#818cf8",
  "Databases": "#10b981",
  "Artificial Intelligence": "#a78bfa",
  "Developer Tools": "#f59e0b"
};

let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SVG_WIDTH} ${SVG_HEIGHT}" width="100%" height="100%">
  <defs>
    <style type="text/css">
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&amp;family=Inter:wght@400;500&amp;display=swap');
      .card-bg { fill: #0a0f1e; stroke: #1e293b; stroke-width: 1; rx: 12px; }
      .card-header { font-family: 'Space Grotesk', sans-serif; font-size: 14px; font-weight: 700; fill: #e2e8f0; letter-spacing: 0.02em; }
      .pill-bg { fill: #0d1527; stroke: #1e293b; stroke-width: 1; rx: 6px; }
      .pill-text { font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 500; fill: #94a3b8; }
    </style>
  </defs>
  <rect width="100%" height="100%" fill="none" />
`;

categories.forEach((category, index) => {
  const col = index % COLUMNS;
  const row = Math.floor(index / COLUMNS);
  const x = MARGIN + col * (CARD_WIDTH + SPACING);
  const y = MARGIN + row * (CARD_HEIGHT + ROW_SPACING);
  const dotColor = indicatorColors[category] || "#3b82f6";
  
  svgContent += `
  <g transform="translate(${x}, ${y})">
    <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" class="card-bg" />
    <path d="M 20 0 L ${CARD_WIDTH - 20} 0" stroke="${dotColor}" stroke-width="2" stroke-linecap="round" opacity="0.7" />
    <circle cx="20" cy="30" r="4" fill="${dotColor}" />
    <text x="32" y="34" class="card-header">${category}</text>
    <g transform="translate(15, 55)">`;
  
  const items = techStack[category];
  let cx = 0, cy = 0;
  const cw = CARD_WIDTH - 30;
  items.forEach((item) => {
    const tw = Math.ceil(item.length * 6.2);
    const pw = 8 + 10 + tw + 8, ph = 24;
    if (cx + pw > cw) { cx = 0; cy += ph + 8; }
    svgContent += `
      <g transform="translate(${cx}, ${cy})">
        <rect width="${pw}" height="${ph}" class="pill-bg" />
        <circle cx="10" cy="12" r="2.5" fill="${dotColor}" opacity="0.6" />
        <text x="18" y="15" class="pill-text">${item}</text>
      </g>`;
    cx += pw + 6;
  });
  svgContent += `
    </g>
  </g>`;
});

svgContent += `\n</svg>`;
fs.writeFileSync(path.join(targetDir, 'tech_stack.svg'), svgContent);
console.log('Successfully generated assets/svg/tech_stack.svg');
