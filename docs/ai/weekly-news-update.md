# Weekly News Update Procedure

Use this procedure every Sunday when updating the latest AI news.

## Branch Rule

1. Start from `dev`.
2. Confirm the worktree is clean.
3. Create a branch named:

```txt
feature/renew_news_<english-summary>
```

Example:

```txt
feature/renew_news_ai_coding_tools_may_week2
```

## Time Window

- Default update day: Sunday.
- Default timezone: Asia/Taipei.
- Default content window: previous 7 days.
- If a source was published outside the window, include it only when it is a correction or a directly relevant follow-up to the current week.

## Source Priority

Use sources in this order:

1. Official company/project news, changelog, docs, or release notes.
2. Primary project sources such as repository releases.
3. Reputable secondary media only as supporting context.

Do not use social rumors, unsupported forum posts, or AI-generated guesses as article facts.

## Weekly Selection

- Target 8-10 verified items.
- Around 50% should cover AI technology and AI tools.
- At least 45% should cover software engineering, frontend engineering, developer tools, SDKs, IDEs, CI/CD, or agentic coding.
- At least 2% should cover broader AI issues such as safety, policy, research, security, or industry movement.
- If the verified source pool is too small, publish fewer items and explain why.

## Data Entry Rules

Each item in `lib/articles.ts` must include metadata:

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

1. Write AI News Radar original body text in HackMD.
2. Do not copy third-party full articles.
3. Keep each article as one HackMD note.
4. Update the HackMD index note through `npm run hackmd:push`.
5. Pull body Markdown with `npm run hackmd:pull`.
6. Validate mapping and body sections with `npm run hackmd:check`.

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

## PR Requirements

The pull request into `dev` must include:

- Date range.
- Number of items.
- Source list.
- Coverage bucket summary.
- Verification summary.
- Excluded notable candidates and the reason they were excluded.
- HackMD note list and index note id.
- Confirmation that `npm run lint` and `npm run build` passed.
