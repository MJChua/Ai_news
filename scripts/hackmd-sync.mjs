import { existsSync, readFileSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const articlesDataPath = path.join(root, "data", "articles.json");
const manifestPath = path.join(root, "content", "hackmd", "articles.json");
const generatedPath = path.join(root, "data", "generated", "hackmd-articles.json");
const apiBase = "https://api.hackmd.io/v1";

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

  const command = process.argv[2];
  if (!["push", "pull", "check"].includes(command)) {
    fail("Usage: node scripts/hackmd-sync.mjs <push|pull|check>");
  }

  if (command === "push") {
    await pushNotes();
    return;
  }

  if (command === "pull") {
    await pullNotes();
    return;
  }

  await checkNotes();
}

function loadLocalEnv() {
  for (const fileName of [".env.local", ".env"]) {
    const envPath = path.join(root, fileName);
    if (!existsSync(envPath)) continue;
    const text = readFileSyncUtf8(envPath);
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

function readFileSyncUtf8(filePath) {
  return readFileSync(filePath, "utf8");
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function writeJson(filePath, data) {
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function getToken() {
  const token = process.env.HACKMD_API_TOKEN;
  if (!token) {
    fail("Missing HACKMD_API_TOKEN. Put it in .env.local or CI secrets.");
  }
  return token;
}

async function hackmdRequest(endpoint, options = {}) {
  const response = await fetch(`${apiBase}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    fail(`HackMD API ${options.method ?? "GET"} ${endpoint} failed: ${response.status} ${body}`);
  }

  if (response.status === 204) return null;

  const body = await response.text();
  if (!body.trim()) return null;

  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
}

async function pushNotes() {
  getToken();
  const manifest = await readJson(manifestPath);
  const generated = await readJson(generatedPath);
  const articleMap = loadArticleMap();

  for (const item of manifest.articles) {
    const article = articleMap.get(item.slug);
    if (!article) {
      fail(`Missing article metadata for ${item.slug}.`);
    }

    item.title = article.title;
    const existing = generated.articles[item.slug];
    const content = existing?.markdown ?? createNoteContent(article);
    const payload = {
      title: item.title,
      content,
      readPermission: "owner",
      writePermission: "owner",
    };

    if (item.hackmdNoteId) {
      await hackmdRequest(`/notes/${item.hackmdNoteId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    } else {
      const note = await hackmdRequest("/notes", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      item.hackmdNoteId = note.id;
      item.status = "synced";
    }
  }

  await updateIndexNote(manifest);
  await writeJson(manifestPath, manifest);
  console.log("HackMD notes pushed and manifest updated.");
}

async function updateIndexNote(manifest) {
  const content = renderIndexNote(manifest);
  const configuredIndexNoteId = process.env.HACKMD_INDEX_NOTE_ID;
  const indexNoteId = manifest.indexNoteId ?? configuredIndexNoteId;

  if (indexNoteId) {
    await hackmdRequest(`/notes/${indexNoteId}`, {
      method: "PATCH",
      body: JSON.stringify({
        title: "AI News Radar HackMD Index",
        content,
        readPermission: "owner",
        writePermission: "owner",
      }),
    });
    manifest.indexNoteId = indexNoteId;
    return;
  }

  const note = await hackmdRequest("/notes", {
    method: "POST",
    body: JSON.stringify({
      title: "AI News Radar HackMD Index",
      content,
      readPermission: "owner",
      writePermission: "owner",
    }),
  });
  manifest.indexNoteId = note.id;
}

async function pullNotes() {
  getToken();
  const manifest = await readJson(manifestPath);
  const articles = {};

  for (const item of manifest.articles) {
    if (!item.hackmdNoteId) {
      fail(`Missing hackmdNoteId for ${item.slug}. Run hackmd:push first.`);
    }

    const note = await hackmdRequest(`/notes/${item.hackmdNoteId}`);
    const markdown = note.content ?? "";
    articles[item.slug] = {
      noteId: item.hackmdNoteId,
      markdown,
      lastChangedAt: note.lastChangedAt ?? null,
      fetchedAt: new Date().toISOString(),
    };
  }

  await writeJson(generatedPath, {
    generatedAt: new Date().toISOString(),
    source: "hackmd",
    articles,
  });
  console.log("HackMD notes pulled into data/generated/hackmd-articles.json.");
}

async function checkNotes() {
  const manifest = await readJson(manifestPath);
  const generated = await readJson(generatedPath);
  const articleMap = loadArticleMap();
  const errors = [];

  if (!manifest.indexNoteId) {
    errors.push("Missing indexNoteId in content/hackmd/articles.json.");
  }

  const seenSlugs = new Set();
  for (const item of manifest.articles) {
    if (!item.slug) errors.push("Manifest item missing slug.");
    if (!item.title) errors.push(`${item.slug} missing title.`);
    if (!item.weeklyIssueDate) errors.push(`${item.slug} missing weeklyIssueDate.`);
    if (!item.hackmdNoteId) errors.push(`${item.slug} missing hackmdNoteId.`);
    const article = articleMap.get(item.slug);
    if (!article) errors.push(`${item.slug} missing article metadata.`);
    if (hasLikelyQuestionMarkMojibake(item.title)) {
      errors.push(`${item.slug} manifest title has likely question-mark mojibake.`);
    }
    if (article && hasArticleMojibake(article)) {
      errors.push(`${item.slug} article metadata has likely question-mark mojibake.`);
    }
    if (seenSlugs.has(item.slug)) errors.push(`Duplicate slug in manifest: ${item.slug}.`);
    seenSlugs.add(item.slug);

    const cached = generated.articles?.[item.slug];
    if (!cached?.markdown) {
      errors.push(`${item.slug} missing generated HackMD markdown. Run hackmd:pull.`);
      continue;
    }
    if (hasLikelyQuestionMarkMojibake(cached.markdown)) {
      errors.push(`${item.slug} generated HackMD markdown has likely question-mark mojibake.`);
    }

    for (const section of requiredSections) {
      if (!cached.markdown.includes(section)) {
        errors.push(`${item.slug} missing section: ${section}`);
      }
    }
  }

  if (errors.length > 0) {
    fail(`HackMD check failed:\n- ${errors.join("\n- ")}`);
  }

  console.log("HackMD manifest and generated content look complete.");
}

function loadArticleMap() {
  const articleData = JSON.parse(readFileSyncUtf8(articlesDataPath));

  return new Map(articleData.articles.map((article) => [article.slug, article]));
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

function createNoteContent(article) {
  const sourceLines = article.sources
    .map((source) => {
      return `- ${source.name} / ${source.publishedDate} / ${source.url} / ${source.sourceType}`;
    })
    .join("\n");
  const keyPointLines = article.keyPoints.map((point) => `- ${point}`).join("\n");
  const comparisonTargets = article.comparisonTargets.join("、");

  return `# ${article.title}

## 正文

### 背景

${article.summary}

此文屬於「${article.category}」，本次週期日期為 ${article.weeklyIssueDate}，查證日期為 ${article.checkedAt}。本站只整理來源可支持的事實，不加入未被來源支持的推論。

### 本次更新重點

${keyPointLines}

### 對 AI / 工具 / 工程的影響

此項目和 ${comparisonTargets} 有關，前端與軟體工程相關度標記為「${article.frontendRelevance}」。對工程團隊而言，重點不是只看產品名稱，而是判斷它是否改變開發流程、agent 權限治理、API 整合方式、團隊監控指標或企業導入模式。

### 限制與待確認事項

${article.verificationNote}

目前正文只使用下列來源支持的資訊；未在來源中明確出現的效能、價格、上市範圍、客戶影響或未來路線圖，不列入本文結論。

## 來源與校對

${sourceLines}
`;
}

function renderIndexNote(manifest) {
  const rows = manifest.articles
    .map((item) => {
      return `| ${item.slug} | ${item.weeklyIssueDate} | ${item.hackmdNoteId ?? ""} | ${item.status ?? "pending"} |`;
    })
    .join("\n");

  return `# AI News Radar HackMD Index

This note is managed by the AiNews repository.

| slug | weeklyIssueDate | hackmdNoteId | status |
| --- | --- | --- | --- |
${rows}
`;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
