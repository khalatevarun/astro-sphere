# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server:** `pnpm dev` (localhost:4321)
- **Build:** `pnpm build` (runs `astro check` then builds to `./dist/`)
- **Preview:** `pnpm preview`
- **Lint:** `pnpm lint` / `pnpm lint:fix`

Package manager is **pnpm**.

## Architecture

Astro 4 static site (portfolio/blog) deployed to Vercel. Uses SolidJS for interactive client-side components and Tailwind CSS for styling.

### Content Collections

Content lives in `src/content/` as MDX files managed by Astro's Content Collections API with Zod schemas defined in `src/content/config.ts`:

- **blog/** — Posts with title, summary, date, tags, optional `draft` flag
- **projects/** — With optional `demoUrl`, `repoUrl`, and `useGitHubReadme` (auto-fetches README from GitHub)
- **work/** — Entries typed as `"work"` or `"education"` with achievements array
- **opensource/** — Contribution records with project name, type, and repo URL
- **legal/** — Simple title + date pages

Draft posts (`draft: true`) are filtered out of listings. Collections are sorted by date descending.

### Routing

File-based routing in `src/pages/`. Dynamic routes use `[...slug].astro` with `getStaticPaths()` for blog posts, projects, and legal pages.

### Component Split

- **Astro components** (`src/components/*.astro`) — Static/layout: Header, Footer, Container, BaseHead, Drawer, decorative effects (TwinklingStars, MeteorShower)
- **SolidJS components** (`src/components/*.tsx`) — Interactive: Blog (tag filtering), Projects (tag filtering), Search (Fuse.js full-text), ArrowCard. Mounted with `client:load` directive.

### Key Files

- `src/consts.ts` — Site metadata, navigation links, social links (the central config for site content)
- `src/types.ts` — TypeScript interfaces (Site, Page, Links, Socials)
- `src/lib/utils.ts` — `cn()` (clsx + tailwind-merge), `formatDate()`, `readingTime()`
- `src/lib/github.ts` — `fetchGitHubReadme()` with relative-to-absolute URL rewriting
- `tailwind.config.mjs` — Custom animations (twinkle, meteor), Atkinson font family

### Conventions

- TypeScript strict mode. Path alias: `@*` → `src/*` (e.g., `import type { Site } from "@types"`)
- Styling uses Tailwind utility classes with `cn()` for conditional merging
- Light/dark theme via CSS class toggle with `dark:` variants
