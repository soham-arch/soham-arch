const fs = require('fs');
const path = require('path');

const dividersDir = path.join(__dirname, '..', 'assets', 'svg', 'section_dividers');
if (!fs.existsSync(dividersDir)) { fs.mkdirSync(dividersDir, { recursive: true }); }

function writeSVG(filename, content) {
  fs.writeFileSync(path.join(dividersDir, filename), content.trim());
}

// 1. wave_top.svg — Dark theme
writeSVG('wave_top.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 40" width="100%" height="40" preserveAspectRatio="none">
  <defs>
    <linearGradient id="grad-wave-top" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.5"/>
      <stop offset="50%" stop-color="#6366f1" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.5"/>
    </linearGradient>
  </defs>
  <path d="M0,30 C150,5 350,5 500,20 C650,35 850,35 1000,10 L1000,40 L0,40 Z" fill="#020617"/>
  <path d="M0,30 C150,5 350,5 500,20 C650,35 850,35 1000,10" fill="none" stroke="url(#grad-wave-top)" stroke-width="1.5"/>
</svg>
`);

writeSVG('slope_mid.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 30" width="100%" height="30" preserveAspectRatio="none">
  <defs>
    <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.4"/>
    </linearGradient>
  </defs>
  <path d="M0,25 L1000,5 L1000,30 L0,30 Z" fill="#020617"/>
  <path d="M0,25 L1000,5" fill="none" stroke="url(#g1)" stroke-width="1"/>
</svg>
`);

writeSVG('wave_mid.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 40" width="100%" height="40" preserveAspectRatio="none">
  <defs>
    <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#6366f1" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#0d9488" stop-opacity="0.35"/>
    </linearGradient>
  </defs>
  <path d="M0,15 C200,35 400,5 600,25 C800,45 1000,15 1000,15 L1000,40 L0,40 Z" fill="#020617"/>
  <path d="M0,15 C200,35 400,5 600,25 C800,45 1000,15 1000,15" fill="none" stroke="url(#g2)" stroke-width="1.5"/>
</svg>
`);

writeSVG('slope_mid2.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 30" width="100%" height="30" preserveAspectRatio="none">
  <defs>
    <linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0d9488" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.4"/>
    </linearGradient>
  </defs>
  <path d="M0,5 L1000,25 L1000,30 L0,30 Z" fill="#020617"/>
  <path d="M0,5 L1000,25" fill="none" stroke="url(#g3)" stroke-width="1"/>
</svg>
`);

writeSVG('wave_mid2.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 40" width="100%" height="40" preserveAspectRatio="none">
  <defs>
    <linearGradient id="g4" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.4"/>
      <stop offset="50%" stop-color="#6366f1" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.4"/>
    </linearGradient>
  </defs>
  <path d="M0,20 C250,5 500,35 750,15 C875,5 1000,20 1000,20 L1000,40 L0,40 Z" fill="#020617"/>
  <path d="M0,20 C250,5 500,35 750,15 C875,5 1000,20 1000,20" fill="none" stroke="url(#g4)" stroke-width="1.5"/>
</svg>
`);

writeSVG('slope_mid3.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 30" width="100%" height="30" preserveAspectRatio="none">
  <defs>
    <linearGradient id="g5" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#2563eb" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#818cf8" stop-opacity="0.4"/>
    </linearGradient>
  </defs>
  <path d="M0,20 L1000,10 L1000,30 L0,30 Z" fill="#020617"/>
  <path d="M0,20 L1000,10" fill="none" stroke="url(#g5)" stroke-width="1"/>
</svg>
`);

writeSVG('wave_mid3.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 40" width="100%" height="40" preserveAspectRatio="none">
  <defs>
    <linearGradient id="g6" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#818cf8" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.35"/>
    </linearGradient>
  </defs>
  <path d="M0,25 Q250,10 500,25 T1000,25 L1000,40 L0,40 Z" fill="#020617"/>
  <path d="M0,25 Q250,10 500,25 T1000,25" fill="none" stroke="url(#g6)" stroke-width="1.5"/>
</svg>
`);

writeSVG('slope_bottom.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 30" width="100%" height="30" preserveAspectRatio="none">
  <defs>
    <linearGradient id="g7" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#6366f1" stop-opacity="0.5"/>
    </linearGradient>
  </defs>
  <path d="M0,5 L1000,25 L1000,30 L0,30 Z" fill="#020617"/>
  <path d="M0,5 L1000,25" fill="none" stroke="url(#g7)" stroke-width="1"/>
</svg>
`);

console.log('Successfully generated 8 custom section dividers in assets/svg/section_dividers/');
