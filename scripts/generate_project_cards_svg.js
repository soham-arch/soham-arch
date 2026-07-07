const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'assets', 'svg', 'project_cards');
if (!fs.existsSync(targetDir)) { fs.mkdirSync(targetDir, { recursive: true }); }

// Common header — Dark theme, clean animations
const getCommonHeader = (width, height) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
  <defs>
    <style type="text/css">
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700;800&amp;family=Inter:wght@400;500&amp;display=swap');
      .card-bg { fill: #0a0f1e; stroke: #1e293b; stroke-width: 1; rx: 16px; }
      .proj-title { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 28px; fill: #ffffff; letter-spacing: -0.02em; }
      .proj-desc { font-family: 'Inter', sans-serif; font-size: 13.5px; fill: #94a3b8; font-weight: 400; }
      .status-text { font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; }
      .tag-bg { fill: #0d1527; stroke: #1e293b; stroke-width: 1; rx: 6px; }
      .tag-text { font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 500; fill: #64748b; }
      .cta-text { font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; fill: #38bdf8; letter-spacing: 0.05em; }
      
      /* Clean subtle animations */
      .accent-pulse { animation: accentPulse 4s ease-in-out infinite alternate; }
      @keyframes accentPulse { 0% { opacity: 0.4; } 100% { opacity: 0.8; } }
      .line-flow { stroke-dasharray: 4 8; animation: lineFlow 15s linear infinite; }
      @keyframes lineFlow { 0% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: -200; } }
    </style>
    <linearGradient id="mindmirror-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8" /><stop offset="100%" stop-color="#818cf8" />
    </linearGradient>
    <linearGradient id="crimeface-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ef4444" /><stop offset="100%" stop-color="#f43f5e" />
    </linearGradient>
    <linearGradient id="turfly-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#10b981" /><stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
  </defs>
`;

// --- MindMirror ---
const renderMindMirror = () => {
  const w = 800, h = 220;
  return `${getCommonHeader(w, h)}
  <rect width="${w}" height="${h}" class="card-bg" />
  <path d="M 30 0 L 200 0" stroke="url(#mindmirror-grad)" stroke-width="2.5" stroke-linecap="round" class="accent-pulse" />
  <g transform="translate(40, 35)">
    <g><rect width="90" height="20" rx="4" fill="#0d1b3e" stroke="#1e3a8a" stroke-width="0.75" /><circle cx="10" cy="10" r="2.5" fill="#38bdf8" /><text x="20" y="14" class="status-text" fill="#38bdf8">Refining AI</text></g>
    <text x="0" y="50" class="proj-title">MindMirror</text>
    <text x="0" y="80" class="proj-desc">AI-powered mental well-being tracker analyzing emotional journaling patterns,</text>
    <text x="0" y="98" class="proj-desc">extracting cognitive distortions, and generating diagnostic sentiment logs.</text>
    <g transform="translate(0, 118)">
      <g><rect width="60" height="22" class="tag-bg" /><text x="12" y="15" class="tag-text">React</text></g>
      <g transform="translate(66, 0)"><rect width="70" height="22" class="tag-bg" /><text x="12" y="15" class="tag-text">Node.js</text></g>
      <g transform="translate(142, 0)"><rect width="95" height="22" class="tag-bg" /><text x="12" y="15" class="tag-text">Python (NLP)</text></g>
      <g transform="translate(243, 0)"><rect width="75" height="22" class="tag-bg" /><text x="12" y="15" class="tag-text">Firebase</text></g>
    </g>
  </g>
  <!-- Clean graphic -->
  <g transform="translate(660, 110)">
    <circle cx="0" cy="0" r="45" fill="none" stroke="#1e293b" stroke-width="1" />
    <circle cx="0" cy="0" r="28" fill="none" stroke="#1e3a8a" stroke-width="0.75" stroke-dasharray="3 4" />
    <path d="M-35,-10 C-15,-28 15,-5 35,-18" fill="none" stroke="url(#mindmirror-grad)" stroke-width="1.5" class="line-flow" />
    <path d="M-35,12 C-10,5 10,25 35,10" fill="none" stroke="url(#mindmirror-grad)" stroke-width="1" opacity="0.4" class="line-flow" style="animation-delay:-3s;" />
    <circle cx="-8" cy="-12" r="4" fill="#38bdf8" opacity="0.8" />
    <circle cx="12" cy="10" r="3.5" fill="#818cf8" opacity="0.8" />
  </g>
  <g transform="translate(40, 198)"><text x="0" y="0" class="cta-text">EXPLORE REPOSITORY &amp; ARCHITECTURE →</text></g>
</svg>`;
};

// --- CrimeFace ---
const renderCrimeFace = () => {
  const w = 800, h = 220;
  return `${getCommonHeader(w, h)}
  <rect width="${w}" height="${h}" class="card-bg" />
  <path d="M 30 0 L 200 0" stroke="url(#crimeface-grad)" stroke-width="2.5" stroke-linecap="round" class="accent-pulse" />
  <g transform="translate(40, 35)">
    <g><rect width="120" height="20" rx="4" fill="#1c0d14" stroke="#991b1b" stroke-width="0.75" /><circle cx="10" cy="10" r="2.5" fill="#f43f5e" /><text x="20" y="14" class="status-text" fill="#f43f5e">Production Ready</text></g>
    <text x="0" y="50" class="proj-title">CrimeFace</text>
    <text x="0" y="80" class="proj-desc">Deep learning-powered facial indexing framework executing sub-millisecond</text>
    <text x="0" y="98" class="proj-desc">suspect profile matching against a Milvus vector similarity index.</text>
    <g transform="translate(0, 118)">
      <g><rect width="65" height="22" class="tag-bg" /><text x="12" y="15" class="tag-text">Python</text></g>
      <g transform="translate(71, 0)"><rect width="70" height="22" class="tag-bg" /><text x="12" y="15" class="tag-text">PyTorch</text></g>
      <g transform="translate(147, 0)"><rect width="70" height="22" class="tag-bg" /><text x="12" y="15" class="tag-text">Milvus</text></g>
      <g transform="translate(223, 0)"><rect width="70" height="22" class="tag-bg" /><text x="12" y="15" class="tag-text">FastAPI</text></g>
      <g transform="translate(299, 0)"><rect width="65" height="22" class="tag-bg" /><text x="12" y="15" class="tag-text">Docker</text></g>
    </g>
  </g>
  <!-- Clean scanning graphic -->
  <g transform="translate(660, 110)">
    <rect x="-38" y="-38" width="76" height="76" rx="6" fill="none" stroke="#1e293b" stroke-width="1" />
    <!-- Corner brackets -->
    <path d="M-38,-28 L-38,-38 L-28,-38" fill="none" stroke="#f43f5e" stroke-width="1.5" opacity="0.7" />
    <path d="M38,-28 L38,-38 L28,-38" fill="none" stroke="#f43f5e" stroke-width="1.5" opacity="0.7" />
    <path d="M-38,28 L-38,38 L-28,38" fill="none" stroke="#f43f5e" stroke-width="1.5" opacity="0.7" />
    <path d="M38,28 L38,38 L28,38" fill="none" stroke="#f43f5e" stroke-width="1.5" opacity="0.7" />
    <!-- Scan line -->
    <line x1="-30" y1="0" x2="30" y2="0" stroke="#f43f5e" stroke-width="1" opacity="0.5" class="accent-pulse" />
    <!-- Feature dots -->
    <circle cx="-10" cy="-8" r="2.5" fill="#f43f5e" opacity="0.8" />
    <circle cx="10" cy="-8" r="2.5" fill="#f43f5e" opacity="0.8" />
    <circle cx="0" cy="10" r="2" fill="#f43f5e" opacity="0.6" />
  </g>
  <g transform="translate(40, 198)"><text x="0" y="0" class="cta-text">EXPLORE REPOSITORY &amp; ARCHITECTURE →</text></g>
</svg>`;
};

// --- Turfly ---
const renderTurfly = () => {
  const w = 800, h = 220;
  return `${getCommonHeader(w, h)}
  <rect width="${w}" height="${h}" class="card-bg" />
  <path d="M 30 0 L 200 0" stroke="url(#turfly-grad)" stroke-width="2.5" stroke-linecap="round" class="accent-pulse" />
  <g transform="translate(40, 35)">
    <g><rect width="100" height="20" rx="4" fill="#0d2620" stroke="#065f46" stroke-width="0.75" /><circle cx="10" cy="10" r="2.5" fill="#10b981" /><text x="20" y="14" class="status-text" fill="#10b981">Deployment</text></g>
    <text x="0" y="50" class="proj-title">Turfly</text>
    <text x="0" y="80" class="proj-desc">A sports facility booking and local player matchmaking social platform,</text>
    <text x="0" y="98" class="proj-desc">reducing scheduler friction and forming real-world athlete matches.</text>
    <g transform="translate(0, 118)">
      <g><rect width="100" height="22" class="tag-bg" /><text x="12" y="15" class="tag-text">React Native</text></g>
      <g transform="translate(106, 0)"><rect width="70" height="22" class="tag-bg" /><text x="12" y="15" class="tag-text">Node.js</text></g>
      <g transform="translate(182, 0)"><rect width="70" height="22" class="tag-bg" /><text x="12" y="15" class="tag-text">Express</text></g>
      <g transform="translate(258, 0)"><rect width="75" height="22" class="tag-bg" /><text x="12" y="15" class="tag-text">MongoDB</text></g>
    </g>
  </g>
  <!-- Clean pitch graphic -->
  <g transform="translate(660, 110)">
    <polygon points="0,-32 45,-10 0,12 -45,-10" fill="none" stroke="#10b981" stroke-width="1" opacity="0.6" />
    <line x1="-22" y1="-20" x2="22" y2="0" stroke="#10b981" stroke-width="0.75" opacity="0.4" />
    <circle cx="0" cy="-32" r="2.5" fill="#10b981" opacity="0.8" />
    <circle cx="45" cy="-10" r="2.5" fill="#10b981" opacity="0.8" />
    <circle cx="0" cy="12" r="2.5" fill="#10b981" opacity="0.8" />
    <circle cx="-45" cy="-10" r="2.5" fill="#10b981" opacity="0.8" />
    <!-- Player connection -->
    <circle cx="-12" cy="-5" r="3.5" fill="#06b6d4" opacity="0.7" />
    <circle cx="12" cy="-14" r="3.5" fill="#10b981" opacity="0.7" />
    <path d="M-12,-5 C0,-10 0,-10 12,-14" fill="none" stroke="#ffffff" stroke-width="1" stroke-dasharray="2 3" opacity="0.4" class="line-flow" />
  </g>
  <g transform="translate(40, 198)"><text x="0" y="0" class="cta-text">EXPLORE REPOSITORY &amp; ROADMAP →</text></g>
</svg>`;
};

fs.writeFileSync(path.join(targetDir, 'mindmirror_card.svg'), renderMindMirror().trim());
fs.writeFileSync(path.join(targetDir, 'crimeface_card.svg'), renderCrimeFace().trim());
fs.writeFileSync(path.join(targetDir, 'turfly_card.svg'), renderTurfly().trim());
console.log('Successfully generated 3 project card SVGs in assets/svg/project_cards/');
