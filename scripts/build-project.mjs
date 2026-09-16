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
  version: 2,
  source: config.source,
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

const marpSourcePath = await createMarpInput(sourcePath);
try {
  await renderMarp(marpSourcePath, resolve(root, outputs.html.path ?? 'dist/index.html'), []);
  buildPlan.outputs.html = {
    status: 'generated',
    path: outputs.html.path ?? 'dist/index.html',
    renderer: 'marp'
  };

  if (outputs.pdf?.enabled === true) {
    const pdfPath = outputs.pdf.path ?? 'dist/slides.pdf';
    await renderMarp(marpSourcePath, resolve(root, pdfPath), ['--pdf']);
    buildPlan.outputs.pdf = { status: 'generated', path: pdfPath, renderer: 'marp' };
  } else {
    buildPlan.outputs.pdf = { status: 'disabled', renderer: 'marp' };
  }
} finally {
  await rm(marpSourcePath, { force: true });
}

const googleSlidesEnabled = outputs.googleSlides?.enabled === true;
buildPlan.outputs.googleSlides = {
  status: googleSlidesEnabled ? 'configured-not-wired' : 'disabled',
  renderer: 'deck'
};
if (googleSlidesEnabled) {
  throw new Error(
    'googleSlides is enabled in misereru.config.json but the template build workflow is not wired to deck apply yet. ' +
    'Keep it disabled until the validated deck + Google authentication path is connected.'
  );
}

const pptxEnabled = outputs.pptx?.enabled === true;
buildPlan.outputs.pptx = {
  status: pptxEnabled ? 'configured-not-wired' : 'disabled',
  renderer: 'undecided'
};
if (pptxEnabled) {
  throw new Error(
    'pptx is enabled in misereru.config.json but its renderer path is not selected yet. ' +
    'Keep it disabled until an end-to-end path is validated.'
  );
}

const planPath = resolve(root, 'dist/build-plan.json');
await mkdir(dirname(planPath), { recursive: true });
await writeFile(planPath, `${JSON.stringify(buildPlan, null, 2)}\n`, 'utf8');
console.log(`Wrote ${planPath}`);

async function createMarpInput(source) {
  const original = await readFile(source, 'utf8');
  const generatedPath = resolve(dirname(source), `.misereru-${basename(source)}.marp.md`);
  const frontmatter = [
    '---',
    'marp: true',
    'theme: misereru-ja',
    'paginate: true',
    '---',
    ''
  ].join('\n');
  await writeFile(generatedPath, `${frontmatter}${original}`, 'utf8');
  return generatedPath;
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
