const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'assets', 'svg', 'project_cards');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Common styles & defs for all cards — Light theme, Inter + Space Grotesk
const getCommonHeader = (width, height) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
  <defs>
    <style type="text/css">
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700;800&amp;family=Inter:wght@400;500&amp;display=swap');
      
      .card-bg {
        fill: #ffffff;
        stroke: #e2e8f0;
        stroke-width: 1.5;
        rx: 16px;
      }
      .proj-title {
        font-family: 'Space Grotesk', system-ui, sans-serif;
        font-weight: 800;
        font-size: 28px;
        fill: #0a0a0a;
        letter-spacing: -0.02em;
      }
      .proj-desc {
        font-family: 'Inter', system-ui, sans-serif;
        font-size: 14px;
        fill: #475569;
        font-weight: 400;
        line-height: 1.5;
      }
      .status-text {
        font-family: 'Inter', system-ui, sans-serif;
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }
      .tag-bg {
        fill: #f1f5f9;
        stroke: #e2e8f0;
        stroke-width: 1;
        rx: 6px;
      }
      .tag-text {
        font-family: 'Inter', system-ui, sans-serif;
        font-size: 11px;
        font-weight: 500;
        fill: #475569;
      }
      .cta-text {
        font-family: 'Space Grotesk', system-ui, sans-serif;
        font-size: 11px;
        font-weight: 700;
        fill: #3b82f6;
        letter-spacing: 0.05em;
      }
    </style>
  </defs>
`;

// 1. MindMirror Card — Light theme, larger, no animations
const renderMindMirror = () => {
  const width = 800;
  const height = 220;
  
  return `
  ${getCommonHeader(width, height)}
  <!-- Background -->
  <rect width="${width}" height="${height}" class="card-bg" />
  
  <!-- Accent line at top -->
  <path d="M 30 0 L 200 0" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round" opacity="0.6" />
  
  <!-- Content Group -->
  <g transform="translate(40, 35)">
    <!-- Status Badge -->
    <g transform="translate(0, 0)">
      <rect width="90" height="20" rx="4" fill="#eff6ff" stroke="#bfdbfe" stroke-width="0.75" />
      <circle cx="10" cy="10" r="2.5" fill="#3b82f6" />
      <text x="20" y="14" class="status-text" fill="#3b82f6">Refining AI</text>
    </g>

    <!-- Title -->
    <text x="0" y="50" class="proj-title">MindMirror</text>
    
    <!-- Description -->
    <text x="0" y="80" class="proj-desc">AI-powered mental well-being tracker analyzing emotional journaling patterns,</text>
    <text x="0" y="100" class="proj-desc">extracting cognitive distortions, and generating diagnostic sentiment logs.</text>

    <!-- Tech Tags -->
    <g transform="translate(0, 120)">
      <!-- React -->
      <g transform="translate(0, 0)">
        <rect width="60" height="22" class="tag-bg" />
        <text x="12" y="15" class="tag-text">React</text>
      </g>
      <!-- Node.js -->
      <g transform="translate(66, 0)">
        <rect width="70" height="22" class="tag-bg" />
        <text x="12" y="15" class="tag-text">Node.js</text>
      </g>
      <!-- NLP Python -->
      <g transform="translate(142, 0)">
        <rect width="95" height="22" class="tag-bg" />
        <text x="12" y="15" class="tag-text">Python (NLP)</text>
      </g>
      <!-- Firebase -->
      <g transform="translate(243, 0)">
        <rect width="75" height="22" class="tag-bg" />
        <text x="12" y="15" class="tag-text">Firebase</text>
      </g>
    </g>
  </g>

  <!-- Interactive CTA link indicator -->
  <g transform="translate(40, 198)">
    <text x="0" y="0" class="cta-text">EXPLORE REPOSITORY &amp; ARCHITECTURE →</text>
  </g>
