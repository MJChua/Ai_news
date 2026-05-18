import Link from "next/link";
import MobileShowMore from "./mobile-show-more";
import SearchToast from "./search-toast";
import { sortedArticles, type Article } from "@/lib/articles";

type HomeProps = {
  searchParams?: Promise<{
    q?: string | string[];
    topic?: string | string[];
  }>;
};

type TopicKey =
  | "models"
  | "tools"
  | "ai-coding"
  | "frontend"
  | "companies"
  | "security"
  | "openai"
  | "anthropic"
  | "github-copilot"
  | "agent";

const categoryLinks: { topic: TopicKey; label: string }[] = [
  { topic: "models", label: "模型更新" },
  { topic: "tools", label: "AI 工具" },
  { topic: "ai-coding", label: "AI Coding" },
  { topic: "frontend", label: "前端工程" },
  { topic: "companies", label: "產業動態" },
  { topic: "security", label: "AI 資安" },
];

const topicLabels = new Map<TopicKey, string>([
  ["models", "模型更新"],
  ["tools", "AI 工具"],
  ["ai-coding", "AI Coding"],
  ["frontend", "前端工程"],
  ["companies", "產業動態"],
  ["security", "AI 資安"],
  ["openai", "OpenAI"],
  ["anthropic", "Anthropic"],
  ["github-copilot", "GitHub Copilot"],
  ["agent", "Agent"],
]);

