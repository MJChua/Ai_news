import { existsSync, readFileSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const articlesDataPath = path.join(root, "data", "articles.json");
const generatedPath = path.join(root, "data", "generated", "hackmd-articles.json");
const manifestPath = path.join(root, "content", "hackmd", "articles.json");
const sourcesPath = path.join(root, "data", "weekly-news-sources.json");

const taipeiOffsetMs = 8 * 60 * 60 * 1000;
const dayMs = 24 * 60 * 60 * 1000;
const defaultModel = "gpt-4o-mini";
const defaultMinimumItems = 5;
const maxArticles = 10;
const maxCandidates = 24;

const articleCategories = [
  "前端與開發工具",
  "AI 模型與平台",
  "產品發布",
  "公司與產業動態",
  "比較分析",
];

const frontendRelevanceValues = ["高", "中", "低"];
const coverageBuckets = [
  "ai-tech-tools",
  "software-frontend-engineering",
  "ai-issue",
];
const sourceTypes = ["official", "primary"];

const requiredSections = [
  "## 正文",
  "### 背景",
  "### 本次更新重點",
  "### 對 AI / 工具 / 工程的影響",
  "### 限制與待確認事項",
  "## 來源與校對",
];

async function main() {
  loadLocalEnv();

  const { command, options } = parseCli(process.argv.slice(2));
  if (command === "self-test") {
    runSelfTest();
    return;
  }

  if (!["dry-run", "run"].includes(command)) {
    fail("Usage: node scripts/weekly-news.mjs <dry-run|run|self-test> [--date=YYYY-MM-DD] [--fixture=path]");
  }

  const window = getPreviousTaipeiWeekWindow(options.date);
  const articleData = await readJson(articlesDataPath);
  const existing = getExistingState(articleData);
  const minimumItems = getMinimumItems();
  const candidates = options.fixture
    ? await readJson(path.resolve(root, options.fixture))
    : await collectCandidates(window);
  const eligibleCandidates = filterCandidates(candidates, window, existing);

  printCandidateSummary(window, candidates, eligibleCandidates, minimumItems);

  if (command === "dry-run") {
    return;
  }

  if (eligibleCandidates.length < minimumItems) {
    fail(`Only ${eligibleCandidates.length} eligible official/primary candidates found; minimum is ${minimumItems}.`);
  }

  const generated = await generateArticles(eligibleCandidates, window, minimumItems);
  const validArticles = validateGeneratedArticles(generated.articles, {
    candidates: eligibleCandidates,
    existing,
    minimumItems,
    window,
  });

  await writeWeeklyUpdate(validArticles, articleData, window);
  console.log(`Prepared ${validArticles.length} weekly articles for ${window.weeklyIssueDate}.`);
}

function parseCli(args) {
  const [command = "dry-run", ...rest] = args;
  const options = {};

  for (const arg of rest) {
    if (arg.startsWith("--date=")) options.date = arg.slice("--date=".length);
    if (arg.startsWith("--fixture=")) options.fixture = arg.slice("--fixture=".length);
  }

  return { command, options };
}

function loadLocalEnv() {
  for (const fileName of [".env.local", ".env"]) {
    const envPath = path.join(root, fileName);
    if (!existsSync(envPath)) continue;
    const text = readFileSync(envPath, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const index = trimmed.indexOf("=");
      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function writeJson(filePath, data) {
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function getMinimumItems() {
  const value = Number.parseInt(process.env.MIN_WEEKLY_NEWS_ITEMS ?? "", 10);
  return Number.isInteger(value) && value > 0 ? value : defaultMinimumItems;
}

function getPreviousTaipeiWeekWindow(dateOption) {
  const localParts = dateOption
    ? parseLocalDateOption(dateOption)
    : getTaipeiDateParts(new Date());
  const localTodayMs = Date.UTC(localParts.year, localParts.month - 1, localParts.day);
  const dayOfWeek = new Date(localTodayMs).getUTCDay();
  const daysSinceMonday = (dayOfWeek + 6) % 7;
  const currentMondayLocalMs = localTodayMs - daysSinceMonday * dayMs;
  const previousMondayLocalMs = currentMondayLocalMs - 7 * dayMs;
  const previousSundayLocalMs = previousMondayLocalMs + 6 * dayMs;

  return {
    startLocalDate: formatLocalDate(previousMondayLocalMs),
    endLocalDate: formatLocalDate(previousSundayLocalMs),
    weeklyIssueDate: formatLocalDate(previousSundayLocalMs),
    startUtc: new Date(previousMondayLocalMs - taipeiOffsetMs),
    endUtc: new Date(previousMondayLocalMs + 7 * dayMs - 1 - taipeiOffsetMs),
  };
}

function parseLocalDateOption(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) fail(`Invalid --date value: ${value}. Use YYYY-MM-DD.`);
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

function getTaipeiDateParts(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Taipei",
    year: "numeric",
  }).formatToParts(date);
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
  };
}

function formatLocalDate(localUtcMs) {
  const date = new Date(localUtcMs);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function collectCandidates(window) {
  const sourceConfig = await readJson(sourcesPath);
  const allCandidates = [];

  for (const source of sourceConfig.sources) {
    try {
      const sourceCandidates = source.format === "rss"
        ? await collectRssCandidates(source)
        : await collectHtmlCandidates(source);
      allCandidates.push(...sourceCandidates);
    } catch (error) {
      console.warn(`Skipping ${source.name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  const filtered = allCandidates
    .map((candidate) => normalizeCandidate(candidate))
    .filter((candidate) => candidate.title && candidate.url && candidate.publishedDate)
    .filter((candidate) => isWithinWindow(candidate.publishedDate, window))
    .filter((candidate) => matchesSourceKeywords(candidate))
    .sort((a, b) => b.publishedDate.localeCompare(a.publishedDate));

  const unique = uniqueBy(filtered, (candidate) => candidate.url);
  const withContent = [];
  for (const candidate of unique.slice(0, maxCandidates)) {
    withContent.push(await hydrateCandidateContent(candidate));
  }

  return withContent;
}

async function collectRssCandidates(source) {
  const xml = await fetchText(source.url);
  const blocks = matchBlocks(xml, "item");
  const atomBlocks = blocks.length > 0 ? [] : matchBlocks(xml, "entry");
  const entries = blocks.length > 0 ? blocks : atomBlocks;

  return entries.map((entry) => {
    const title = decodeXml(stripTags(readTag(entry, "title")));
    const link = blocks.length > 0
      ? decodeXml(stripTags(readTag(entry, "link")))
      : decodeXml(readLinkHref(entry));
    const published = readTag(entry, "pubDate")
      || readTag(entry, "published")
      || readTag(entry, "updated")
      || readTag(entry, "dc:date");
    const excerpt = decodeXml(stripTags(
      readTag(entry, "description")
      || readTag(entry, "summary")
      || readTag(entry, "content:encoded")
      || "",
    ));

    return {
      excerpt,
      publishedDate: normalizeDate(published),
      sourceId: source.id,
      sourceName: source.name,
      sourceType: source.sourceType,
      title,
      url: absoluteUrl(link, source.url),
      keywords: source.includeKeywords ?? [],
    };
  });
}

async function collectHtmlCandidates(source) {
  const html = await fetchText(source.url);
  const candidates = [];
  const anchorPattern = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = anchorPattern.exec(html))) {
    const url = absoluteUrl(decodeXml(match[1]), source.url);
    if (!url.includes(new URL(source.url).hostname)) continue;
    const title = decodeXml(stripTags(match[2])).replace(/\s+/g, " ").trim();
    if (!title || title.length < 12) continue;
    const context = html.slice(Math.max(0, match.index - 700), match.index + 900);
    const publishedDate = normalizeDate(readDateFromText(decodeXml(stripTags(context))));
    if (!publishedDate) continue;

    candidates.push({
      excerpt: decodeXml(stripTags(context)).replace(/\s+/g, " ").trim(),
      publishedDate,
      sourceId: source.id,
      sourceName: source.name,
      sourceType: source.sourceType,
      title,
      url,
      keywords: source.includeKeywords ?? [],
    });
  }

  return uniqueBy(candidates, (candidate) => candidate.url);
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "AI-News-Radar/1.0 (+https://github.com/MJChua/Ai_news)",
    },
  });

  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`);
  }

  return response.text();
}

function matchBlocks(xml, tagName) {
  const pattern = new RegExp(`<${tagName}\\b[\\s\\S]*?<\\/${tagName}>`, "gi");
  return xml.match(pattern) ?? [];
}

function readTag(block, tagName) {
  const pattern = new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i");
  return pattern.exec(block)?.[1]?.trim() ?? "";
}

function readLinkHref(block) {
  return /<link\b[^>]*href=["']([^"']+)["'][^>]*>/i.exec(block)?.[1] ?? "";
}

function readDateFromText(text) {
  const iso = /\b(20\d{2})-(\d{2})-(\d{2})\b/.exec(text);
  if (iso) return iso[0];

  const monthNames = "Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?";
  const monthDayYear = new RegExp(`\\b(${monthNames})\\.?\\s+(\\d{1,2}),?\\s+(20\\d{2})\\b`, "i").exec(text);
  if (monthDayYear) {
    const month = monthNumber(monthDayYear[1]);
    return `${monthDayYear[3]}-${String(month).padStart(2, "0")}-${String(Number(monthDayYear[2])).padStart(2, "0")}`;
  }

  return "";
}

function normalizeDate(value) {
  if (!value) return "";
  const direct = readDateFromText(String(value));
  if (direct) return direct;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function monthNumber(monthName) {
  return {
    apr: 4,
    april: 4,
    aug: 8,
    august: 8,
    dec: 12,
    december: 12,
    feb: 2,
    february: 2,
    jan: 1,
    january: 1,
    jul: 7,
    july: 7,
    jun: 6,
    june: 6,
    mar: 3,
    march: 3,
    may: 5,
    nov: 11,
    november: 11,
    oct: 10,
    october: 10,
    sep: 9,
    september: 9,
  }[monthName.toLowerCase().replace(".", "")];
}

function decodeXml(value) {
  return String(value)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/g, "/");
}

function stripTags(value) {
  return String(value).replace(/<[^>]+>/g, " ");
}

function absoluteUrl(value, baseUrl) {
  if (!value) return "";
  try {
    return new URL(value, baseUrl).toString().replace(/#.*$/, "");
  } catch {
    return "";
  }
}

function normalizeCandidate(candidate) {
  return {
    ...candidate,
    excerpt: String(candidate.excerpt ?? "").replace(/\s+/g, " ").trim().slice(0, 1000),
    publishedDate: normalizeDate(candidate.publishedDate),
    title: String(candidate.title ?? "").replace(/\s+/g, " ").trim(),
    url: String(candidate.url ?? "").trim(),
  };
}

function isWithinWindow(dateValue, window) {
  const timestamp = new Date(`${dateValue}T12:00:00+08:00`).getTime();
  return timestamp >= window.startUtc.getTime() && timestamp <= window.endUtc.getTime();
}

function matchesSourceKeywords(candidate) {
  const haystack = `${candidate.title} ${candidate.excerpt}`.toLowerCase();
  return (candidate.keywords ?? []).some((keyword) =>
    haystack.includes(String(keyword).toLowerCase()),
  );
}

async function hydrateCandidateContent(candidate) {
  try {
    const html = await fetchText(candidate.url);
    return {
      ...candidate,
      content: stripTags(decodeXml(html)).replace(/\s+/g, " ").trim().slice(0, 4500),
    };
  } catch {
    return {
      ...candidate,
      content: candidate.excerpt,
    };
  }
}

function filterCandidates(candidates, window, existing) {
  return candidates.filter((candidate) => {
    if (!sourceTypes.includes(candidate.sourceType)) return false;
    if (!isWithinWindow(candidate.publishedDate, window)) return false;
    return !existing.sourceUrls.has(candidate.url);
  });
}

function getExistingState(articleData) {
  const sourceUrls = new Set();
  const slugs = new Set();
  for (const article of articleData.articles) {
    slugs.add(article.slug);
    for (const source of article.sources ?? []) sourceUrls.add(source.url);
  }

  return { slugs, sourceUrls };
}

function printCandidateSummary(window, candidates, eligibleCandidates, minimumItems) {
  console.log(`Weekly window: ${window.startLocalDate}..${window.endLocalDate} Asia/Taipei`);
  console.log(`Candidates found: ${candidates.length}`);
  console.log(`Eligible new official/primary candidates: ${eligibleCandidates.length}`);
  console.log(`Minimum required for publish: ${minimumItems}`);
}

async function generateArticles(candidates, window, minimumItems) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) fail("Missing OPENAI_API_KEY.");

  const model = process.env.AI_NEWS_MODEL || defaultModel;
  const selectedCandidates = candidates.slice(0, maxCandidates).map((candidate, index) => ({
    id: `candidate-${index + 1}`,
    content: candidate.content,
    excerpt: candidate.excerpt,
    publishedDate: candidate.publishedDate,
    sourceName: candidate.sourceName,
    sourceType: candidate.sourceType,
    title: candidate.title,
    url: candidate.url,
  }));

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: [
        {
          role: "system",
          content: [
            "You produce original Traditional Chinese AI news entries for AI News Radar.",
            "Use only facts supported by the supplied official or primary source candidates.",
            "Do not invent dates, availability, pricing, benchmarks, customer impact, or roadmap claims.",
            "Return only schema-valid JSON.",
          ].join(" "),
        },
        {
          role: "user",
          content: JSON.stringify({
            instructions: [
              `Select ${minimumItems}-${maxArticles} strong items when possible.`,
              "Prefer AI tools, model/platform releases, developer tooling, frontend/software engineering, security, and agentic coding.",
              "Each article must cite only one or more supplied candidate URLs.",
              "Markdown must be original AI News Radar text and include all required section headings.",
              "Do not copy third-party full articles.",
            ],
            requiredSections,
            weeklyIssueDate: window.weeklyIssueDate,
            checkedAt: window.weeklyIssueDate,
            candidates: selectedCandidates,
          }),
        },
      ],
      model,
      text: {
        format: {
          name: "weekly_ai_news_batch",
          schema: weeklyNewsSchema(),
          strict: true,
          type: "json_schema",
        },
      },
    }),
  });

  const body = await response.json();
  if (!response.ok) {
    fail(`OpenAI Responses API failed: ${response.status} ${JSON.stringify(body)}`);
  }

  const outputText = extractResponseText(body);
  if (!outputText) fail("OpenAI response did not include output text.");

  return JSON.parse(outputText);
}

