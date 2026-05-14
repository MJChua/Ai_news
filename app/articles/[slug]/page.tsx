import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  articles,
  getArticle,
  type Article,
  type ArticleCategory,
} from "@/lib/articles";
import { getHackmdArticleBody } from "@/lib/hackmd-content";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

type HackmdArticleBody = ReturnType<typeof getHackmdArticleBody>;

const topicHrefByCategory: Partial<Record<ArticleCategory, string>> = {
  "AI 模型與平台": "/?topic=models#archive",
  產品發布: "/?topic=tools#archive",
  前端與開發工具: "/?topic=frontend#archive",
  公司與產業動態: "/?topic=companies#archive",
};

const mentionedItemsBySlug: Record<string, string[]> = {
  "openai-codex-safety-2026-05-08": [
    "Codex",
    "執行邊界",
    "網路政策",
    "審批",
    "遙測",
  ],
};

const sourceLabelsBySlug: Record<string, string> = {
  "openai-codex-safety-2026-05-08":
    "OpenAI News：Running Codex safely at OpenAI",
};

const relatedArticleSlugsBySlug: Record<string, string[]> = {
  "openai-codex-safety-2026-05-08": [
    "github-copilot-vscode-april-2026-05-06",
    "github-copilot-cloud-agent-secrets-variables-2026-05-08",
  ],
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

  const primarySource = article.sources[0];
  const relatedArticles = getRelatedArticles(article);

  return (
    <main className="article-page">
      <article className="article">
        <Link className="back-link" href="/">
          返回首頁
        </Link>

        <header className="article-header">
          <nav className="breadcrumb" aria-label="文章分類">
            <Link href="/">首頁</Link>
            <span>/</span>
            <Link href={getCategoryHref(article.category)}>{article.category}</Link>
          </nav>

          <h1>{article.title}</h1>

          <p className="article-meta">
            <span>Date: {article.publishedDate}</span>
            <span>Source: {primarySource?.name ?? "Unknown"}</span>
            <span>Category: {article.category}</span>
          </p>

          <p className="article-dek">{article.summary}</p>
        </header>

        <section className="article-body" aria-labelledby="article-body-title">
          <h2 id="article-body-title">詳細內容</h2>

          <section>
            <h3>發布內容</h3>
            <p>{getPublicationContent(article, hackmdBody)}</p>
          </section>

          <section>
            <h3>提及項目</h3>
            <ul>
              {getMentionedItems(article).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </section>

        <section className="article-source" aria-labelledby="source-title">
          <h2 id="source-title">來源</h2>

          <ul>
            {article.sources.map((source) => (
              <li key={`${source.name}-${source.url}`}>
                <a href={source.url} rel="noreferrer" target="_blank">
                  {getSourceLabel(article, source.name)}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <footer className="article-footer">
          <section className="related-articles" aria-labelledby="related-title">
            <h2 id="related-title">相關文章</h2>

            <ul>
              {relatedArticles.map((relatedArticle) => (
                <li key={relatedArticle.slug}>
                  <Link href={`/articles/${relatedArticle.slug}`}>
                    {relatedArticle.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </footer>
      </article>
    </main>
  );
}

function getCategoryHref(category: ArticleCategory) {
  return topicHrefByCategory[category] ?? "/";
}

function getPublicationContent(article: Article, hackmdBody: HackmdArticleBody) {
  const fallback = article.summary;

  if (!hackmdBody) {
    return fallback;
  }

  const firstParagraph = hackmdBody.markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => {
      return (
        line &&
        !line.startsWith("#") &&
        !line.startsWith("- ") &&
        !line.startsWith("Checked against")
      );
    });

  return firstParagraph ?? fallback;
}

function getMentionedItems(article: Article) {
  return mentionedItemsBySlug[article.slug] ?? article.comparisonTargets;
}

function getSourceLabel(article: Article, sourceName: string) {
  return sourceLabelsBySlug[article.slug] ?? `${sourceName}：${article.title}`;
}

function getRelatedArticles(article: Article) {
  const explicitRelatedArticles = relatedArticleSlugsBySlug[article.slug]
    ?.map((slug) => getArticle(slug))
    .filter((item): item is Article => Boolean(item));

  if (explicitRelatedArticles?.length) {
    return explicitRelatedArticles;
  }

  return articles
    .filter((candidate) => {
      if (candidate.slug === article.slug) {
        return false;
      }

      return candidate.coverageBuckets.some((bucket) =>
        article.coverageBuckets.includes(bucket),
      );
    })
    .slice(0, 2);
}
