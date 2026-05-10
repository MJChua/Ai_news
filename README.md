# AI News Radar

AI News Radar is a dark, readable AI news and comparison site built with Next.js App Router, React, TypeScript, and Tailwind CSS.

The first version uses manually curated local article data. Each article must keep event date, published date, source name, source URL, and verification note.

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality Checks

```bash
npm run lint
npm run build
```

## Development Workflow

Branching and sprint rules are documented in [DEVELOPMENT.md](./DEVELOPMENT.md).

Current branch policy:

- `master`: project bootstrap and baseline branch.
- `dev`: daily integration branch.
- `feature/<name>` and `bug/<name>`: created from `dev`.
- `sit`: weekly sprint integration branch.
- `production`: reserved until a dedicated domain and release flow are ready.

## AI And Engineering Guidance

- [AGENTS.md](./AGENTS.md): short operational rules for AI coding agents.
- [docs/ai/agent-working-patterns.md](./docs/ai/agent-working-patterns.md): detailed work routine and scope control.
- [docs/ai/content-verification.md](./docs/ai/content-verification.md): article source and verification rules.

## Key Files

- `app/page.tsx`: homepage layout.
- `app/articles/[slug]/page.tsx`: article detail page.
- `lib/articles.ts`: typed article data and comparison data.
- `.github/workflows/weekly-sit-merge.yml`: weekly `dev` to `sit` merge automation.

