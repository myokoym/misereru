import { copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { marked } from 'marked';

const root = resolve(import.meta.dirname, '..');
const configPath = resolve(root, process.env.MISERERU_CONFIG ?? 'misereru.config.json');
const config = JSON.parse(await readFile(configPath, 'utf8'));
const pagesEnabled = featureEnabled(config.publish?.githubPages);
const publishingEnabled = featureEnabled(config.publish?.githubPages?.aiSources);
const sourceDir = resolve(root, 'ai-sources');
const planPath = resolve(root, 'dist/build-plan.json');
const htmlOutputPath = config.outputs?.html?.path ?? 'dist/site/index.html';
const siteDir = resolve(root, htmlOutputPath, '..');
const publishedDir = resolve(siteDir, 'ai-sources');

let entries;
try {
  entries = await readdir(sourceDir, { withFileTypes: true });
} catch (error) {
  if (error?.code === 'ENOENT') {
    if (publishingEnabled) {
      throw new Error('Publishing AI sources requires ai-sources/ to exist');
    }
    process.exit(0);
  }
  throw error;
}

const markdownFiles = entries
  .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.md'))
  .map((entry) => entry.name)
  .sort((a, b) => a.localeCompare(b, 'en'));

if (markdownFiles.length === 0) {
  if (publishingEnabled) {
    throw new Error('Publishing AI sources requires at least one Markdown file in ai-sources/');
  }
  process.exit(0);
}

if (publishingEnabled && !pagesEnabled) {
  throw new Error('publish.githubPages.aiSources.enabled requires GitHub Pages publishing to be enabled');
}

const reservedGenericNames = new Set([
  'ai-reference.md',
  'knowledge.md',
  'source.md',
  'skill.md',
  'guide.md',
]);

const sources = [];
for (const fileName of markdownFiles) {
  if (reservedGenericNames.has(fileName.toLowerCase())) {
    throw new Error(`AI source file name must identify its topic; generic name is not allowed: ${fileName}`);
  }

  const sourcePath = resolve(sourceDir, fileName);
  const markdown = await readFile(sourcePath, 'utf8');
  const tokens = marked.lexer(markdown, { gfm: true });
  const h1Tokens = tokens.filter((token) => token.type === 'heading' && token.depth === 1);
  if (h1Tokens.length !== 1) {
    throw new Error(`ai-sources/${fileName} must contain exactly one H1 title; found ${h1Tokens.length}`);
  }

  validateTokens(tokens, fileName);

  sources.push({
    fileName,
    title: h1Tokens[0].text.trim(),
  });
}

const buildPlan = JSON.parse(await readFile(planPath, 'utf8'));
buildPlan.aiSources = {
  status: 'validated',
  directory: 'ai-sources',
  count: sources.length,
  files: sources.map(({ fileName, title }) => ({ path: `ai-sources/${fileName}`, title })),
};

if (!publishingEnabled) {
  await writeFile(planPath, `${JSON.stringify(buildPlan, null, 2)}\n`, 'utf8');
  console.log(`Validated ${sources.length} AI source file(s)`);
  process.exit(0);
}

await mkdir(publishedDir, { recursive: true });
for (const source of sources) {
  await copyFile(resolve(sourceDir, source.fileName), resolve(publishedDir, source.fileName));
}

const indexHtml = renderIndexHtml(sources);
await writeFile(resolve(publishedDir, 'index.html'), indexHtml, 'utf8');

buildPlan.publish ??= {};
buildPlan.publish.githubPages ??= {};
buildPlan.publish.githubPages.aiSources = {
  status: 'enabled',
  publicPath: 'ai-sources/',
  count: sources.length,
  files: sources.map(({ fileName, title }) => ({
    publicPath: `ai-sources/${fileName}`,
    title,
  })),
};
await writeFile(planPath, `${JSON.stringify(buildPlan, null, 2)}\n`, 'utf8');

console.log(`Published ${sources.length} AI source file(s) to ${publishedDir}`);

function renderIndexHtml(sources) {
  const items = sources.map(({ fileName, title }) =>
    `<li><a href="./${escapeHtml(fileName)}" download>${escapeHtml(title)}</a><code>${escapeHtml(fileName)}</code></li>`
  ).join('\n');

  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>AI向けsource</title>
  <style>
    :root { color-scheme: light dark; font-family: "Noto Sans CJK JP", "Noto Sans JP", system-ui, sans-serif; line-height: 1.8; }
    body { margin: 0; background: Canvas; color: CanvasText; }
    main { max-width: 760px; margin: 0 auto; padding: 32px 20px 80px; }
    h1 { font-size: clamp(1.8rem, 6vw, 2.8rem); line-height: 1.3; }
    p { margin-bottom: 1.5em; }
    ul { padding-left: 1.4em; }
    li { margin: 1em 0; }
    li a { margin-right: 0.8em; }
    code { font-size: 0.9em; opacity: 0.78; }
  </style>
</head>
<body>
  <main>
    <h1>AI向けsource</h1>
    <p>ChatGPT等へアップロードして使うMarkdownです。リンクを選ぶと元の主題名のファイルとして取得できます。</p>
    <ul>
${items}
    </ul>
  </main>
</body>
</html>
`;
}

function validateTokens(tokens, fileName) {
  const seen = new Set();

  function visit(value) {
    if (!value || typeof value !== 'object' || seen.has(value)) return;
    seen.add(value);

    if (value.type === 'html') {
      throw new Error(`ai-sources/${fileName} must be Markdown only; raw HTML is not allowed`);
    }
    if ((value.type === 'link' || value.type === 'image') && !safeHref(value.href)) {
      throw new Error(`ai-sources/${fileName} contains an unsafe URL scheme: ${value.href}`);
    }

    if (Array.isArray(value)) {
      for (const item of value) visit(item);
      return;
    }
    for (const child of Object.values(value)) visit(child);
  }

  visit(tokens);
}

function safeHref(value) {
  const href = String(value ?? '').trim();
  return !/^(?:javascript|data|vbscript):/i.test(href);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function featureEnabled(value) {
  return value === true || value?.enabled === true;
}
