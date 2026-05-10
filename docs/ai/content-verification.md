# Content Verification Rules

This project publishes manually curated AI news and comparison notes. Accuracy matters more than completeness.

## Required Article Fields

Each article in `lib/articles.ts` must include:

- `title`
- `summary`
- `category`
- `eventDate`
- `publishedDate`
- `checkedAt`
- `weeklyIssueDate`
- `frontendRelevance`
- `coverageBuckets`
- `comparisonTargets`
- `sources`
- `verificationNote`
- `keyPoints`

Article body Markdown is stored in HackMD, not in `lib/articles.ts`.

Each source must include:

- `name`
- `url`
- `publishedDate`
- `sourceType`

Supported `sourceType` values:

- `official`: company or project official site, official changelog, official docs, or official release notes.
- `primary`: first-party source that is not the main official site, such as a source repository release.
- `secondary`: reputable media or analysis used only as supporting context.

## HackMD Body Rules

- HackMD stores AI News Radar original body text, not copied third-party full articles.
- Each article maps to one HackMD note through `content/hackmd/articles.json`.
- The HackMD index note maps `slug -> hackmdNoteId`.
- `npm run hackmd:pull` writes the generated cache used by article pages.
- `npm run hackmd:check` must fail if a note id, body section, source, or date is missing.
- The generated cache is not the editorial source of truth; update HackMD first, then pull.

## Source Rules

- Prefer official or primary sources, such as company blogs, release notes, official docs, standards bodies, or source repositories.
- If using media coverage, treat it as secondary and avoid presenting it as the primary fact source.
- Do not add claims that are not supported by the linked sources.
- Do not infer benchmark rankings, product availability, pricing, or release scope unless the source explicitly supports it.
- For recent AI news, verify the current date and publication date before adding content.
- For weekly updates, use the previous 7 days from the Sunday update date.
- If official or primary sources do not provide enough valid items, do not fill the list with unsupported content.

## Weekly Coverage Targets

Weekly batches should usually contain 8-10 items.

Coverage is measured across the full weekly batch. A single article may count toward more than one bucket when supported by the content.

- Around 50%: AI technology and AI tools, including ChatGPT, Codex, Claude, Gemini, Grok, Copilot, model releases, and AI platforms.
- At least 45%: software engineering, frontend engineering, developer tools, frameworks, SDKs, IDEs, CI/CD, and agentic coding workflows.
- At least 2%: broader AI issues such as safety, policy, industry structure, research, security, or social impact.

## Verification Notes

`verificationNote` should briefly state:

- which source was checked,
- what fact the source supports,
- any limitation or uncertainty.

Example:

```txt
Verified against the official OpenAI release page. The page supports the release date and API availability, but no independent benchmark validation is included.
```

## Comparison Rules

- Comparisons must name the comparison target.
- Keep comparison dimensions concrete, such as coding workflow, frontend UI generation, agent workflow, latency, or integration layer.
- Do not claim one model is better overall unless a cited source and test scope support that claim.
- Clearly separate model releases from SDK/tooling releases.

## Do Not Add

- Rumors without a source.
- Undated claims.
- Source URLs that do not support the article text.
- Fake publication dates.
- Placeholder facts presented as real news.
- AI-generated summaries that have not been checked against the cited source.
- Third-party full article copies in HackMD.

