import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  articles,
  coverageBucketLabels,
  getArticle,
  sourceTypeLabels,
} from "@/lib/articles";
import { getHackmdArticleBody } from "@/lib/hackmd-content";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);

  if (!article) {
    return {
      title: "找不到文章",
    };
  }

  return {
    title: article.title,
    description: article.summary,
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticle(slug);
  const hackmdBody = getHackmdArticleBody(slug);

  if (!article) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#090b10] text-slate-100">
      <article className="mx-auto grid max-w-4xl gap-8 px-5 py-8 sm:px-8 lg:px-10">
        <Link className="text-sm text-cyan-200 hover:text-white" href="/">
          返回首頁
        </Link>

        <header className="border border-white/10 bg-[#111722] p-5 sm:p-7">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="bg-cyan-300 px-2 py-1 font-semibold text-slate-950">
              {article.category}
            </span>
            <span className="border border-white/10 px-2 py-1 text-slate-300">
              前端關聯：{article.frontendRelevance}
            </span>
          </div>
          <h1 className="mt-5 text-3xl font-semibold leading-tight text-white md:text-5xl">
            {article.title}
          </h1>
          <p className="mt-5 text-base leading-7 text-slate-300">{article.summary}</p>
        </header>

        <section className="grid gap-4 border border-white/10 bg-[#10151f] p-5 sm:grid-cols-2">
          <Detail label="事件日期" value={article.eventDate} />
          <Detail label="發布日期" value={article.publishedDate} />
          <Detail label="查證日期" value={article.checkedAt} />
          <Detail label="週期日期" value={article.weeklyIssueDate} />
          <Detail label="分類" value={article.category} />
          <Detail
            label="涵蓋範圍"
            value={article.coverageBuckets
              .map((bucket) => coverageBucketLabels[bucket])
              .join(" / ")}
          />
          <Detail label="比較對象" value={article.comparisonTargets.join(" / ")} />
        </section>

        <section className="border border-white/10 bg-[#10151f] p-5">
          <h2 className="text-2xl font-semibold text-white">正文</h2>
          {hackmdBody ? (
            <MarkdownBody markdown={hackmdBody.markdown} />
          ) : (
            <p className="mt-4 text-sm leading-6 text-slate-300">
              HackMD 正文尚未同步。請設定 `HACKMD_API_TOKEN` 後執行{" "}
              <code className="rounded bg-black/30 px-1 py-0.5 text-cyan-100">
                npm run hackmd:pull
              </code>
              。
            </p>
          )}
        </section>

        <section className="border border-white/10 bg-[#10151f] p-5">
          <h2 className="text-2xl font-semibold text-white">重點摘要</h2>
          <ul className="mt-5 grid gap-3 text-sm leading-6 text-slate-300">
            {article.keyPoints.map((point) => (
              <li className="border-l-2 border-cyan-300 pl-3" key={point}>
                {point}
              </li>
            ))}
          </ul>
        </section>

        <section className="border border-white/10 bg-[#17131f] p-5">
          <h2 className="text-2xl font-semibold text-white">來源與校對</h2>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            {article.verificationNote}
          </p>
          <div className="mt-5 grid gap-3">
            {article.sources.map((source) => (
              <a
                className="border border-white/10 p-4 text-sm text-cyan-100 transition hover:border-cyan-300"
                href={source.url}
                key={`${source.name}-${source.publishedDate}`}
                rel="noreferrer"
                target="_blank"
              >
                {source.name} / {source.publishedDate} /{" "}
                {sourceTypeLabels[source.sourceType]}
              </a>
            ))}
          </div>
        </section>
      </article>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <p className="grid gap-1">
      <span className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</span>
      <span className="text-slate-200">{value}</span>
    </p>
  );
}

function MarkdownBody({ markdown }: { markdown: string }) {
  const lines = markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className="mt-5 grid gap-4 text-sm leading-7 text-slate-300">
      {lines.map((line, index) => {
        if (line.startsWith("# ")) {
          return null;
        }

        if (line.startsWith("## ")) {
          return (
            <h3 className="mt-2 text-xl font-semibold text-white" key={`${line}-${index}`}>
              {line.replace(/^##\s+/, "")}
            </h3>
          );
        }

        if (line.startsWith("### ")) {
          return (
            <h4 className="text-base font-semibold text-cyan-100" key={`${line}-${index}`}>
              {line.replace(/^###\s+/, "")}
            </h4>
          );
        }

        if (line.startsWith("- ")) {
          return (
            <p className="border-l border-cyan-300 pl-3" key={`${line}-${index}`}>
              {line.replace(/^-\s+/, "")}
            </p>
          );
        }

        return <p key={`${line}-${index}`}>{line}</p>;
      })}
    </div>
  );
}
