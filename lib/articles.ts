export type ArticleCategory =
  | "前端與開發工具"
  | "AI 模型與平台"
  | "產品發布"
  | "公司與產業動態"
  | "比較分析";

export type Source = {
  name: string;
  url: string;
  publishedDate: string;
};

export type Article = {
  slug: string;
  title: string;
  summary: string;
  category: ArticleCategory;
  eventDate: string;
  publishedDate: string;
  frontendRelevance: "高" | "中" | "低";
  comparisonTargets: string[];
  sources: Source[];
  verificationNote: string;
  keyPoints: string[];
};

export const categories = [
  { id: "frontend", label: "前端與開發工具" },
  { id: "models", label: "模型比較" },
  { id: "products", label: "全部文章" },
] as const;

export const articles = [
  {
    slug: "openai-gpt-51-developers",
    title: "OpenAI 發布 GPT-5.1，強調編碼體驗與回應效率",
    summary:
      "GPT-5.1 面向 API 開發者推出，重點放在自適應推理、低延遲模式、較好的編碼行為，以及 Responses API 的 apply_patch 與 shell 工具。",
    category: "AI 模型與平台",
    eventDate: "2025-11-13",
    publishedDate: "2025-11-13",
    frontendRelevance: "高",
    comparisonTargets: ["GPT-5", "Claude 4", "Gemini 2.5 Pro"],
    sources: [
      {
        name: "OpenAI",
        url: "https://openai.com/index/gpt-5-1-for-developers/",
        publishedDate: "2025-11-13",
      },
    ],
    verificationNote:
      "以 OpenAI 官方發布頁為準；頁面明列日期、API 可用性、編碼能力與新工具說明。",
    keyPoints: [
      "適合追蹤 AI 輔助開發、程式碼修改與 agentic coding 工作流。",
      "和 GPT-5 相比，官方重點放在更動態的推理時間與較快的簡單任務回應。",
      "前端關聯高，因官方明確提到更 functional 的 frontend designs 與程式碼品質。",
    ],
  },
  {
    slug: "gemini-25-pro-web-apps",
    title: "Google 更新 Gemini 2.5 Pro Preview，主打互動式 Web App 能力",
    summary:
      "Google 在 I/O 前提前釋出 Gemini 2.5 Pro Preview 更新，明確把 coding 與 rich interactive web apps 作為主要改善方向。",
    category: "前端與開發工具",
    eventDate: "2025-05-06",
    publishedDate: "2025-05-06",
    frontendRelevance: "高",
    comparisonTargets: ["GPT-5.1", "Claude Sonnet 4", "Vercel AI SDK 5"],
    sources: [
      {
        name: "Google The Keyword",
        url: "https://blog.google/products-and-platforms/products/gemini/gemini-2-5-pro-updates/",
        publishedDate: "2025-05-06",
      },
    ],
    verificationNote:
      "以 Google 官方 The Keyword 文章為準；標題與內文直接指向互動式 Web App 與 coding 改善。",
    keyPoints: [
      "適合放在前端開發工具觀察欄位。",
      "可和其他 coding model 比較 UI 生成、程式碼修改、agent workflow 能力。",
      "目前資料只採官方發布內容，不延伸推測實測排名。",
    ],
  },
  {
    slug: "anthropic-claude-4-coding-agents",
    title: "Anthropic 發布 Claude 4，強調長任務編碼與 AI agents",
    summary:
      "Claude Opus 4 與 Sonnet 4 發布，官方將 coding、advanced reasoning、AI agents 作為核心定位，同時宣布 Claude Code 正式可用。",
    category: "AI 模型與平台",
    eventDate: "2025-05-22",
    publishedDate: "2025-05-22",
    frontendRelevance: "中",
    comparisonTargets: ["GPT-5.1", "Gemini 2.5 Pro", "Claude Code"],
    sources: [
      {
        name: "Anthropic",
        url: "https://www.anthropic.com/news/claude-4",
        publishedDate: "2025-05-22",
      },
    ],
    verificationNote:
      "以 Anthropic 官方新聞稿為準；頁面列出 Claude 4 發布日期、模型定位與 Claude Code 狀態。",
    keyPoints: [
      "重點是長時間、多步驟的程式任務與 agent workflow。",
      "前端關聯屬中等，較偏通用軟體工程與 IDE/CLI 工作流。",
      "可和 OpenAI、Google 的 coding model 更新放在同一比較表。",
    ],
  },
  {
    slug: "vercel-ai-sdk-5",
    title: "Vercel AI SDK 5 發布，強化型別安全聊天與 agent loop 控制",
    summary:
      "AI SDK 5 面向 TypeScript/JavaScript 全端應用，推出 redesigned chat、agentic loop control、工具改善與跨框架 UI 整合。",
    category: "前端與開發工具",
    eventDate: "2025-07-31",
    publishedDate: "2025-07-31",
    frontendRelevance: "高",
    comparisonTargets: ["React", "Vue", "Svelte", "Angular", "OpenAI API"],
    sources: [
      {
        name: "Vercel",
        url: "https://vercel.com/blog/ai-sdk-5",
        publishedDate: "2025-07-31",
      },
    ],
    verificationNote:
      "以 Vercel 官方部落格為準；文章標明日期並說明 AI SDK 5 對 TypeScript、聊天 UI 與 agent loop 的更新。",
    keyPoints: [
      "前端關聯最高，直接影響 React/Vue/Svelte/Angular AI 應用開發。",
      "適合和模型發布區分：這是應用層 SDK，而不是模型本身。",
      "可作為後續本站若加入 AI 搜尋或摘要功能的技術候選。",
    ],
  },
] satisfies Article[];

export const featuredArticle = articles[0];
export const recentArticles = articles.slice(0, 4);
export const frontendArticles = articles.filter(
  (article) => article.frontendRelevance === "高",
);

export const comparisons = [
  {
    name: "GPT-5.1",
    strength: "偏向通用 agentic coding、工具呼叫與快速迭代體驗。",
    bestFor: "需要模型協助跨檔案修改、分析與前端生成的工作流。",
    watch: "實際品質仍需依專案測試，不只看官方 benchmark。",
  },
  {
    name: "Gemini 2.5 Pro Preview",
    strength: "官方明確凸顯互動式 Web App 與 coding 改善。",
    bestFor: "探索 UI 生成、原型設計與多模態開發情境。",
    watch: "Preview 版本可能有可用性或行為變動。",
  },
  {
    name: "Claude 4",
    strength: "強調長時間、多步驟任務與 agent workflow。",
    bestFor: "大型重構、程式理解、長上下文工程任務。",
    watch: "前端生成只是整體 coding 能力的一部分，需另做 UI 實測。",
  },
] as const;

export function getArticle(slug: string) {
  return articles.find((article) => article.slug === slug);
}
