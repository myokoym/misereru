import { readFile, rm, mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const configPath = resolve(root, 'prototype/project.json');
const project = JSON.parse(await readFile(configPath, 'utf8'));

if (project.source?.type !== 'marp-markdown') {
  throw new Error(`Unsupported source adapter: ${project.source?.type ?? '<missing>'}`);
}

const sourcePath = resolve(root, project.source.path);
const distDir = resolve(root, 'dist');
const marpBin = resolve(root, 'node_modules/.bin/marp');

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

for (const [profileName, profile] of Object.entries(project.profiles ?? {})) {
  if (profile.renderer !== 'marp') {
    throw new Error(`Unsupported renderer for profile ${profileName}: ${profile.renderer}`);
  }

  for (const output of profile.outputs ?? []) {
    const args = ['-c', resolve(root, profile.config), sourcePath];
    let outputPath;

    switch (output) {
      case 'html':
        outputPath = resolve(distDir, `${profileName}.html`);
        args.push('-o', outputPath);
        break;
      case 'pdf':
        outputPath = resolve(distDir, `${profileName}.pdf`);
        args.push('--pdf', '-o', outputPath);
        break;
      case 'pptx':
        outputPath = resolve(distDir, `${profileName}.pptx`);
        args.push('--pptx', '-o', outputPath);
        break;
      case 'png':
        outputPath = resolve(distDir, `${profileName}.png`);
        args.push('--images', 'png', '-o', outputPath);
        break;
      default:
        throw new Error(`Unsupported output for profile ${profileName}: ${output}`);
    }

    await run(marpBin, args);
  }
}

function run(command, args) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: 'inherit',
      shell: process.platform === 'win32'
    });

    child.on('error', rejectPromise);
    child.on('exit', (code) => {
      if (code === 0) resolvePromise();
      else rejectPromise(new Error(`${command} exited with code ${code}`));
    });
  });
}
