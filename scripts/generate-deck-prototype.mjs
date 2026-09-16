import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const sourcePath = resolve(root, 'prototype/deck/content.json');
const outputDir = resolve(root, 'dist/deck');

const source = JSON.parse(await readFile(sourcePath, 'utf8'));
const sourceSlides = source.slides ?? [];
const tocKey = '__misereru_toc__';

if (sourceSlides.length === 0) {
  throw new Error('prototype/deck/content.json must contain at least one slide');
}

const seenKeys = new Set([tocKey]);
for (const [index, slide] of sourceSlides.entries()) {
  if (!slide.key || typeof slide.key !== 'string') {
    throw new Error(`slide ${index + 1} is missing a stable key`);
  }
  if (seenKeys.has(slide.key)) {
    throw new Error(`duplicate or reserved slide key: ${slide.key}`);
  }
  seenKeys.add(slide.key);

  if (!slide.title || typeof slide.title !== 'string') {
    throw new Error(`slide ${slide.key} is missing title`);
  }

  const layout = resolveLayout(slide);
  if (!['title', 'title-and-body'].includes(layout)) {
    throw new Error(`unsupported deck layout on ${slide.key}: ${layout}`);
  }
}

const tocSlide = {
  key: tocKey,
  role: 'body',
  layout: 'title-and-body',
  title: '目次',
  toc: false,
  generated: 'toc',
  freeze: true,
  blocks: []
};

const renderedSlides = [sourceSlides[0], tocSlide, ...sourceSlides.slice(1)];

const markdown = [];
markdown.push('---');
markdown.push(`title: ${yamlString(source.presentation?.title ?? 'misereru deck prototype')}`);
markdown.push('breaks: false');
markdown.push('---');
markdown.push('');

for (const [index, slide] of renderedSlides.entries()) {
  if (index > 0) {
    markdown.push('---');
    markdown.push('');
  }

  const pageConfig = {
    key: slide.key,
    layout: resolveLayout(slide)
  };
  if (slide.freeze) pageConfig.freeze = true;
  markdown.push(`<!-- ${JSON.stringify(pageConfig)} -->`);
  markdown.push(`# ${slide.title}`);
  markdown.push('');

  for (const block of slide.blocks ?? []) {
    switch (block.type) {
      case 'paragraph':
        markdown.push(block.text ?? '');
        markdown.push('');
        break;
      case 'bullets':
        for (const item of block.items ?? []) markdown.push(`- ${item}`);
        markdown.push('');
        break;
      case 'link':
        validateExternalUrl(block.url, slide.key);
        markdown.push(`[${block.label ?? block.url}](${block.url})`);
        markdown.push('');
        break;
      default:
        throw new Error(`unsupported block type on ${slide.key}: ${block.type}`);
    }
  }
}

const manifest = {
  version: 2,
  presentationTitle: source.presentation?.title ?? 'misereru deck prototype',
  slides: renderedSlides.map((slide, index) => ({
    index,
    key: slide.key,
    role: slide.role ?? 'body',
    layout: resolveLayout(slide),
    title: slide.title,
    toc: slide.toc !== false,
    generated: slide.generated ?? null
  })),
  toc: sourceSlides
    .filter((slide) => slide.toc !== false)
    .map((slide) => ({ key: slide.key, label: slide.tocLabel ?? slide.title })),
  navigation: {
    tocSlideKey: tocKey,
    internalLinkTarget: 'google-slides-pageObjectId',
    sourceIdentity: 'key'
  }
};

await mkdir(outputDir, { recursive: true });
await writeFile(resolve(outputDir, 'slides.md'), `${markdown.join('\n').trimEnd()}\n`, 'utf8');
await writeFile(resolve(outputDir, 'slide-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

console.log(
  `Generated ${renderedSlides.length} deck slides (${sourceSlides.length} source + managed TOC) and manifest at ${outputDir}`
);

function resolveLayout(slide) {
  if (slide.layout) return slide.layout;
  return slide.role === 'title' ? 'title' : 'title-and-body';
}

function yamlString(value) {
  return JSON.stringify(String(value));
}

function validateExternalUrl(url, slideKey) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`invalid external URL on ${slideKey}: ${url}`);
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error(`unsupported external URL protocol on ${slideKey}: ${parsed.protocol}`);
  }
}