export default async function Home({ searchParams }: HomeProps) {
  const params = (await searchParams) ?? {};
  const query = readSearchParam(params.q);
  const selectedTopic = readTopicParam(params.topic);
  const featuredArticle = sortedArticles[0];
  const categoryArticles = getCategoryArticles(featuredArticle);
  const recentNews = getRecentNews([featuredArticle, ...categoryArticles]);
  const archiveArticles = filterArticles(sortedArticles, query, selectedTopic);
  const hasFilter = Boolean(query || selectedTopic);
  const resultSummary = hasFilter
    ? getSearchResultSummary(query, selectedTopic, archiveArticles.length)
    : "";
  const toastMessage = hasFilter ? getSearchToastMessage(archiveArticles.length) : "";

  return (
    <main className="home-page" id="top">
      {toastMessage ? <SearchToast key={toastMessage} message={toastMessage} /> : null}

      <header className="hero">
        <p className="hero__brand">AI News Radar</p>

        <h1>AI 最新資訊與趨勢</h1>

        <p className="hero__description">
          包含 AI 模型、AI 工具、AI Coding、前端工程與產業動態。
        </p>

        <form action="/#archive" className="site-search" method="get" role="search">
          <label htmlFor="site-search">搜尋文章</label>
          <input
            defaultValue={query}
            id="site-search"
            name="q"
            type="search"
            placeholder="搜尋 OpenAI、Claude、GitHub Copilot、AI Coding..."
          />
          {selectedTopic ? (
            <input name="topic" type="hidden" value={selectedTopic} />
          ) : null}
          <button type="submit">搜尋</button>
        </form>

        {resultSummary ? (
          <p className="search-status" role="status">
            {resultSummary}
          </p>
        ) : null}
      </header>

      <nav className="category-nav" aria-label="文章分類">
        <ul>
          {categoryLinks.map((link) => (
            <li key={link.topic}>
              <Link
                aria-current={selectedTopic === link.topic ? "page" : undefined}
                href={getTopicHref(link.topic)}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <section className="latest-articles" aria-labelledby="latest-articles-title">
        <h2 id="latest-articles-title">最新文章</h2>

        <MobileShowMore className="news-grid" limit={1}>
          <NewsCard article={featuredArticle} isPrimary showSource />
        </MobileShowMore>
      </section>

      <section className="category-articles" aria-labelledby="category-articles-title">
        <h2 id="category-articles-title">分類文章</h2>

        <MobileShowMore className="news-grid" limit={2}>
          {categoryArticles.map((article) => (
            <NewsCard article={article} showSource key={article.slug} />
          ))}
        </MobileShowMore>
      </section>

      <section className="recent-news" aria-labelledby="recent-news-title">
        <h2 id="recent-news-title">近期 AI 動態</h2>

        <MobileShowMore as="ol" className="recent-news-list" limit={3}>
          {recentNews.map((article) => (
            <li key={article.slug}>
              <article>
                <Link href={`/articles/${article.slug}`}>
                  <time dateTime={article.publishedDate}>{article.publishedDate}</time>
                  <span>{article.title}</span>
                </Link>
              </article>
            </li>
          ))}
        </MobileShowMore>
      </section>

      <section className="archive" aria-labelledby="archive-title" id="archive">
        <div className="archive__header">
          <div>
            <h2 id="archive-title">{hasFilter ? "篩選結果" : "全部文章"}</h2>
            {hasFilter ? (
              <p>
                {getFilterLabel(query, selectedTopic)}，共 {archiveArticles.length} 篇。
              </p>
            ) : null}
          </div>
          {hasFilter ? <Link href="/#archive">清除篩選</Link> : null}
        </div>

        {archiveArticles.length > 0 ? (
          <MobileShowMore className="archive-grid" limit={3}>
            {archiveArticles.map((article) => (
              <NewsCard article={article} key={article.slug} />
            ))}
          </MobileShowMore>
        ) : (
          <p className="archive__empty">沒有符合條件的文章。</p>
        )}
      </section>

    </main>
  );
}

function readSearchParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}

function readTopicParam(value: string | string[] | undefined) {
  const topic = readSearchParam(value);

  if (topicLabels.has(topic as TopicKey)) {
    return topic as TopicKey;
  }

  return "";
}

function filterArticles(articleList: Article[], query: string, topic: TopicKey | "") {
  return articleList.filter((article) => {
    const matchesQuery = query ? getSearchText(article).includes(normalize(query)) : true;
    const matchesTopic = topic ? topicMatchesArticle(article, topic) : true;

    return matchesQuery && matchesTopic;
  });
}

function getCategoryArticles(featuredArticle: Article) {
  return fillFromLatest(
    sortedArticles.filter((article) => {
      return (
        article.slug !== featuredArticle.slug &&
        article.coverageBuckets.includes("software-frontend-engineering")
      );
    }),
    new Set([featuredArticle.slug]),
    2,
  );
}

function getRecentNews(excludedArticles: Article[]) {
  return fillFromLatest(
    sortedArticles.filter((article) => {
      return !excludedArticles.some((excluded) => excluded.slug === article.slug);
    }),
    new Set(excludedArticles.map((article) => article.slug)),
    3,
  );
}

function fillFromLatest(
  preferredArticles: Article[],
  excludedSlugs: Set<string>,
  limit: number,
) {
  const selected = preferredArticles.slice(0, limit);
  const selectedSlugs = new Set(selected.map((article) => article.slug));

  if (selected.length >= limit) {
    return selected;
  }

  for (const article of sortedArticles) {
    if (selected.length >= limit) break;
    if (excludedSlugs.has(article.slug) || selectedSlugs.has(article.slug)) continue;

    selected.push(article);
    selectedSlugs.add(article.slug);
  }

  return selected;
}

function topicMatchesArticle(article: Article, topic: TopicKey) {
  const searchText = getSearchText(article);

  switch (topic) {
    case "models":
      return article.category === "AI 模型與平台";
    case "tools":
      return article.coverageBuckets.includes("ai-tech-tools") || article.category === "產品發布";
    case "ai-coding":
      return hasAny(searchText, ["ai coding", "codex", "copilot", "agentic coding"]);
    case "frontend":
      return (
        article.coverageBuckets.includes("software-frontend-engineering") ||
        article.category === "前端與開發工具"
      );
    case "companies":
      return article.category === "公司與產業動態";
    case "security":
      return hasAny(searchText, ["資安", "安全", "security", "secret", "cyber", "safety"]);
    case "openai":
      return hasAny(searchText, ["openai", "chatgpt", "codex", "gpt"]);
    case "anthropic":
      return hasAny(searchText, ["anthropic", "claude"]);
    case "github-copilot":
      return hasAny(searchText, ["github copilot", "copilot"]);
    case "agent":
      return hasAny(searchText, ["agent", "agents", "agentic"]);
  }
}

function hasAny(text: string, needles: string[]) {
  return needles.some((needle) => text.includes(normalize(needle)));
}

function getSearchText(article: Article) {
  return normalize(
    [
      article.title,
      article.summary,
      article.category,
      article.frontendRelevance,
      ...article.comparisonTargets,
      ...article.coverageBuckets,
      ...article.keyPoints,
      ...article.sources.map((source) => source.name),
    ].join(" "),
  );
}

function normalize(value: string) {
  return value.toLocaleLowerCase("en-US").trim();
}

function getTopicHref(topic: TopicKey) {
  return `/?topic=${encodeURIComponent(topic)}#archive`;
}

function getFilterLabel(query: string, topic: TopicKey | "") {
  const parts = [];

  if (query) {
    parts.push(`搜尋「${query}」`);
  }

  if (topic) {
    parts.push(`主題「${topicLabels.get(topic)}」`);
  }

  return parts.join("、");
}

function getSearchResultSummary(query: string, topic: TopicKey | "", resultCount: number) {
  const filterLabel = getFilterLabel(query, topic);

  if (resultCount === 0) {
    return `沒有符合條件的文章：${filterLabel}。`;
  }

  return `已套用搜尋：${filterLabel}，共 ${resultCount} 篇結果。`;
}

function getSearchToastMessage(resultCount: number) {
  if (resultCount === 0) {
    return "沒有符合條件的文章";
  }

  return `已套用搜尋，找到 ${resultCount} 篇文章`;
}

function NewsCard({
  article,
  isPrimary = false,
  showSource = false,
}: {
  article: Article;
  isPrimary?: boolean;
  showSource?: boolean;
}) {
  return (
    <article className={isPrimary ? "news-card news-card--primary" : "news-card"}>
      <Link href={`/articles/${article.slug}`}>
        <p className="news-card__meta">{getArticleMeta(article, showSource)}</p>

        <h3>{article.title}</h3>

        <p>{article.summary}</p>
      </Link>
    </article>
  );
}

function getArticleMeta(article: Article, showSource: boolean) {
  const sourceName = article.sources[0]?.name ?? "Unknown";

  if (showSource) {
    return `${article.category}・${sourceName}・${article.publishedDate}`;
  }

  return `${article.category}・${article.publishedDate}`;
}
