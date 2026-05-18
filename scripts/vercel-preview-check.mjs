import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const articlesDataPath = path.join(root, "data", "articles.json");
const timeoutMs = Number.parseInt(process.env.VERCEL_PREVIEW_TIMEOUT_MS ?? "600000", 10);
const pollIntervalMs = 15000;

async function main() {
  const branch = process.env.PREVIEW_BRANCH;
  const commitSha = process.env.PREVIEW_COMMIT_SHA;
  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.VERCEL_ORG_ID;

  if (!branch) fail("Missing PREVIEW_BRANCH.");
  if (!commitSha) fail("Missing PREVIEW_COMMIT_SHA.");
  if (!token) fail("Missing VERCEL_TOKEN.");
  if (!projectId) fail("Missing VERCEL_PROJECT_ID.");
  if (!teamId) fail("Missing VERCEL_ORG_ID.");

  const deployment = await waitForDeployment({ branch, commitSha, projectId, teamId, token });
  const baseUrl = `https://${deployment.url}`;
  const articleSlug = await getLatestArticleSlug();

  await smokeFetch(baseUrl);
  await smokeFetch(`${baseUrl}/articles/${articleSlug}`);
  console.log(`Vercel Preview ready and smoke checked: ${baseUrl}`);
}

async function waitForDeployment({ branch, commitSha, projectId, teamId, token }) {
  const startedAt = Date.now();
  let latestMatch = null;

  while (Date.now() - startedAt < timeoutMs) {
    const url = new URL("https://api.vercel.com/v13/deployments");
    url.searchParams.set("projectId", projectId);
    url.searchParams.set("teamId", teamId);
    url.searchParams.set("limit", "20");

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const body = await response.json();
    if (!response.ok) {
      fail(`Vercel deployments API failed: ${response.status} ${JSON.stringify(body)}`);
    }

    latestMatch = (body.deployments ?? []).find((deployment) => {
      return deployment.meta?.githubCommitRef === branch
        && deployment.meta?.githubCommitSha === commitSha;
    }) ?? latestMatch;

    if (latestMatch?.readyState === "READY") return latestMatch;
    if (["ERROR", "CANCELED"].includes(latestMatch?.readyState)) {
      fail(`Vercel Preview deployment ended with ${latestMatch.readyState}.`);
    }

    await sleep(pollIntervalMs);
  }

  fail(`Timed out waiting for Vercel Preview for ${branch}@${commitSha}.`);
}

async function smokeFetch(url) {
  const headers = {};
  const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  if (bypass) headers["x-vercel-protection-bypass"] = bypass;

  const response = await fetch(url, { headers, redirect: "follow" });
  if (!response.ok) {
    fail(`Smoke check failed for ${url}: ${response.status}. If Preview Deployment Protection is enabled, configure VERCEL_AUTOMATION_BYPASS_SECRET.`);
  }

  const html = await response.text();
  if (!html.includes("AI News Radar")) {
    fail(`Smoke check response for ${url} did not include AI News Radar.`);
  }
}

async function getLatestArticleSlug() {
  const articleData = JSON.parse(await readFile(articlesDataPath, "utf8"));
  const latest = [...articleData.articles].sort((a, b) =>
    b.publishedDate.localeCompare(a.publishedDate),
  )[0];
  if (!latest?.slug) fail("No article slug found for preview smoke test.");
  return latest.slug;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
