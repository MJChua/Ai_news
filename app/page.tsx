import Link from "next/link";
import {
  articles,
  categories,
  comparisons,
  featuredArticle,
  frontendArticles,
  recentArticles,
} from "@/lib/articles";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#090b10] text-slate-100">
      <header className="border-b border-white/10 bg-[#0d1118]/95">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-6 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
                AI News Radar
              </p>
              <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-white md:text-6xl">
                近期 AI 發展，先查證再整理。
              </h1>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-300">
              聚焦前端技術、模型能力與產品變化；每則內容保留事件日期、發布日期、來源與校對備註，方便快速掃讀與後續追蹤。
            </p>
          </div>
          <nav className="flex flex-wrap gap-2 text-sm text-slate-300">
            {categories.map((category) => (
              <a
                className="rounded border border-white/10 px-3 py-2 transition hover:border-cyan-300 hover:text-white"
                href={`#${category.id}`}
                key={category.id}
              >
                {category.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1.35fr_0.65fr] lg:px-10">
        <section className="grid gap-5">
          <article className="border border-white/10 bg-[#111722] p-5 shadow-2xl shadow-black/30 sm:p-7">
            <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em]">
              <span className="bg-cyan-300 px-2 py-1 text-slate-950">
                主焦點
              </span>
              <span className="border border-white/10 px-2 py-1 text-slate-300">
                {featuredArticle.category}
              </span>
            </div>
            <h2 className="mt-5 text-3xl font-semibold leading-tight text-white md:text-5xl">
              {featuredArticle.title}
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
              {featuredArticle.summary}
            </p>
            <div className="mt-6 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
              <Info label="事件日期" value={featuredArticle.eventDate} />
              <Info label="發布日期" value={featuredArticle.publishedDate} />
              <Info label="前端關聯" value={featuredArticle.frontendRelevance} />
            </div>
            <Link
              className="mt-7 inline-flex items-center border border-cyan-300 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300 hover:text-slate-950"
              href={`/articles/${featuredArticle.slug}`}
            >
              閱讀校對紀錄
            </Link>
          </article>

          <section id="frontend" className="grid gap-4">
            <SectionTitle eyebrow="Front-end Signal" title="前端技術相關重點" />
            <div className="grid gap-4 md:grid-cols-2">
              {frontendArticles.map((article) => (
                <ArticleCard article={article} key={article.slug} />
              ))}
            </div>
          </section>
        </section>

        <aside className="grid content-start gap-5">
          <section className="border border-white/10 bg-[#10151f] p-5">
            <SectionTitle eyebrow="Latest" title="近期 AI 動態" />
            <div className="mt-5 grid gap-4">
              {recentArticles.map((article) => (
                <Link
                  className="group grid gap-2 border-b border-white/10 pb-4 last:border-b-0 last:pb-0"
                  href={`/articles/${article.slug}`}
                  key={article.slug}
                >
                  <span className="text-xs text-slate-400">
                    {article.publishedDate} / {article.category}
                  </span>
                  <span className="text-base font-semibold leading-6 text-white group-hover:text-cyan-200">
                    {article.title}
                  </span>
                  <span className="text-sm leading-6 text-slate-400">
                    {article.summary}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section className="border border-white/10 bg-[#17131f] p-5">
            <SectionTitle eyebrow="Checklist" title="上站前校對要求" />
            <ul className="mt-5 grid gap-3 text-sm leading-6 text-slate-300">
              <li>必填事件日期與發布日期。</li>
              <li>至少一個可追溯來源連結。</li>
              <li>校對備註需說明採用來源與限制。</li>
              <li>與其他 AI 比較時標示比較維度。</li>
            </ul>
          </section>
        </aside>
      </div>

      <section className="border-y border-white/10 bg-[#0d1118]" id="models">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          <SectionTitle eyebrow="Comparison" title="AI 產品與模型比較" />
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {comparisons.map((item) => (
              <article className="border border-white/10 bg-[#111722] p-5" key={item.name}>
                <h3 className="text-xl font-semibold text-white">{item.name}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{item.strength}</p>
                <div className="mt-5 grid gap-3 text-sm">
                  <Info label="適合場景" value={item.bestFor} />
                  <Info label="注意事項" value={item.watch} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10" id="products">
        <SectionTitle eyebrow="Archive" title="全部文章" />
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard article={article} key={article.slug} />
          ))}
        </div>
      </section>
    </main>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-2xl font-semibold text-white">{title}</h2>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <p className="grid gap-1">
      <span className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</span>
      <span className="text-slate-200">{value}</span>
    </p>
  );
}

function ArticleCard({ article }: { article: (typeof articles)[number] }) {
  return (
    <Link
      className="group grid min-h-64 content-between border border-white/10 bg-[#10151f] p-5 transition hover:border-cyan-300 hover:bg-[#121b29]"
      href={`/articles/${article.slug}`}
    >
      <div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="border border-white/10 px-2 py-1 text-slate-300">
            {article.category}
          </span>
          <span className="bg-[#3b2f16] px-2 py-1 text-amber-100">
            {article.frontendRelevance}
          </span>
        </div>
        <h3 className="mt-4 text-xl font-semibold leading-7 text-white group-hover:text-cyan-200">
          {article.title}
        </h3>
        <p className="mt-3 text-sm leading-6 text-slate-400">{article.summary}</p>
      </div>
      <p className="mt-5 text-xs text-slate-500">
        {article.publishedDate} / {article.sources[0].name}
      </p>
    </Link>
  );
}
