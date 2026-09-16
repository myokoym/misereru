import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
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
const manifestPath = resolve(outputDir, 'slide-manifest.json');
const sourcePath = resolve(root, 'prototype/deck/content.json');
await mkdir(outputDir, { recursive: true });

const presentation = await googleJson(
  `https://slides.googleapis.com/v1/presentations/${encodeURIComponent(presentationId)}?fields=slides(objectId,pageElements(objectId))`,
  { method: 'GET' },
  token.access_token
);
await writeFile(presentationPath, `${JSON.stringify(presentation, null, 2)}\n`, 'utf8');

await runNode([
  resolve(root, 'scripts/build-google-slides-navigation.mjs'),
  manifestPath,
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

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const source = JSON.parse(await readFile(sourcePath, 'utf8'));
const links = collectLinks(verification);

const expectedInternalTargets = new Set(
  manifest.toc.map((item) => navigation.pageObjectIdByKey[item.key])
);
for (const target of expectedInternalTargets) {
  if (!target || !links.pageObjectIds.has(target)) {
    throw new Error(`missing generated internal link target: ${target ?? '(unresolved)'}`);
  }
}

const expectedExternalUrls = new Set();
for (const slide of source.slides ?? []) {
  for (const block of slide.blocks ?? []) {
    if (block.type === 'link' && block.url) expectedExternalUrls.add(block.url);
  }
}
for (const url of expectedExternalUrls) {
  if (!links.urls.has(url)) {
    throw new Error(`deck output lost external hyperlink: ${url}`);
  }
}

const report = {
  presentationId,
  slideCount: verification.slides?.length ?? 0,
  expectedInternalLinkTargets: [...expectedInternalTargets],
  observedInternalLinkTargets: [...links.pageObjectIds],
  expectedExternalUrls: [...expectedExternalUrls],
  observedExternalUrls: [...links.urls]
};
await writeFile(
  resolve(outputDir, 'navigation-verification.json'),
  `${JSON.stringify(report, null, 2)}\n`,
  'utf8'
);

console.log(
  `Applied ${navigation.requests.length} navigation requests and verified ${expectedInternalTargets.size} internal + ${expectedExternalUrls.size} external links on Google Slides ${presentationId}`
);

function collectLinks(presentationResource) {
  const pageObjectIds = new Set();
  const urls = new Set();
  for (const slide of presentationResource.slides ?? []) {
    for (const element of slide.pageElements ?? []) {
      for (const textElement of element.shape?.text?.textElements ?? []) {
        const link = textElement.textRun?.style?.link;
        if (link?.pageObjectId) pageObjectIds.add(link.pageObjectId);
        if (link?.url) urls.add(link.url);
      }
    }
  }
  return { pageObjectIds, urls };
}

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