function weeklyNewsSchema() {
  const sourceSchema = {
    additionalProperties: false,
    properties: {
      name: { type: "string" },
      publishedDate: { type: "string" },
      sourceType: { enum: sourceTypes, type: "string" },
      url: { type: "string" },
    },
    required: ["name", "url", "publishedDate", "sourceType"],
    type: "object",
  };

  const articleSchema = {
    additionalProperties: false,
    properties: {
      category: { enum: articleCategories, type: "string" },
      checkedAt: { type: "string" },
      comparisonTargets: { items: { type: "string" }, type: "array" },
      coverageBuckets: { items: { enum: coverageBuckets, type: "string" }, type: "array" },
      eventDate: { type: "string" },
      frontendRelevance: { enum: frontendRelevanceValues, type: "string" },
      keyPoints: { items: { type: "string" }, type: "array" },
      markdown: { type: "string" },
      publishedDate: { type: "string" },
      slug: { type: "string" },
      sources: { items: sourceSchema, type: "array" },
      summary: { type: "string" },
      title: { type: "string" },
      verificationNote: { type: "string" },
      weeklyIssueDate: { type: "string" },
    },
    required: [
      "slug",
      "title",
      "summary",
      "category",
      "eventDate",
      "publishedDate",
      "checkedAt",
      "weeklyIssueDate",
      "frontendRelevance",
      "coverageBuckets",
      "comparisonTargets",
      "sources",
      "verificationNote",
      "keyPoints",
      "markdown",
    ],
    type: "object",
  };

  return {
    additionalProperties: false,
    properties: {
      articles: { items: articleSchema, type: "array" },
      excludedCandidates: {
        items: {
          additionalProperties: false,
          properties: {
            reason: { type: "string" },
            title: { type: "string" },
            url: { type: "string" },
          },
          required: ["title", "url", "reason"],
          type: "object",
        },
        type: "array",
      },
    },
    required: ["articles", "excludedCandidates"],
    type: "object",
  };
}

