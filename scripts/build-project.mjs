import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, resolve } from 'node:path';
import { spawn } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const configPath = resolve(root, process.env.MISERERU_CONFIG ?? 'misereru.config.json');
const config = JSON.parse(await readFile(configPath, 'utf8'));

if (config.source?.format !== 'markdown') {
  throw new Error(`Initial template workflow supports source.format=markdown only; got ${config.source?.format ?? 'unset'}`);
}

const sourcePath = resolve(root, config.source?.path ?? 'slides.md');
const outputs = config.outputs ?? {};
const pagesEnabled = featureEnabled(config.publish?.githubPages);
const buildPlan = {
  version: 4,
  source: config.source,
  renderer: 'marp',
  navigation: {
    toc: 'generated-after-title',
    sourceIdentity: 'stable-key',
    targetIdentity: 'generated-slide-number'
  },
  outputs: {},
  publish: {
    githubPages: {
      status: pagesEnabled ? 'enabled' : 'disabled',
      source: 'html'
    }
  }
};

if (outputs.html?.enabled !== true) {
  throw new Error('HTML is the required default output for the initial template workflow');
}

const unsupportedOutputs = Object.keys(outputs).filter((name) => !['html', 'pdf'].includes(name));
if (unsupportedOutputs.length > 0) {
  throw new Error(
    `Unsupported outputs in the initial template workflow: ${unsupportedOutputs.join(', ')}. ` +
    'Only html and pdf are exposed until a same-design renderer strategy is validated.'
  );
}

const marpSourcePath = await createMarpInput(sourcePath);
try {
  await renderMarp(marpSourcePath, resolve(root, outputs.html.path ?? 'dist/site/index.html'), []);
  buildPlan.outputs.html = {
    status: 'generated',
    path: outputs.html.path ?? 'dist/site/index.html'
  };

  if (outputs.pdf?.enabled === true) {
    const pdfPath = outputs.pdf.path ?? 'dist/slides.pdf';
    await renderMarp(marpSourcePath, resolve(root, pdfPath), ['--pdf']);
    buildPlan.outputs.pdf = { status: 'generated', path: pdfPath };
  } else {
    buildPlan.outputs.pdf = { status: 'disabled' };
  }
} finally {
  await rm(marpSourcePath, { force: true });
}

const planPath = resolve(root, 'dist/build-plan.json');
await mkdir(dirname(planPath), { recursive: true });
await writeFile(planPath, `${JSON.stringify(buildPlan, null, 2)}\n`, 'utf8');
console.log(`Wrote ${planPath}`);

async function createMarpInput(source) {
  const original = await readFile(source, 'utf8');
  const generatedPath = resolve(dirname(source), `.misereru-${basename(source)}.marp.md`);
  const withToc = injectGeneratedToc(original);
  const frontmatter = [
    '---',
    'marp: true',
    'theme: misereru-ja',
    'paginate: true',
    '---',
    ''
  ].join('\n');
  await writeFile(generatedPath, `${frontmatter}${withToc}`, 'utf8');
  return generatedPath;
}

function injectGeneratedToc(markdown) {
  const slides = markdown
    .split(/^---\s*$/m)
    .map((slide) => slide.trim())
    .filter(Boolean);

  if (slides.length < 2) return markdown;

  const metadata = slides.map((slide, index) => readSlideMetadata(slide, index));
  const keys = new Set();
  for (const slide of metadata) {
    if (slide.key === '__misereru_toc__') {
      throw new Error('Slide key __misereru_toc__ is reserved for the generated table of contents');
    }
    if (keys.has(slide.key)) {
      throw new Error(`Duplicate slide key: ${slide.key}`);
    }
    keys.add(slide.key);
  }

  const tocItems = metadata.slice(1).map((slide, originalIndex) => {
    // Generated TOC becomes slide 2, so every original slide after the title shifts by +1.
    const generatedSlideNumber = originalIndex + 3;
    return `- [${escapeMarkdownLinkLabel(slide.title)}](#${generatedSlideNumber})`;
  });

  const tocSlide = [
    '<!-- {"key":"__misereru_toc__"} -->',
    '# 目次',
    '',
    ...tocItems,
  ].join('\n');

  return [slides[0], tocSlide, ...slides.slice(1)].join('\n\n---\n\n');
}

function readSlideMetadata(slide, index) {
  const keyMatch = slide.match(/<!--\s*\{\s*"key"\s*:\s*"([^"]+)"[^}]*\}\s*-->/);
  if (!keyMatch) {
    throw new Error(`Slide ${index + 1} is missing a stable key comment such as <!-- {"key":"overview"} -->`);
  }

  const titleMatch = slide.match(/^#\s+(.+?)\s*$/m);
  if (!titleMatch) {
    throw new Error(`Slide ${index + 1} (${keyMatch[1]}) is missing an H1 title required for the generated TOC`);
  }

  return { key: keyMatch[1], title: titleMatch[1] };
}

function escapeMarkdownLinkLabel(value) {
  return value.replace(/\\/g, '\\\\').replace(/\[/g, '\\[').replace(/\]/g, '\\]');
}

async function renderMarp(source, output, extraArgs) {
  await mkdir(dirname(output), { recursive: true });
  await run('npx', [
    '--no-install',
    'marp',
    source,
    '--config',
    resolve(root, 'marp.config.mjs'),
    '--output',
    output,
    ...extraArgs,
  ]);
}

function featureEnabled(value) {
  return value === true || value?.enabled === true;
}

async function run(command, args) {
  await new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
    child.on('error', rejectPromise);
    child.on('exit', (code) => {
      if (code === 0) resolvePromise();
      else rejectPromise(new Error(`${command} exited with code ${code}`));
    });
  });
}
