import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const configPath = resolve(root, process.env.MISERERU_CONFIG ?? 'misereru.config.json');
const config = JSON.parse(await readFile(configPath, 'utf8'));
const sourcePath = resolve(root, config.source?.path ?? 'slides.md');
const htmlPath = resolve(root, config.outputs?.html?.path ?? 'dist/site/index.html');

const source = await readFile(sourcePath, 'utf8');
const html = await readFile(htmlPath, 'utf8');
const expectedCount = [...source.matchAll(/^```mermaid(?:[ \t]+[^\n]*)?[ \t]*\r?$/gm)].length;

if (expectedCount === 0) {
  console.log('No Mermaid diagrams to verify');
  process.exit(0);
}

const renderedCount = (html.match(/<img\b[^>]*\balt=["']diagram["'][^>]*>/gi) ?? []).length;
const literalMarkdownCount = (html.match(/!\[diagram\]\(/g) ?? []).length;

if (literalMarkdownCount > 0) {
  throw new Error(`Rendered HTML contains ${literalMarkdownCount} literal diagram Markdown image(s)`);
}

if (renderedCount !== expectedCount) {
  throw new Error(`Expected ${expectedCount} rendered diagram image(s), found ${renderedCount}`);
}

console.log(`Verified ${renderedCount} rendered Mermaid diagram image(s)`);