function extractResponseText(body) {
  if (typeof body.output_text === "string") return body.output_text;
  for (const item of body.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && typeof content.text === "string") {
        return content.text;
      }
    }
  }
  return "";
}

function validateGeneratedArticles(articles, context) {
  if (!Array.isArray(articles)) fail("Generated articles must be an array.");
  if (articles.length < context.minimumItems) {
    fail(`Generated ${articles.length} articles; minimum is ${context.minimumItems}.`);
  }
  if (articles.length > maxArticles) fail(`Generated ${articles.length} articles; maximum is ${maxArticles}.`);

  const candidateUrls = new Set(context.candidates.map((candidate) => candidate.url));
  const seenSlugs = new Set();
  const seenUrls = new Set();
  const errors = [];

  for (const article of articles) {
    const label = article?.slug || article?.title || "unknown article";
    for (const field of [
      "slug",
      "title",
      "summary",
      "category",
      "eventDate",
      "publishedDate",
      "checkedAt",
      "weeklyIssueDate",
      "frontendRelevance",
      "coverageBuckets",
      "comparisonTargets",
      "sources",
      "verificationNote",
      "keyPoints",
      "markdown",
    ]) {
      if (article?.[field] === undefined || article?.[field] === "") {
        errors.push(`${label} missing ${field}.`);
      }
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*-20\d{2}-\d{2}-\d{2}$/.test(article.slug ?? "")) {
      errors.push(`${label} has invalid slug.`);
    }
    if (context.existing.slugs.has(article.slug)) errors.push(`${label} duplicates an existing slug.`);
    if (seenSlugs.has(article.slug)) errors.push(`${label} duplicates another generated slug.`);
    seenSlugs.add(article.slug);

    if (article.weeklyIssueDate !== context.window.weeklyIssueDate) {
      errors.push(`${label} weeklyIssueDate must be ${context.window.weeklyIssueDate}.`);
    }
    if (hasArticleMojibake(article)) {
      errors.push(`${label} article text has likely question-mark mojibake.`);
    }
    if (hasLikelyQuestionMarkMojibake(article.markdown)) {
      errors.push(`${label} markdown has likely question-mark mojibake.`);
    }
    if (!isWithinWindow(article.publishedDate, context.window)) {
      errors.push(`${label} publishedDate is outside the weekly window.`);
    }
    if (!articleCategories.includes(article.category)) errors.push(`${label} has invalid category.`);
    if (!frontendRelevanceValues.includes(article.frontendRelevance)) {
      errors.push(`${label} has invalid frontendRelevance.`);
    }

    for (const bucket of article.coverageBuckets ?? []) {
      if (!coverageBuckets.includes(bucket)) errors.push(`${label} has invalid coverage bucket ${bucket}.`);
    }
    for (const section of requiredSections) {
      if (!String(article.markdown ?? "").includes(section)) {
        errors.push(`${label} markdown missing section ${section}.`);
      }
    }

    if (!Array.isArray(article.sources) || article.sources.length === 0) {
      errors.push(`${label} must include at least one source.`);
    }
    for (const source of article.sources ?? []) {
      if (!candidateUrls.has(source.url)) errors.push(`${label} uses non-candidate source URL ${source.url}.`);
      if (context.existing.sourceUrls.has(source.url)) errors.push(`${label} duplicates existing source URL ${source.url}.`);
      if (seenUrls.has(source.url)) errors.push(`${label} duplicates generated source URL ${source.url}.`);
      if (!sourceTypes.includes(source.sourceType)) errors.push(`${label} has invalid sourceType ${source.sourceType}.`);
      if (!isWithinWindow(source.publishedDate, context.window)) {
        errors.push(`${label} source publishedDate is outside the weekly window.`);
      }
      seenUrls.add(source.url);
    }
  }

  if (errors.length > 0) {
    fail(`Weekly news validation failed:\n- ${errors.join("\n- ")}`);
  }

  return articles.map(({ markdown, ...article }) => ({
    article,
    markdown,
  }));
}

