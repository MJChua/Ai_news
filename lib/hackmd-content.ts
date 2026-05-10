import cache from "@/data/generated/hackmd-articles.json";

type HackmdCache = {
  generatedAt: string | null;
  source: "hackmd";
  articles: Record<
    string,
    {
      noteId: string;
      markdown: string;
      lastChangedAt?: number | null;
      fetchedAt: string;
    }
  >;
};

const hackmdCache = cache as HackmdCache;

export function getHackmdArticleBody(slug: string) {
  return hackmdCache.articles[slug] ?? null;
}
