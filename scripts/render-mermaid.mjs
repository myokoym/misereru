import { readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const mermaidFence = /^```mermaid(?:[ \t]+[^\n]*)?[ \t]*\r?\n([\s\S]*?)^```[ \t]*$/gm;

export async function renderMermaidInMarkdown(markdown) {
  const matches = [...markdown.matchAll(mermaidFence)];
  if (matches.length === 0) {
    return { markdown, count: 0 };
  }

  let rendered = '';
  let cursor = 0;

  for (const [index, match] of matches.entries()) {
    rendered += markdown.slice(cursor, match.index);
    const source = match[1].trim();
    if (!source) {
      throw new Error(`Mermaid diagram ${index + 1} is empty`);
    }

    const baseName = `.misereru-mermaid-${process.pid}-${index + 1}`;
    const inputPath = resolve(root, `${baseName}.mmd`);
    const outputPath = resolve(root, `${baseName}.svg`);

    try {
      await writeFile(inputPath, `${source}\n`, 'utf8');
      await runMmdc(inputPath, outputPath);
      const svg = await readFile(outputPath, 'utf8');
      const dataUri = `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`;
      rendered += `![diagram](${dataUri})`;
    } catch (error) {
      throw new Error(`Failed to render Mermaid diagram ${index + 1}: ${error.message}`, { cause: error });
    } finally {
      await Promise.all([
        rm(inputPath, { force: true }),
        rm(outputPath, { force: true }),
      ]);
    }

    cursor = match.index + match[0].length;
  }

  rendered += markdown.slice(cursor);
  return { markdown: rendered, count: matches.length };
}

async function runMmdc(inputPath, outputPath) {
  await new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(
      'npx',
      [
        '--no-install',
        'mmdc',
        '--input',
        inputPath,
        '--output',
        outputPath,
        '--backgroundColor',
        'transparent',
        '--width',
        '1200',
      ],
      {
        cwd: root,
        stdio: 'inherit',
        shell: process.platform === 'win32',
      },
    );

    child.on('error', rejectPromise);
    child.on('exit', (code) => {
      if (code === 0) resolvePromise();
      else rejectPromise(new Error(`mmdc exited with code ${code}`));
    });
  });
}
