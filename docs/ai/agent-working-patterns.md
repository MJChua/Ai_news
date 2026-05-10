# Agent Working Patterns

This document defines how AI/code agents should inspect, plan, edit, and verify changes in this repository.

## Purpose

- Keep changes grounded in the current project.
- Make edits predictable, reviewable, and easy to revert.
- Avoid overreach: do only the requested work and the minimum supporting updates needed for consistency.

## Required Pre-Change Routine

Before editing files:

1. Check workspace state with `git status --short --branch`.
2. Read root `AGENTS.md`.
3. Read `DEVELOPMENT.md`.
4. Read files directly affected by the request.
5. Read related docs when the task touches process, article content, workflow, or deployment.
6. State the intended edit scope before applying changes.

Do not start with broad refactors. Let the request and nearby code decide the scope.

## Source Map

- `app/` contains Next.js App Router routes and global styles.
- `app/page.tsx` renders the homepage.
- `app/articles/[slug]/page.tsx` renders article detail pages.
- `lib/articles.ts` stores the typed local article dataset.
- `public/` stores static assets.
- `docs/ai/` stores AI and engineering context.
- `.github/workflows/` stores GitHub Actions workflows.

Prefer existing locations over introducing new folders.

## Existing Patterns To Preserve

- Use npm because this project has `package-lock.json`.
- Use TypeScript for source code.
- Use Next.js App Router conventions.
- Keep pages as Server Components unless client interactivity is required.
- Use Tailwind utility classes already present in the app.
- Keep article data separate from layout logic.
- Keep files ASCII when practical; Traditional Chinese user-facing copy is allowed when needed.

## Scope Control

Allowed without extra confirmation:

- Directly requested edits.
- Small adjacent fixes required for the requested edit to work.
- Documentation updates caused by added or changed AI/process docs.
- Focused tests or checks for changed behavior.

Ask before doing:

- Changing branch strategy, release strategy, deployment target, or scheduled automation.
- Adding a CMS, database, auth, crawler, scraper, or large dependency.
- Renaming public routes or changing navigation structure.
- Large visual redesigns beyond the requested page or component.
- Deleting files unless they are clearly obsolete because of the requested change.

Do not do:

- Rewrite unrelated modules while fixing a narrow issue.
- Normalize formatting across untouched files.
- Edit `.next/`, `out/`, `node_modules/`, or generated build output.
- Revert user changes unless explicitly requested.

## Verification Guide

Pick the smallest useful command set:

- Documentation-only change: no build is required unless links or generated docs are affected.
- TypeScript or UI code change: run `npm run lint` and `npm run build`.
- Article content change: check required article fields and source URLs.
- Workflow change: inspect YAML and confirm referenced branches exist.

Always report what was run and what was not run.

## UI Checks

For UI changes:

- Check desktop and mobile layout.
- Ensure text does not overlap or overflow important containers.
- Preserve dark background readability.
- Keep the interface news-like and information-focused, not marketing-style.

