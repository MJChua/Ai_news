import articleData from "@/data/articles.json";

export type ArticleCategory =
  | "前端與開發工具"
  | "AI 模型與平台"
  | "產品發布"
  | "公司與產業動態"
  | "比較分析";

export type FrontendRelevance = "高" | "中" | "低";

export type CoverageBucket =
  | "ai-tech-tools"
  | "software-frontend-engineering"
  | "ai-issue";

export type SourceType = "official" | "primary" | "secondary";

export type Source = {
  name: string;
  url: string;
  publishedDate: string;
  sourceType: SourceType;
};

export type Article = {
  slug: string;
  title: string;
  summary: string;
  category: ArticleCategory;
  eventDate: string;
  publishedDate: string;
  checkedAt: string;
  weeklyIssueDate: string;
  frontendRelevance: FrontendRelevance;
  coverageBuckets: CoverageBucket[];
  comparisonTargets: string[];
  sources: Source[];
  verificationNote: string;
  keyPoints: string[];
};

export type CategoryFilter = {
  id: string;
  label: ArticleCategory | "AI 議題" | "近期資料";
};

export type Comparison = {
  name: string;
  strength: string;
  bestFor: string;
  watch: string;
};

export const categories = articleData.categories as CategoryFilter[];

export const coverageBucketLabels =
  articleData.coverageBucketLabels as Record<CoverageBucket, string>;

export const sourceTypeLabels =
  articleData.sourceTypeLabels as Record<SourceType, string>;

export const weeklyCoverageRules = articleData.weeklyCoverageRules;

export const articles = articleData.articles as Article[];

export const sortedArticles = [...articles].sort((a, b) => {
  return b.publishedDate.localeCompare(a.publishedDate);
});

export const featuredArticle = sortedArticles[0];
export const recentArticles = sortedArticles.slice(0, 4);
export const frontendArticles = sortedArticles.filter((article) =>
  article.coverageBuckets.includes("software-frontend-engineering"),
);

export const comparisons = articleData.comparisons as Comparison[];

export function getArticle(slug: string) {
  return articles.find((article) => article.slug === slug);
}
