# Development Workflow

## Branches

- `master`: project bootstrap and baseline branch.
- `dev`: daily integration branch. Create normal work branches from here.
- `sit`: weekly sprint integration testing branch. The scheduled workflow attempts to merge `dev` into `sit`.
- `production`: Vercel Production Branch. The weekly news automation may update it only after all automated checks and Vercel Preview smoke checks pass.

## Daily Development

1. Sync `dev`.
2. Create a working branch from `dev`.
3. Use `feature/<short-name>` for new features.
4. Use `bug/<short-name>` for normal bug fixes.
5. Merge completed work back into `dev`.
6. Before merge, run:

```bash
npm run lint
npm run build
```

## Weekly Sprint And SIT

- One week is treated as one sprint cycle.
- `.github/workflows/weekly-sit-merge.yml` runs weekly and can also be triggered manually.
- The workflow attempts to merge `origin/dev` into `sit`.
- If Git conflicts occur, the workflow should fail and a human must resolve the conflict.
- Do not use `sit` as a daily development branch.

## Weekly News Update

- `.github/workflows/weekly-news-production.yml` runs every Monday at 09:00 Asia/Taipei (`0 1 * * 1` UTC).
- The workflow starts from `dev` and creates `feature/renew_news_auto_<yyyymmdd>`.
- The content window is the previous Monday through Sunday in Asia/Taipei.
- The workflow uses the official/primary source list in `data/weekly-news-sources.json`.
- OpenAI Responses API structured output generates original AI News Radar article metadata and HackMD body Markdown from the supplied source text only.
- Add or update 8-10 verified items when enough official or primary sources exist.
- Do not publish if fewer than `MIN_WEEKLY_NEWS_ITEMS` verified items pass validation. The default minimum is 5.
- Store article metadata in `data/articles.json`.
- Store article body Markdown in HackMD and sync it through the HackMD API.
- If generation, HackMD sync, validation, build, or Vercel Preview smoke checks fail, do not update `dev` or `production`; the workflow opens a GitHub issue.

## Production Rules

- `production` is the Vercel Production Branch.
- Weekly news automation may push to `production` only after `npm run hackmd:check`, `npm run lint`, `npm run build`, and Vercel Preview smoke checks pass.
- Manual production updates must pass the same checks before merge or push.
- The public custom domain must point only to the Vercel Production Deployment, not to Preview Deployments.
- Production rollback must use the Vercel Dashboard rollback flow or `vercel rollback`, then verify the custom domain, homepage, and article detail route.
- Deployment details are documented in `docs/deployment.md`.

## Required Checks

- Code changes: `npm run lint` and `npm run build`.
- UI changes: desktop and mobile layout check.
- Article content changes: verify dates, sources, URLs, and verification notes.
- Weekly news changes: run `npm run news:self-test`, `npm run hackmd:check`, then follow `docs/ai/weekly-news-update.md`.
- Workflow changes: inspect YAML and confirm branch names match this document.

