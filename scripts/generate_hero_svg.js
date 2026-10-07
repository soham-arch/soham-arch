const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'assets', 'svg');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function generateHeroSVG() {
  const width = 880;
  const height = 210;

  const content = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
  <defs>
    <style type="text/css">
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=JetBrains+Mono:wght@400;500&amp;display=swap');

      .bg { fill: #09090b; stroke: #27272a; stroke-width: 1; rx: 8px; }
      .grid-line { stroke: #18181b; stroke-width: 1; }
      .meta-label { font-family: 'JetBrains Mono', monospace, ui-monospace; font-size: 11px; fill: #71717a; letter-spacing: 0.1em; text-transform: uppercase; }
      .title-text { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 34px; font-weight: 700; fill: #ffffff; letter-spacing: -0.03em; }
      .descriptor-text { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 13.5px; font-weight: 500; fill: #d4d4d8; letter-spacing: 0.02em; }
      .statement-text { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 13px; font-weight: 400; fill: #8a8a93; line-height: 1.5; }
      .schematic-line { stroke: #27272a; stroke-width: 1; }
      .schematic-accent { stroke: #52525b; stroke-width: 1.25; stroke-dasharray: 4 6; }
      .schematic-point { fill: #d4d4d8; }
      .schematic-coord { font-family: 'JetBrains Mono', monospace; font-size: 9.5px; fill: #52525b; letter-spacing: 0.06em; }
      .status-pulse { animation: statusPulse 3s ease-in-out infinite alternate; }
      @keyframes statusPulse { 0% { opacity: 0.4; } 100% { opacity: 1; } }
    </style>

    <linearGradient id="silver-fade" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.15" />
      <stop offset="50%" stop-color="#71717a" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#09090b" stop-opacity="0" />
    </linearGradient>
  </defs>

  <!-- Background surface -->
  <rect width="${width}" height="${height}" class="bg" />

  <!-- Subtle interior border gradient highlight -->
  <rect x="1" y="1" width="${width - 2}" height="${height - 2}" fill="url(#silver-fade)" rx="7" />

  <!-- Subtle engineering grid lines on left & right -->
  <line x1="45" y1="0" x2="45" y2="${height}" class="grid-line" />
  <line x1="${width - 240}" y1="0" x2="${width - 240}" y2="${height}" class="grid-line" />

  <!-- Main Left Content -->
  <g transform="translate(65, 36)">
    <!-- Status / Location Eyebrow -->
    <g transform="translate(0, 0)">
      <circle cx="4" cy="4" r="3" fill="#d4d4d8" class="status-pulse" />
      <circle cx="4" cy="4" r="6" stroke="#52525b" stroke-width="0.75" fill="none" opacity="0.6" />
      <text x="18" y="7" class="meta-label">COMPUTER SCIENCE &amp; ENGINEERING · PUNE, IN</text>
    </g>

    <!-- Name / Hero Headline -->
    <text x="0" y="44" class="title-text">Soham Patil</text>

    <!-- Professional Descriptor -->
    <text x="0" y="72" class="descriptor-text">Systems &amp; Algorithmic Engineering · Applied AI · Full Stack</text>

    <!-- One-line statement -->
    <text x="0" y="98" class="statement-text">Building intelligent inference architectures, bio-inspired algorithms, and resilient web platforms.</text>

    <!-- Quick architectural highlights / badges -->
    <g transform="translate(0, 124)">
      <!-- Pill 1 -->
      <g>
        <rect width="112" height="22" rx="4" fill="#141416" stroke="#27272a" stroke-width="1" />
        <text x="10" y="14" font-family="'JetBrains Mono', monospace" font-size="10.5" fill="#a1a1aa">AntLoad (ACO)</text>
      </g>
      <!-- Pill 2 -->
      <g transform="translate(120, 0)">
        <rect width="138" height="22" rx="4" fill="#141416" stroke="#27272a" stroke-width="1" />
        <text x="10" y="14" font-family="'JetBrains Mono', monospace" font-size="10.5" fill="#a1a1aa">NEXUS Emergency</text>
      </g>
      <!-- Pill 3 -->
      <g transform="translate(266, 0)">
        <rect width="92" height="22" rx="4" fill="#141416" stroke="#27272a" stroke-width="1" />
        <text x="10" y="14" font-family="'JetBrains Mono', monospace" font-size="10.5" fill="#a1a1aa">SkillBridge</text>
      </g>
    </g>
  </g>

  <!-- Right Side: Architectural Schematic / Coordinate Accent -->
  <g transform="translate(${width - 190}, 105)">
    <!-- Concentric radar/schematic circles -->
    <circle cx="60" cy="0" r="70" fill="none" class="schematic-line" />
    <circle cx="60" cy="0" r="46" fill="none" class="schematic-accent" />
    <circle cx="60" cy="0" r="22" fill="none" class="schematic-line" />
    
    <!-- Crosshairs -->
    <line x1="-15" y1="0" x2="135" y2="0" class="schematic-line" />
    <line x1="60" y1="-75" x2="60" y2="75" class="schematic-line" />

    <!-- Technical Target Markers -->
    <circle cx="60" cy="0" r="3" class="schematic-point" />
    <circle cx="85" cy="-24" r="2" fill="#a1a1aa" />
    <circle cx="35" cy="24" r="2" fill="#71717a" />
    <line x1="60" y1="0" x2="85" y2="-24" stroke="#71717a" stroke-width="0.75" />

    <!-- Fine Coordinates (Pune geographical datum) -->
    <text x="60" y="86" text-anchor="middle" class="schematic-coord">18.5204° N · 73.8567° E</text>
  </g>
</svg>
`.trim();

  const outputPath = path.join(targetDir, 'hero_banner.svg');
  fs.writeFileSync(outputPath, content, 'utf8');
  console.log('[Hero SVG] Successfully generated assets/svg/hero_banner.svg');
}

generateHeroSVG();
