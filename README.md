# AI News Radar

AI News Radar 是一個深色系 AI 新聞資訊站，使用 Next.js App Router、React、TypeScript 與 Tailwind CSS 建置。內容以人工整理為主，每則文章都保留事件日期、發布日期、來源與校對備註。

## Getting Started

Install dependencies and run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Quality Checks

```bash
npm run lint
npm run build
```

## Development Workflow

Branching and sprint rules are documented in [DEVELOPMENT.md](./DEVELOPMENT.md).

Current branch policy:

- `master`: project bootstrap and base branch.
- `dev`: daily integration branch.
- `feature/<name>` and `bug/<name>`: created from `dev`.
- `sit`: weekly sprint integration branch.
- `production`: reserved until a dedicated domain and release flow are ready.

## Key Files

- `app/page.tsx`: homepage layout.
- `app/articles/[slug]/page.tsx`: article detail page.
- `lib/articles.ts`: typed article data and comparison data.
- `.github/workflows/weekly-sit-merge.yml`: weekly `dev` to `sit` merge automation.

