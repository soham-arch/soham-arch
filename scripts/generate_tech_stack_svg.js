const fs = require('fs');
const path = require('path');

// Load config
const settingsPath = path.join(__dirname, '..', 'config', 'settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
const techStack = settings.tech_stack;

const targetDir = path.join(__dirname, '..', 'assets', 'svg');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Design system constants
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

// Map categories to subtle accent colors for indicators
const indicatorColors = {
  "Languages": "#0a0a0a",
  "Frontend": "#3b82f6",
  "Backend": "#0a0a0a",
  "Databases": "#0a0a0a",
  "Artificial Intelligence": "#3b82f6",
  "Developer Tools": "#0a0a0a"
};

let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SVG_WIDTH} ${SVG_HEIGHT}" width="100%" height="100%">
  <defs>
    <style type="text/css">
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&amp;family=Inter:wght@400;500&amp;display=swap');
      
      .card-bg {
        fill: #ffffff;
        stroke: #e2e8f0;
        stroke-width: 1.5;
        rx: 12px;
      }
      .card-header {
        font-family: 'Space Grotesk', system-ui, sans-serif;
        font-size: 14px;
        font-weight: 700;
        fill: #0a0a0a;
        letter-spacing: 0.02em;
      }
      .pill-bg {
        fill: #f8fafc;
        stroke: #e2e8f0;
        stroke-width: 1;
        rx: 6px;
      }
      .pill-text {
        font-family: 'Inter', system-ui, sans-serif;
        font-size: 11px;
        font-weight: 500;
        fill: #334155;
      }
    </style>
  </defs>

  <!-- Global background -->
  <rect width="100%" height="100%" fill="none" />
`;

// Render each category card
categories.forEach((category, index) => {
  const col = index % COLUMNS;
  const row = Math.floor(index / COLUMNS);
  
  const x = MARGIN + col * (CARD_WIDTH + SPACING);
  const y = MARGIN + row * (CARD_HEIGHT + ROW_SPACING);
  
  const dotColor = indicatorColors[category] || "#0a0a0a";
  
  svgContent += `
  <!-- CARD: ${category} -->
  <g transform="translate(${x}, ${y})">
    <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" class="card-bg" />
    
    <!-- Accent line at top -->
    <path d="M 20 0 L ${CARD_WIDTH - 20} 0" stroke="${dotColor}" stroke-width="2" stroke-linecap="round" opacity="0.6" />
    
    <!-- Category Dot & Title -->
    <circle cx="20" cy="30" r="4" fill="${dotColor}" />
    <text x="32" y="34" class="card-header">${category}</text>
    
    <!-- Tech Stack Pills Grid -->
    <g transform="translate(15, 55)">
  `;
  
  const items = techStack[category];
  let currentX = 0;
  let currentY = 0;
  const cardContentWidth = CARD_WIDTH - 30;
  
  items.forEach((item) => {
    const charWidth = 6.2;
    const textWidth = Math.ceil(item.length * charWidth);
    const pillWidth = 8 + 10 + textWidth + 8;
    const pillHeight = 24;
    
    if (currentX + pillWidth > cardContentWidth) {
      currentX = 0;
      currentY += pillHeight + 8;
    }
    
    svgContent += `
      <g transform="translate(${currentX}, ${currentY})">
        <rect width="${pillWidth}" height="${pillHeight}" class="pill-bg" />
        <circle cx="10" cy="12" r="2.5" fill="${dotColor}" opacity="0.5" />
        <text x="18" y="15" class="pill-text">${item}</text>
      </g>
    `;
    
    currentX += pillWidth + 6;
  });
  
  svgContent += `
    </g>
  </g>
  `;
});

svgContent += `\n</svg>`;

fs.writeFileSync(path.join(targetDir, 'tech_stack.svg'), svgContent);
console.log('Successfully generated assets/svg/tech_stack.svg');