async function writeWeeklyUpdate(validArticles, articleData, window) {
  const manifest = await readJson(manifestPath);
  const generated = await readJson(generatedPath);
  const now = new Date().toISOString();

  articleData.articles = [
    ...validArticles.map((item) => item.article),
    ...articleData.articles,
  ];

  for (const item of validArticles) {
    manifest.articles.push({
      hackmdNoteId: "",
      slug: item.article.slug,
      status: "pending",
      title: item.article.title,
      weeklyIssueDate: window.weeklyIssueDate,
    });
    generated.articles[item.article.slug] = {
      fetchedAt: now,
      lastChangedAt: null,
      markdown: item.markdown,
      noteId: "",
    };
  }

  await writeJson(articlesDataPath, articleData);
  await writeJson(manifestPath, manifest);
  await writeJson(generatedPath, {
    ...generated,
    generatedAt: now,
  });
}

function uniqueBy(items, keyFn) {
  const seen = new Set();
  const result = [];
  for (const item of items) {
    const key = keyFn(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

function hasArticleMojibake(article) {
  return hasLikelyQuestionMarkMojibake([
    article.title,
    article.summary,
    ...(article.keyPoints ?? []),
  ].join("\n"));
}

function hasLikelyQuestionMarkMojibake(value) {
  return /\?{3,}/.test(String(value ?? ""));
}

function runSelfTest() {
  const window = getPreviousTaipeiWeekWindow("2026-05-18");
  assertEqual(window.startLocalDate, "2026-05-11", "weekly window start");
  assertEqual(window.endLocalDate, "2026-05-17", "weekly window end");
  assertEqual(window.weeklyIssueDate, "2026-05-17", "weekly issue date");

  const candidate = {
    publishedDate: "2026-05-12",
    sourceName: "OpenAI News",
    sourceType: "official",
    title: "OpenAI test",
    url: "https://openai.com/news/test",
  };
  const baseArticle = {
    category: "AI 模型與平台",
    checkedAt: "2026-05-17",
    comparisonTargets: ["OpenAI"],
    coverageBuckets: ["ai-tech-tools"],
    eventDate: "2026-05-12",
    frontendRelevance: "中",
    keyPoints: ["A supported point"],
    markdown: `${requiredSections.join("\n\n")}\n\n- OpenAI News / 2026-05-12 / https://openai.com/news/test / official`,
    publishedDate: "2026-05-12",
    slug: "openai-test-2026-05-12",
    sources: [
      {
        name: "OpenAI News",
        publishedDate: "2026-05-12",
        sourceType: "official",
        url: "https://openai.com/news/test",
      },
    ],
    summary: "A supported summary.",
    title: "OpenAI test",
    verificationNote: "Verified against OpenAI News.",
    weeklyIssueDate: "2026-05-17",
  };
  const context = {
    candidates: [candidate],
    existing: { slugs: new Set(), sourceUrls: new Set() },
    minimumItems: 1,
    window,
  };
  validateGeneratedArticles([baseArticle], context);

  assertThrows(() => validateGeneratedArticles([], context), "minimum item validation");
  assertThrows(
    () => validateGeneratedArticles([{ ...baseArticle, summary: "" }], context),
    "missing field validation",
  );
  assertThrows(
    () => validateGeneratedArticles([baseArticle], {
      ...context,
      existing: { slugs: new Set(), sourceUrls: new Set(["https://openai.com/news/test"]) },
    }),
    "duplicate source validation",
  );

  console.log("Weekly news self-test passed.");
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

function assertThrows(fn, label) {
  const originalExit = process.exit;
  const originalError = console.error;
  let threw = false;
  process.exit = () => {
    throw new Error("process.exit intercepted");
  };
  console.error = () => {};
  try {
    fn();
  } catch {
    threw = true;
  } finally {
    process.exit = originalExit;
    console.error = originalError;
  }
  if (!threw) throw new Error(`${label}: expected failure.`);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
