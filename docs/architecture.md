# Profile System Architecture (v2.0)

This repository operates as a dynamic, automated developer portfolio and GitHub profile system for Soham Patil (`soham-arch`). Built around a minimalist, editorial design language (**Black × Graphite × Silver × White**), it dynamically discovers public GitHub repositories, generates monochromatic SVG assets, and keeps the profile automatically synchronized via GitHub Actions.

---

## Directory Structure

```
├── .github/
│   └── workflows/
│       └── profile-updater.yml      # CI/CD automation workflow (cron, push, manual)
├── assets/
│   └── svg/
│       ├── stats/                   # Monochromatic statistics SVGs
│       │   ├── github_stats.svg     # Commits, PRs, stars, issues, repos contributed
│       │   ├── github_languages.svg # Language distribution bars
│       │   └── github_streak.svg    # Contribution streak & totals
│       ├── hero_banner.svg          # Minimalist technical hero with geo-datum accent
│       ├── tech_stack.svg           # Monochromatic 3-column engineering stack grid
│       └── github-contribution-grid-snake.svg # Silver/graphite contribution snake
├── config/
│   ├── settings.json                # Verified identity, bio, socials, and stack
│   └── projects.json                # Project presentation configuration (featured, excluded)
├── generated/
│   ├── repositories.json            # Normalized repository dataset fetched from GitHub API
│   └── stats.json                   # Cached GitHub GraphQL statistics
├── docs/
│   └── architecture.md              # Technical architecture documentation
├── scripts/
│   ├── fetch_repositories.js        # Discovers & normalizes public GitHub repositories
│   ├── generate_hero_svg.js         # Compiles minimalist technical hero SVG
│   ├── generate_tech_stack_svg.js   # Compiles monochrome tech stack dashboard SVG
│   ├── generate_stats_svg.js        # Live GraphQL stats compiler with cached fallback
│   └── update_readme.js             # Compiles editorial project cards into final README
├── templates/
│   └── README.template.md           # Master Markdown template
├── package.json                     # Standard npm scripts for development & build
└── README.md                        # Generated production profile README
```

---

## Core Data Flow

```
 GitHub REST API (Public Repos)
      │
      ▼
 scripts/fetch_repositories.js
      │
      ├─► Respects config/projects.json (pinned featured, excluded)
      │
      ▼
 generated/repositories.json
      │
      ├───────────────────────────────┐
      ▼                               ▼
 scripts/generate_stats_svg.js   scripts/update_readme.js
 (GitHub GraphQL API / Cache)         │
      │                               │
      ▼                               ▼
 assets/svg/stats/*.svg          README.md
```

---

## System Components

### 1. Repository Discovery (`scripts/fetch_repositories.js`)
- Queries `https://api.github.com/users/soham-arch/repos` with automatic pagination.
- Authenticates using `GITHUB_TOKEN` in CI, or local GitHub CLI credentials (`gh auth token`) during local runs.
- Falls back to unauthenticated requests or `generated/repositories.json` cache gracefully when offline or rate-limited.
- Normalizes data: stars, forks, primary language, topics, default branch, push timestamps, and descriptions.
- Applies presentation curation from `config/projects.json`:
  - **Featured Projects**: Pinned repositories displayed as full case-study cards.
  - **Excluded Projects**: Hidden repositories (e.g., config repositories or experiments).
  - **Recent Projects**: Remaining active repositories ordered by `pushed_at`.

### 2. Monochromatic SVG Engines
- **`generate_hero_svg.js`**: Generates a sleek, restrained technical hero banner featuring geographical coordinate datum (`18.5204° N · 73.8567° E`), subtle coordinate crosshairs, and professional descriptors.
- **`generate_tech_stack_svg.js`**: Generates a 3-column graphite and silver tag grid categorizing verified engineering competencies (Languages, Frontend, Backend, AI & Optimization, Databases, Developer Tools).
- **`generate_stats_svg.js`**: Fetches commit contributions, pull requests, issues, stars, and language bytes from GitHub GraphQL API. Formats metrics with tonal silver/graphite indicators.

### 3. README Compilation (`scripts/update_readme.js`)
- Reads `templates/README.template.md`.
- Injects dynamically rendered responsive case-study cards into `<!-- START_SECTION:featured_projects -->`.
- Injects 2-column repository cards into `<!-- START_SECTION:recent_projects -->`.
- Updates the build timestamp in `<!-- START_SECTION:update_date -->`.
- Writes the final output to `README.md`.

### 4. Continuous Integration (`.github/workflows/profile-updater.yml`)
- Triggered every 12 hours via cron, on pushes to `main`/`master` (excluding generated output paths to avoid recursion), and manually via `workflow_dispatch`.
- Runs on Ubuntu with Node.js 20.
- Uses `GITHUB_TOKEN` with `contents: write` permissions.
- Executes the full generation pipeline.
- Commits and pushes only when files have changed, using `[skip ci]`.

---

## Local Development Commands

```bash
# Discover repositories and save to generated/repositories.json
npm run fetch:repos

# Compile all SVGs
npm run generate:hero
npm run generate:tech
npm run generate:stats

# Compile final README
npm run compile:readme

# Full end-to-end build
npm run build
```
