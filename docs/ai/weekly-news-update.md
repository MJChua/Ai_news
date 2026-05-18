# Weekly News Update Procedure

This project publishes the weekly AI news batch automatically every Monday at 09:00 Asia/Taipei.

GitHub Actions schedules use UTC, so `.github/workflows/weekly-news-production.yml` runs at `0 1 * * 1`. GitHub Actions may queue jobs for a few minutes; the schedule is the trigger time, not a hard real-time SLA.

## Automated Production Flow

1. Start from `origin/dev`.
2. Create a staging branch named `feature/renew_news_auto_<yyyymmdd>`.
3. Collect official or primary source candidates from `data/weekly-news-sources.json`.
4. Use OpenAI Responses API structured output to generate AI News Radar original article metadata and body Markdown.
5. Require at least `MIN_WEEKLY_NEWS_ITEMS` verified items. The default is `5`.
6. Write article metadata to `data/articles.json`.
7. Stage new HackMD mappings in `content/hackmd/articles.json`.
8. Stage generated body Markdown in `data/generated/hackmd-articles.json`.
9. Run `npm run hackmd:push`, `npm run hackmd:pull`, and `npm run hackmd:check`.
10. Run `npm run lint` and `npm run build`.
11. Push the staging branch and wait for Vercel Preview.
12. Smoke check the Preview homepage and latest article detail route.
13. Push the validated commit to `dev` and `production`.

If any step fails, the workflow must not push `dev` or `production`. It opens a GitHub issue for manual follow-up.

## Time Window

- Default update day: Monday.
- Default timezone: Asia/Taipei.
- Content window: previous Monday 00:00 through Sunday 23:59:59.
- `weeklyIssueDate` is the Sunday at the end of the content window.
- If a source was published outside the window, include it only when a future explicit rule supports corrections or follow-ups. The current automation rejects out-of-window sources.

## Source Priority

Use sources in this order:

1. Official company/project news, changelog, docs, or release notes.
2. Primary project sources such as repository releases.

Do not use secondary media in the automated production workflow unless the source policy is deliberately expanded later.

Do not use social rumors, unsupported forum posts, AI-generated guesses, or open-ended search results as article facts.

## Weekly Selection

- Target 8-10 verified items when enough official or primary sources exist.
- Minimum production threshold: 5 verified items.
- Around 50% should cover AI technology and AI tools.
- At least 45% should cover software engineering, frontend engineering, developer tools, SDKs, IDEs, CI/CD, or agentic coding.
- At least one item should cover broader AI issues such as safety, policy, research, security, or industry movement when supported by official sources.

If fewer than the minimum number of verified items exists, publish nothing and keep the previous production content.

## Data Entry Rules

Each item in `data/articles.json` must include metadata:

- `eventDate`
- `publishedDate`
- `checkedAt`
- `weeklyIssueDate`
- `sources[].name`
- `sources[].url`
- `sources[].publishedDate`
- `sources[].sourceType`
- `coverageBuckets`
- `verificationNote`

Each item in `content/hackmd/articles.json` must include:

- `slug`
- `title`
- `weeklyIssueDate`
- `hackmdNoteId`
- `status`

The `verificationNote` must state what the source supports and what was not inferred.

## HackMD Body Workflow

1. The automation writes AI News Radar original body text, not copied third-party full articles.
2. Each article maps to one HackMD note.
3. `npm run hackmd:push` creates or updates HackMD notes and the HackMD index note.
4. `npm run hackmd:pull` refreshes `data/generated/hackmd-articles.json`.
5. `npm run hackmd:check` validates manifest, generated body sections, dates, and sources.

Expected note sections:

```md
# Title

## 正文

### 背景

### 本次更新重點

### 對 AI / 工具 / 工程的影響

### 限制與待確認事項

## 來源與校對
```

## Manual Modes

Use `workflow_dispatch` on `weekly-news-production.yml`:

- `dry-run`: collect candidates and run self-tests without writing files.
- `staging-branch`: generate content, sync HackMD, validate, commit, and push only the staging branch.
- `publish`: run the full production flow.

Use `staging-branch` before `publish` when changing source policy, prompt behavior, or validation rules.