</svg>
`;
};

// 2. CrimeFace Card — Light theme, larger, no animations
const renderCrimeFace = () => {
  const width = 800;
  const height = 220;
  
  return `
  ${getCommonHeader(width, height)}
  <!-- Background -->
  <rect width="${width}" height="${height}" class="card-bg" />
  
  <!-- Accent line at top -->
  <path d="M 30 0 L 200 0" stroke="#0a0a0a" stroke-width="2.5" stroke-linecap="round" opacity="0.5" />
  
  <!-- Content Group -->
  <g transform="translate(40, 35)">
    <!-- Status Badge -->
    <g transform="translate(0, 0)">
      <rect width="120" height="20" rx="4" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="0.75" />
      <circle cx="10" cy="10" r="2.5" fill="#16a34a" />
      <text x="20" y="14" class="status-text" fill="#16a34a">Production Ready</text>
    </g>

    <!-- Title -->
    <text x="0" y="50" class="proj-title">CrimeFace</text>
    
    <!-- Description -->
    <text x="0" y="80" class="proj-desc">Deep learning-powered facial indexing framework executing sub-millisecond</text>
    <text x="0" y="100" class="proj-desc">suspect profile matching against a Milvus vector similarity index.</text>

    <!-- Tech Tags -->
    <g transform="translate(0, 120)">
      <!-- Python -->
      <g transform="translate(0, 0)">
        <rect width="65" height="22" class="tag-bg" />
        <text x="12" y="15" class="tag-text">Python</text>
      </g>
      <!-- PyTorch -->
      <g transform="translate(71, 0)">
        <rect width="70" height="22" class="tag-bg" />
        <text x="12" y="15" class="tag-text">PyTorch</text>
      </g>
      <!-- Milvus -->
      <g transform="translate(147, 0)">
        <rect width="70" height="22" class="tag-bg" />
        <text x="12" y="15" class="tag-text">Milvus</text>
      </g>
      <!-- FastAPI -->
      <g transform="translate(223, 0)">
        <rect width="70" height="22" class="tag-bg" />
        <text x="12" y="15" class="tag-text">FastAPI</text>
      </g>
      <!-- Docker -->
      <g transform="translate(299, 0)">
        <rect width="65" height="22" class="tag-bg" />
        <text x="12" y="15" class="tag-text">Docker</text>
      </g>
    </g>
  </g>

  <!-- Interactive CTA link indicator -->
  <g transform="translate(40, 198)">
    <text x="0" y="0" class="cta-text">EXPLORE REPOSITORY &amp; ARCHITECTURE →</text>
  </g>
</svg>
`;
};

// 3. Turfly Card — Light theme, larger, no animations
const renderTurfly = () => {
  const width = 800;
  const height = 220;
  
  return `
  ${getCommonHeader(width, height)}
  <!-- Background -->
  <rect width="${width}" height="${height}" class="card-bg" />
  
  <!-- Accent line at top -->
  <path d="M 30 0 L 200 0" stroke="#0a0a0a" stroke-width="2.5" stroke-linecap="round" opacity="0.5" />
  
  <!-- Content Group -->
  <g transform="translate(40, 35)">
    <!-- Status Badge -->
    <g transform="translate(0, 0)">
      <rect width="100" height="20" rx="4" fill="#fefce8" stroke="#fde68a" stroke-width="0.75" />
      <circle cx="10" cy="10" r="2.5" fill="#ca8a04" />
      <text x="20" y="14" class="status-text" fill="#ca8a04">Deployment</text>
    </g>

    <!-- Title -->
    <text x="0" y="50" class="proj-title">Turfly</text>
    
    <!-- Description -->
    <text x="0" y="80" class="proj-desc">A sports facility booking and local player matchmaking social platform,</text>
    <text x="0" y="100" class="proj-desc">reducing scheduler friction and forming real-world athlete matches.</text>

    <!-- Tech Tags -->
    <g transform="translate(0, 120)">
      <!-- React Native -->
      <g transform="translate(0, 0)">
        <rect width="100" height="22" class="tag-bg" />
        <text x="12" y="15" class="tag-text">React Native</text>
      </g>
      <!-- Node.js -->
      <g transform="translate(106, 0)">
        <rect width="70" height="22" class="tag-bg" />
        <text x="12" y="15" class="tag-text">Node.js</text>
      </g>
      <!-- Express -->
      <g transform="translate(182, 0)">
        <rect width="70" height="22" class="tag-bg" />
        <text x="12" y="15" class="tag-text">Express</text>
      </g>
      <!-- MongoDB -->
      <g transform="translate(258, 0)">
        <rect width="75" height="22" class="tag-bg" />
        <text x="12" y="15" class="tag-text">MongoDB</text>
      </g>
    </g>
  </g>

  <!-- Interactive CTA link indicator -->
  <g transform="translate(40, 198)">
    <text x="0" y="0" class="cta-text">EXPLORE REPOSITORY &amp; ROADMAP →</text>
  </g>
</svg>
`;
};

// Write files
fs.writeFileSync(path.join(targetDir, 'mindmirror_card.svg'), renderMindMirror().trim());
fs.writeFileSync(path.join(targetDir, 'crimeface_card.svg'), renderCrimeFace().trim());
fs.writeFileSync(path.join(targetDir, 'turfly_card.svg'), renderTurfly().trim());

console.log('Successfully generated 3 project card SVGs in assets/svg/project_cards/');
