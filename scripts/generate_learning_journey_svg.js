const fs = require('fs');
const path = require('path');

// Load config
const settingsPath = path.join(__dirname, '..', 'config', 'settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
const timelineData = settings.learning_journey;

const targetDir = path.join(__dirname, '..', 'assets', 'svg');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Vertical timeline layout constants
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
      
      .milestone-title {
        font-family: 'Space Grotesk', system-ui, sans-serif;
        font-size: 14px;
        font-weight: 700;
        fill: #0a0a0a;
      }
      
      .milestone-detail {
        font-family: 'Inter', system-ui, sans-serif;
        font-size: 12px;
        fill: #64748b;
        font-weight: 400;
      }
    </style>
  </defs>

  <!-- Background -->
  <rect width="100%" height="100%" fill="#ffffff" rx="16" stroke="#e2e8f0" stroke-width="1.5" />

  <!-- Vertical Timeline Line -->
  <line x1="${LINE_X}" y1="${START_Y}" x2="${LINE_X}" y2="${START_Y + (timelineData.length - 1) * NODE_SPACING}" stroke="#e2e8f0" stroke-width="2" stroke-linecap="round" />
`;

timelineData.forEach((node, index) => {
  const y = START_Y + index * NODE_SPACING;
  
  // Alternate accent colors: near-black and muted blue
  const nodeColor = index % 2 === 0 ? '#0a0a0a' : '#3b82f6';

  svgContent += `
  <!-- NODE ${index + 1}: ${node.milestone} -->
  <g>
    <!-- Node circle -->
    <circle cx="${LINE_X}" cy="${y}" r="6" fill="#ffffff" stroke="${nodeColor}" stroke-width="2.5" />
    <circle cx="${LINE_X}" cy="${y}" r="2.5" fill="${nodeColor}" />
    
    <!-- Milestone title -->
    <text x="${CONTENT_X}" y="${y - 4}" class="milestone-title">${node.milestone}</text>
    
    <!-- Milestone detail -->
    <text x="${CONTENT_X}" y="${y + 14}" class="milestone-detail">${node.detail}</text>
  </g>
  `;
});

svgContent += `\n</svg>`;

fs.writeFileSync(path.join(targetDir, 'learning_journey.svg'), svgContent);
console.log('Successfully generated assets/svg/learning_journey.svg');
