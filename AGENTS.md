<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This project uses Next.js 16. APIs, conventions, and file structure may differ from older Next.js versions. Before editing Next-specific code, read the relevant local guide in `node_modules/next/dist/docs/` and follow deprecation notices.
<!-- END:nextjs-agent-rules -->

# AI Agent Rules

## Project Identity

- This repository is `AI News Radar`, a dark, readable AI news and comparison site.
- It is not a resume, portfolio, HR page, interview page, or marketing landing page.
- The current implementation is a local-first Next.js app with repo-tracked article data and an automated weekly production news workflow.

## Mandatory Behavior

- Do not guess. Base answers, implementation choices, and investigations on real files, command output, logs, or documented sources.
- Do not fabricate paths, APIs, configuration, article facts, dates, sources, branch names, or project structure.
- If a request is unreasonable, contradictory, risky, or underspecified, ask a question or clearly label the assumption before acting.
- If an assumption is unavoidable, mark it as `Assumption:` and explain how it can be verified.
- Do not expose secrets, keys, tokens, credentials, or sensitive local data.

## Before Editing

1. Run `git status --short --branch`.
2. Read this file.
3. Read `DEVELOPMENT.md`.
4. Read `docs/ai/agent-working-patterns.md`.
5. Read the specific source or documentation files affected by the task.
6. State the intended edit scope before changing files.

## Source Map

- `app/page.tsx`: homepage news layout.
- `app/articles/[slug]/page.tsx`: article detail route.
- `data/articles.json`: repo-tracked article metadata and comparison data.
- `lib/articles.ts`: typed exports over `data/articles.json`.
- `app/globals.css`: global styling.
- `docs/ai/`: AI and engineering guidance.
- `.github/workflows/weekly-sit-merge.yml`: weekly `dev` to `sit` merge automation.
- `.github/workflows/weekly-news-production.yml`: Monday 09:00 Asia/Taipei automated news update and production publishing.

## Working Index

- Package manager: npm. This repo has `package-lock.json`; do not switch package managers unless explicitly requested.
- Core scripts: `npm run dev`, `npm run lint`, `npm run build`, `npm run news:update`, `npm run news:dry-run`, `npm run news:self-test`, `npm run hackmd:push`, `npm run hackmd:pull`, `npm run hackmd:check`, `npm run vercel:preview-check`.
- Stack versions are declared in `package.json`: Next.js 16, React 19, TypeScript, Tailwind CSS 4, ESLint 9.
- Next.js API behavior must be checked against local docs under `node_modules/next/dist/docs/` before editing Next-specific code.
- Article page body text is read from `data/generated/hackmd-articles.json` through `lib/hackmd-content.ts`; that generated cache comes from HackMD pull, not direct manual editing.
- HackMD API configuration uses `HACKMD_API_TOKEN` and optional `HACKMD_INDEX_NOTE_ID`; keep real values in `.env.local` or CI secrets only.
- For content work, verify `data/articles.json`, `content/hackmd/articles.json`, and `data/generated/hackmd-articles.json` stay consistent.

## Content Rules

- All article facts must include event date, published date, source name, source URL, and verification note.
- Prefer official or primary sources for article data. If using media coverage, identify it as secondary coverage.
- Do not add unverified AI news as confirmed content.
- HackMD is the source of truth for article body Markdown.
- Keep article metadata in `data/articles.json`; keep HackMD note mapping in `content/hackmd/articles.json`.
- Do not copy third-party full articles into HackMD. Store original AI News Radar body text with source links and verification notes.
- See `docs/ai/content-verification.md` before adding or editing article content.
- Weekly news updates must follow `docs/ai/weekly-news-update.md`.
- Automated weekly update branches must be created from `dev` and named `feature/renew_news_auto_<yyyymmdd>`.
- Do not use guesses, simulated content, imagined facts, or unsupported summaries to fill the weekly article count.

## Engineering Rules

- Keep changes small, reviewable, and scoped to the request.
- Follow the existing stack: Next.js App Router, React, TypeScript, Tailwind CSS, npm.
- Do not add another database, CMS, authentication, open-ended crawler, auto-scraper, or GitHub automation unless explicitly requested.
- The approved weekly news automation may collect only from the official/primary source list in `data/weekly-news-sources.json`.
- Do not manually edit generated output such as `.next/`, `out/`, or build artifacts.
- Do not commit real HackMD tokens. Use `HACKMD_API_TOKEN` from `.env.local` or CI secrets.
- Run `npm run lint` and `npm run build` after implementation unless the change is documentation-only.
- For UI changes, check desktop and mobile layout; avoid text overlap and unreadable contrast.

## Git Workflow

- Follow `DEVELOPMENT.md` for branch policy.
- `dev` is the daily integration branch.
- Create `feature/<name>` or `bug/<name>` from `dev` for normal work.
- Create `feature/renew_news_auto_<yyyymmdd>` from `dev` for automated weekly news updates.
- `sit` receives weekly sprint integration from `dev`.
- `production` may receive the automated weekly news update only after HackMD, lint, build, and Vercel Preview smoke checks pass.

## Response Style

- Reply in Traditional Chinese by default.
- Keep responses concise and easy to copy.
- Report what was changed, what was tested, and any remaining uncertainty.

