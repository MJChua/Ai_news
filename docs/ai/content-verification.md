# Content Verification Rules

This project publishes manually curated AI news and comparison notes. Accuracy matters more than completeness.

## Required Article Fields

Each article in `lib/articles.ts` must include:

- `title`
- `summary`
- `category`
- `eventDate`
- `publishedDate`
- `frontendRelevance`
- `comparisonTargets`
- `sources`
- `verificationNote`
- `keyPoints`

Each source must include:

- `name`
- `url`
- `publishedDate`

## Source Rules

- Prefer official or primary sources, such as company blogs, release notes, official docs, standards bodies, or source repositories.
- If using media coverage, treat it as secondary and avoid presenting it as the primary fact source.
- Do not add claims that are not supported by the linked sources.
- Do not infer benchmark rankings, product availability, pricing, or release scope unless the source explicitly supports it.
- For recent AI news, verify the current date and publication date before adding content.

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

