import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const manifestPath = resolve(root, process.argv[2] ?? 'dist/deck/slide-manifest.json');
const presentationPath = resolve(root, process.argv[3] ?? 'prototype/deck/mock-presentation.json');
const outputPath = resolve(root, process.argv[4] ?? 'dist/deck/navigation-requests.json');

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const presentation = JSON.parse(await readFile(presentationPath, 'utf8'));

const tocSlideId = 'misereruTocSlide';
const tocTextId = 'misereruTocText';
const originalSlides = (presentation.slides ?? []).filter((slide) => slide.objectId !== tocSlideId);

if (originalSlides.length !== manifest.slides.length) {
  throw new Error(
    `slide count mismatch: manifest=${manifest.slides.length}, presentation=${originalSlides.length}`
  );
}

const pageObjectIdByKey = new Map();
for (let index = 0; index < manifest.slides.length; index += 1) {
  const descriptor = manifest.slides[index];
  const page = originalSlides[index];
  pageObjectIdByKey.set(descriptor.key, page.objectId);
}

const tocItems = manifest.toc.map((item) => {
  const pageObjectId = pageObjectIdByKey.get(item.key);
  if (!pageObjectId) throw new Error(`TOC key not found in slide map: ${item.key}`);
  return { ...item, pageObjectId };
});

const textLines = ['目次', ...tocItems.map((item) => item.label)];
const text = textLines.join('\n');
const ranges = utf16LineRanges(text);

const requests = [];
if ((presentation.slides ?? []).some((slide) => slide.objectId === tocSlideId)) {
  requests.push({ deleteObject: { objectId: tocSlideId } });
}

requests.push(
  {
    createSlide: {
      objectId: tocSlideId,
      insertionIndex: 1
    }
  },
  {
    createShape: {
      objectId: tocTextId,
      shapeType: 'TEXT_BOX',
      elementProperties: {
        pageObjectId: tocSlideId,
        size: {
          width: { magnitude: 7600000, unit: 'EMU' },
          height: { magnitude: 3900000, unit: 'EMU' }
        },
        transform: {
          scaleX: 1,
          scaleY: 1,
          translateX: 772000,
          translateY: 550000,
          unit: 'EMU'
        }
      }
    }
  },
  {
    insertText: {
      objectId: tocTextId,
      insertionIndex: 0,
      text
    }
  },
  {
    updateTextStyle: {
      objectId: tocTextId,
      textRange: { type: 'ALL' },
      style: {
        fontFamily: 'Noto Sans CJK JP',
        fontSize: { magnitude: 18, unit: 'PT' }
      },
      fields: 'fontFamily,fontSize'
    }
  },
  {
    updateTextStyle: {
      objectId: tocTextId,
      textRange: {
        type: 'FIXED_RANGE',
        startIndex: ranges[0].start,
        endIndex: ranges[0].end
      },
      style: {
        bold: true,
        fontSize: { magnitude: 28, unit: 'PT' }
      },
      fields: 'bold,fontSize'
    }
  }
);

for (let index = 0; index < tocItems.length; index += 1) {
  const range = ranges[index + 1];
  requests.push({
    updateTextStyle: {
      objectId: tocTextId,
      textRange: {
        type: 'FIXED_RANGE',
        startIndex: range.start,
        endIndex: range.end
      },
      style: {
        link: { pageObjectId: tocItems[index].pageObjectId }
      },
      fields: 'link'
    }
  });
}

const output = {
  version: 1,
  strategy: 'manifest-order-to-pageObjectId',
  pageObjectIdByKey: Object.fromEntries(pageObjectIdByKey),
  requests
};

await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(`Generated ${requests.length} Google Slides navigation requests at ${outputPath}`);

function utf16LineRanges(value) {
  const result = [];
  let start = 0;
  for (const line of value.split('\n')) {
    const length = utf16Length(line);
    result.push({ start, end: start + length });
    start += length + 1;
  }
  return result;
}

function utf16Length(value) {
  return Buffer.byteLength(value, 'utf16le') / 2;
}
