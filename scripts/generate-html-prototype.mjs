import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const sourcePath = resolve(root, 'prototype/deck/content.json');
const outputPath = resolve(root, 'dist/navigation.html');
const source = JSON.parse(await readFile(sourcePath, 'utf8'));
const slides = source.slides ?? [];

if (slides.length === 0) throw new Error('No slides found');

const seenKeys = new Set();
for (const slide of slides) {
  if (!slide.key || seenKeys.has(slide.key)) throw new Error(`Invalid or duplicate slide key: ${slide.key}`);
  seenKeys.add(slide.key);
}

const tocSlides = slides.filter((slide) => slide.toc !== false);
const tocHostKey = slides[0].key;
const sections = [];

for (const [index, slide] of slides.entries()) {
  sections.push(`<section class="slide" id="slide-${escapeAttr(slide.key)}" data-slide-key="${escapeAttr(slide.key)}">`);
  sections.push(`<h1>${escapeHtml(slide.title)}</h1>`);

  if (index === 0) {
    sections.push('<nav class="toc" aria-label="目次">');
    sections.push('<h2>目次</h2>');
    sections.push('<ol>');
    for (const tocSlide of tocSlides) {
      sections.push(`<li><a href="#slide-${escapeAttr(tocSlide.key)}">${escapeHtml(tocSlide.tocLabel ?? tocSlide.title)}</a></li>`);
    }
    sections.push('</ol>');
    sections.push('</nav>');
  }

  for (const block of slide.blocks ?? []) {
    switch (block.type) {
      case 'paragraph':
        sections.push(`<p>${escapeHtml(block.text ?? '')}</p>`);
        break;
      case 'bullets':
        sections.push('<ul>');
        for (const item of block.items ?? []) sections.push(`<li>${escapeHtml(item)}</li>`);
        sections.push('</ul>');
        break;
      case 'link':
        validateExternalUrl(block.url, slide.key);
        sections.push(`<p><a href="${escapeAttr(block.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(block.label ?? block.url)}</a></p>`);
        break;
      default:
        throw new Error(`Unsupported block type on ${slide.key}: ${block.type}`);
    }
  }

  if (index > 0) {
    sections.push(`<p class="back"><a href="#slide-${escapeAttr(tocHostKey)}">目次へ戻る</a></p>`);
  }
  sections.push('</section>');
}

const title = escapeHtml(source.presentation?.title ?? 'misereru navigation prototype');
const html = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>
:root { font-family: "Noto Sans CJK JP", "Noto Sans JP", system-ui, sans-serif; }
html { scroll-behavior: smooth; }
body { margin: 0; background: #eee; }
.slide { box-sizing: border-box; width: min(100vw, 1280px); min-height: min(56.25vw, 720px); margin: 24px auto; padding: 56px 72px; background: white; line-break: strict; word-break: normal; overflow-wrap: normal; }
h1 { text-wrap: balance; }
p, li { text-wrap: pretty; }
a { text-underline-offset: 0.14em; }
.toc ol { columns: 2; }
.back { margin-top: 2rem; font-size: 0.9em; }
@media (max-width: 720px) {
  .slide { width: 100%; min-height: 100svh; margin: 0 0 12px; padding: 32px 24px; }
  .toc ol { columns: 1; }
}
</style>
</head>
<body>
${sections.join('\n')}
</body>
</html>
`;

await mkdir(resolve(root, 'dist'), { recursive: true });
await writeFile(outputPath, html, 'utf8');
console.log(`Generated linked HTML preview at ${outputPath}`);

function validateExternalUrl(url, slideKey) {
  let parsed;
  try { parsed = new URL(url); } catch { throw new Error(`Invalid external URL on ${slideKey}: ${url}`); }
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error(`Unsupported protocol: ${parsed.protocol}`);
}

function escapeHtml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function escapeAttr(value) {
  return escapeHtml(value);
}
