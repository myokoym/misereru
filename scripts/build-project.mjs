import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { spawn } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const configPath = resolve(root, process.env.MISERERU_CONFIG ?? 'misereru.config.json');
const config = JSON.parse(await readFile(configPath, 'utf8'));

if (config.source?.format !== 'markdown') {
  throw new Error(`Initial template workflow supports source.format=markdown only; got ${config.source?.format ?? 'unset'}`);
}

const sourcePath = resolve(root, config.source?.path ?? 'slides.md');
const outputs = config.outputs ?? {};
const buildPlan = {
  version: 1,
  source: config.source,
  outputs: {},
};

if (outputs.html?.enabled !== true) {
  throw new Error('HTML is the required default output for the initial template workflow');
}

await renderMarp(sourcePath, resolve(root, outputs.html.path ?? 'dist/index.html'), []);
buildPlan.outputs.html = { status: 'generated', path: outputs.html.path ?? 'dist/index.html' };

if (outputs.pdf?.enabled === true) {
  const pdfPath = outputs.pdf.path ?? 'dist/slides.pdf';
  await renderMarp(sourcePath, resolve(root, pdfPath), ['--pdf']);
  buildPlan.outputs.pdf = { status: 'generated', path: pdfPath };
} else {
  buildPlan.outputs.pdf = { status: 'disabled' };
}

for (const target of ['googleSlides', 'pptx']) {
  const enabled = outputs[target]?.enabled === true;
  buildPlan.outputs[target] = {
    status: enabled ? 'configured-not-wired' : 'disabled',
  };
  if (enabled) {
    throw new Error(
      `${target} is enabled in misereru.config.json but is not wired into the initial template workflow yet. ` +
      'Keep it disabled until its end-to-end renderer path is validated.'
    );
  }
}

const planPath = resolve(root, 'dist/build-plan.json');
await mkdir(dirname(planPath), { recursive: true });
await writeFile(planPath, `${JSON.stringify(buildPlan, null, 2)}\n`, 'utf8');
console.log(`Wrote ${planPath}`);

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
