const fs = require('fs');
const path = require('path');

const settingsPath = path.join(__dirname, '..', 'config', 'settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
const timelineData = settings.learning_journey;

const targetDir = path.join(__dirname, '..', 'assets', 'svg');
if (!fs.existsSync(targetDir)) { fs.mkdirSync(targetDir, { recursive: true }); }

const SVG_WIDTH = 600;
const NODE_SPACING = 80;
const START_Y = 50;
const LINE_X = 40;
const CONTENT_X = 70;
const SVG_HEIGHT = START_Y + (timelineData.length * NODE_SPACING) + 30;

let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SVG_WIDTH} ${SVG_HEIGHT}" width="100%" height="100%">
  <defs>
    <style type="text/css">
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&amp;family=Inter:wght@400;500&amp;display=swap');
      .milestone-title { font-family: 'Space Grotesk', sans-serif; font-size: 14px; font-weight: 700; fill: #e2e8f0; }
      .milestone-detail { font-family: 'Inter', sans-serif; font-size: 12px; fill: #64748b; font-weight: 400; }
      .node-pulse { animation: nodePulse 3s ease-in-out infinite alternate; }
      @keyframes nodePulse { 0% { r: 6; fill-opacity: 0.15; } 100% { r: 10; fill-opacity: 0.3; } }
    </style>
    <linearGradient id="timeline-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" /><stop offset="100%" stop-color="#818cf8" />
    </linearGradient>
  </defs>

  <rect width="100%" height="100%" fill="#0a0f1e" rx="16" stroke="#1e293b" stroke-width="1" />

  <!-- Vertical Timeline Line -->
  <line x1="${LINE_X}" y1="${START_Y}" x2="${LINE_X}" y2="${START_Y + (timelineData.length - 1) * NODE_SPACING}" stroke="#1e293b" stroke-width="2" stroke-linecap="round" />
  <line x1="${LINE_X}" y1="${START_Y}" x2="${LINE_X}" y2="${START_Y + (timelineData.length - 1) * NODE_SPACING}" stroke="url(#timeline-grad)" stroke-width="2" stroke-linecap="round" stroke-dasharray="4 8" opacity="0.5" />
`;

timelineData.forEach((node, index) => {
  const y = START_Y + index * NODE_SPACING;
  const nodeColor = index >= timelineData.length - 3 ? '#38bdf8' : (index >= timelineData.length - 5 ? '#3b82f6' : '#818cf8');
  const delay = (index * 0.5).toFixed(1);

  svgContent += `
  <g>
    <!-- Pulse glow -->
    <circle cx="${LINE_X}" cy="${y}" r="7" fill="${nodeColor}" fill-opacity="0.15" class="node-pulse" style="animation-delay: -${delay}s;" />
    <!-- Core node -->
    <circle cx="${LINE_X}" cy="${y}" r="5" fill="#0a0f1e" stroke="${nodeColor}" stroke-width="2.5" />
    <circle cx="${LINE_X}" cy="${y}" r="2" fill="${nodeColor}" />
    <text x="${CONTENT_X}" y="${y - 4}" class="milestone-title">${node.milestone}</text>
    <text x="${CONTENT_X}" y="${y + 14}" class="milestone-detail">${node.detail}</text>
  </g>`;
});

svgContent += `\n</svg>`;
fs.writeFileSync(path.join(targetDir, 'learning_journey.svg'), svgContent);
console.log('Successfully generated assets/svg/learning_journey.svg');
