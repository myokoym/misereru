import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { spawn } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const presentationId = process.env.GOOGLE_SLIDES_PRESENTATION_ID;
if (!presentationId) {
  throw new Error('GOOGLE_SLIDES_PRESENTATION_ID is required');
}

const tokenPath = process.env.DECK_TOKEN_PATH
  ? resolve(process.env.DECK_TOKEN_PATH)
  : resolve(homedir(), '.local/state/deck/token.json');

const token = JSON.parse(await readFile(tokenPath, 'utf8'));
if (!token.access_token) {
  throw new Error(`access_token is missing from ${tokenPath}`);
}

const outputDir = resolve(root, 'dist/deck');
const presentationPath = resolve(outputDir, 'live-presentation.json');
const requestsPath = resolve(outputDir, 'navigation-requests.json');
await mkdir(outputDir, { recursive: true });

const presentation = await googleJson(
  `https://slides.googleapis.com/v1/presentations/${encodeURIComponent(presentationId)}?fields=slides(objectId,pageElements(objectId))`,
  { method: 'GET' },
  token.access_token
);
await writeFile(presentationPath, `${JSON.stringify(presentation, null, 2)}\n`, 'utf8');

await runNode([
  resolve(root, 'scripts/build-google-slides-navigation.mjs'),
  resolve(outputDir, 'slide-manifest.json'),
  presentationPath,
  requestsPath
]);

const navigation = JSON.parse(await readFile(requestsPath, 'utf8'));
if (!Array.isArray(navigation.requests) || navigation.requests.length === 0) {
  throw new Error('navigation request list is empty');
}

await googleJson(
  `https://slides.googleapis.com/v1/presentations/${encodeURIComponent(presentationId)}:batchUpdate`,
  {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ requests: navigation.requests })
  },
  token.access_token
);

const verification = await googleJson(
  `https://slides.googleapis.com/v1/presentations/${encodeURIComponent(presentationId)}?fields=slides(objectId,pageElements(objectId,shape(text(textElements(startIndex,endIndex,textRun(content,style(link))))))`,
  { method: 'GET' },
  token.access_token
);
await writeFile(
  resolve(outputDir, 'live-presentation-after-navigation.json'),
  `${JSON.stringify(verification, null, 2)}\n`,
  'utf8'
);

console.log(`Applied ${navigation.requests.length} navigation requests to Google Slides ${presentationId}`);

async function googleJson(url, init, accessToken) {
  const headers = new Headers(init.headers ?? {});
  headers.set('authorization', `Bearer ${accessToken}`);
  const response = await fetch(url, { ...init, headers });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Google API ${response.status}: ${text}`);
  }
  return text ? JSON.parse(text) : {};
}

async function runNode(args) {
  await new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(process.execPath, args, { stdio: 'inherit' });
    child.on('error', rejectPromise);
    child.on('exit', (code) => {
      if (code === 0) resolvePromise();
      else rejectPromise(new Error(`node process failed with exit code ${code}`));
    });
  });
}
