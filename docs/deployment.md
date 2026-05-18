# Deployment

This document defines the first production release path for AI News Radar.

## Goal

- Host the site on the Vercel Hobby plan.
- Validate changes with Vercel Preview Deployments before production.
- Point a custom domain only at the Vercel Production Deployment.
- Keep HackMD tokens out of Git and out of chat.

Free in this document means Vercel hosting on the Hobby plan. A custom domain may still require a domain registrar or a free subdomain provider.

## Deployment Defaults

- Platform: Vercel.
- Plan: Hobby.
- Package manager: npm.
- Install command: `npm ci`.
- Build command: `npm run build`.
- Production branch: `production`.
- Preview deployments: every branch and pull request that is not `production`.
- Runtime content source: committed local data, including `data/articles.json` and `data/generated/hackmd-articles.json`.
- HackMD sync: weekly automation syncs HackMD notes, then commits the generated cache.

Do not add a Vercel build step that runs `npm run hackmd:pull`. The deployed site should build from committed files only.

## Environment Variables

Local development uses `.env.local`. Git must not track `.env.local`, API tokens, Vercel tokens, or copied secrets.

Production deployments do not need HackMD environment variables on Vercel because the site reads the committed generated cache. The weekly GitHub Actions workflow needs these GitHub Secrets:

- `HACKMD_API_TOKEN`
- `OPENAI_API_KEY`
- `VERCEL_TOKEN`

The weekly workflow needs these GitHub Variables:

- `AI_NEWS_MODEL`
- `VERCEL_PROJECT_ID`
- `VERCEL_ORG_ID`
- `MIN_WEEKLY_NEWS_ITEMS`

If Vercel Preview Deployment Protection blocks smoke tests, also configure this GitHub Secret:

- `VERCEL_AUTOMATION_BYPASS_SECRET`

Never prefix secrets with `NEXT_PUBLIC_`. Values with that prefix can be exposed to browser code.

## First-Time Vercel Setup

1. Sign in to Vercel with the account that can access the GitHub repository.
2. Import this repository as a new Vercel project.
3. Confirm project settings:
   - Framework preset: Next.js.
   - Install command: `npm ci`.
   - Build command: `npm run build`.
   - Output directory: Vercel default for Next.js.
4. In Vercel Project Settings, set the Production Branch to `production`.
5. Keep the generated `*.vercel.app` domain for initial validation.
6. Do not enter HackMD tokens unless the release intentionally adds deploy-time HackMD sync.

Vercel Git deployments create Preview Deployments for non-production branches and Production Deployments for the configured production branch.

## Release Flow

Weekly production news releases are handled by `.github/workflows/weekly-news-production.yml`:

1. Generate a staged weekly news commit from `dev`.
2. Sync HackMD and pull the generated cache.
3. Run `npm run hackmd:check`, `npm run lint`, and `npm run build`.
4. Push the staging branch so Vercel creates a Preview Deployment.
5. Smoke test the Preview homepage and latest article detail route.
6. Push the validated commit to `dev` and `production`.

If any step fails, the workflow opens a GitHub issue and does not update production.

## Manual Release Flow

1. Start from `dev`.
2. Confirm the local release candidate:

```bash
git status --short --branch
npm run hackmd:check
npm run lint
npm run build
```

3. Push the release candidate branch or open a pull request so Vercel creates a Preview Deployment.
4. Smoke test the Preview URL:
   - Homepage opens.
   - Article list renders.
   - At least one article detail page opens.
   - Desktop and mobile widths have no obvious text overlap.
5. Merge or push the validated release into `production`.
6. Confirm Vercel creates a Production Deployment from `production`.
7. Smoke test the Production URL before pointing or announcing a custom domain.

Do not merge directly into `production` until the checks above are complete.

## Custom Domain

Use the Vercel Domains settings for the project after a Production Deployment is healthy.

1. Add the custom domain in Vercel Project Settings.
2. Choose the canonical host, for example `example.com` or `www.example.com`.
3. Apply the DNS records that Vercel displays for the domain:
   - Apex domains usually require an `A` record at the DNS provider.
   - Subdomains usually require a `CNAME` record at the DNS provider.
4. Wait for DNS propagation and Vercel domain verification.
5. Confirm HTTPS is active in Vercel before announcing the domain.

Do not point the public domain at a Preview Deployment. The public domain should resolve only to the Vercel Production Deployment.

## Rollback

If production has a bad release:

1. In Vercel Dashboard, open the project deployments list.
2. Find the last known-good Production Deployment.
3. Use Vercel rollback or promote the known-good deployment.
4. Verify the custom domain after rollback:
   - Homepage opens.
   - Article detail route opens.
   - HTTPS certificate is valid.
5. Open a follow-up fix branch from `dev`.

The previous Production Deployment must remain available until the new release is verified.

## References

- Vercel Git deployments: https://vercel.com/docs/deployments/git
- Vercel environment variables: https://vercel.com/docs/environment-variables
- Vercel custom domains: https://vercel.com/docs/domains/set-up-custom-domain
