<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This project uses Next.js 16. APIs, conventions, and file structure may differ from older Next.js versions. Before editing Next-specific code, read the relevant local guide in `node_modules/next/dist/docs/` and follow deprecation notices.
<!-- END:nextjs-agent-rules -->

# AI Agent Rules

## Project Identity

- This repository is `AI News Radar`, a dark, readable AI news and comparison site.
- It is not a resume, portfolio, HR page, interview page, or marketing landing page.
- The current implementation is a local-first Next.js app with manually curated article data.

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
- `lib/articles.ts`: typed local article and comparison data.
- `app/globals.css`: global styling.
- `docs/ai/`: AI and engineering guidance.
- `.github/workflows/weekly-sit-merge.yml`: weekly `dev` to `sit` merge automation.

## Content Rules

- All article facts must include event date, published date, source name, source URL, and verification note.
- Prefer official or primary sources for article data. If using media coverage, identify it as secondary coverage.
- Do not add unverified AI news as confirmed content.
- HackMD is the source of truth for article body Markdown.
- Keep article metadata in `lib/articles.ts`; keep HackMD note mapping in `content/hackmd/articles.json`.
- Do not copy third-party full articles into HackMD. Store original AI News Radar body text with source links and verification notes.
- See `docs/ai/content-verification.md` before adding or editing article content.
- Weekly news updates must follow `docs/ai/weekly-news-update.md`.
- Weekly update branches must be created from `dev` and named `feature/renew_news_<english-summary>`.
- Do not use guesses, simulated content, imagined facts, or unsupported summaries to fill the weekly article count.

## Engineering Rules

- Keep changes small, reviewable, and scoped to the request.
- Follow the existing stack: Next.js App Router, React, TypeScript, Tailwind CSS, npm.
- Do not add another database, CMS, authentication, crawler, auto-scraper, or GitHub automation unless explicitly requested.
- Do not manually edit generated output such as `.next/`, `out/`, or build artifacts.
- Do not commit real HackMD tokens. Use `HACKMD_API_TOKEN` from `.env.local` or CI secrets.
- Run `npm run lint` and `npm run build` after implementation unless the change is documentation-only.
- For UI changes, check desktop and mobile layout; avoid text overlap and unreadable contrast.

## Git Workflow

- Follow `DEVELOPMENT.md` for branch policy.
- `dev` is the daily integration branch.
- Create `feature/<name>` or `bug/<name>` from `dev` for normal work.
- Create `feature/renew_news_<english-summary>` from `dev` for weekly news updates.
- `sit` receives weekly sprint integration from `dev`.
- `production` is reserved until a dedicated domain and release process are ready.

## Response Style

- Reply in Traditional Chinese by default.
- Keep responses concise and easy to copy.
- Report what was changed, what was tested, and any remaining uncertainty.

