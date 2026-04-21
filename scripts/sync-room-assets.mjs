// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-21
// Purpose: Sync the bot's local room assets to Vercel Blob CDN so
//          the website and Discord render identical colors. Only
//          files whose size differs from the CDN version (or that
//          are missing on the CDN entirely) are uploaded.
// ============================================================
import { put, head } from '@vercel/blob';
import { readdir, readFile } from 'fs/promises';
import { join, relative } from 'path';
import { existsSync, statSync } from 'fs';

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
if (!TOKEN) {
  console.error('BLOB_READ_WRITE_TOKEN not set. Run with: vercel env pull .env.blob; then load it.');
  process.exit(1);
}

const ASSETS_DIR = process.argv[2]
  || 'C:\\Users\\arich\\LionBot2026\\StudyLion\\src\\modules\\liongotchi\\assets\\rooms';
const PREFIX = 'pet-assets/rooms';
const CONCURRENCY = 8;
const FORCE = process.argv.includes('--force');

if (!existsSync(ASSETS_DIR)) {
  console.error(`Assets dir not found: ${ASSETS_DIR}`);
  process.exit(1);
}

async function getAllFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getAllFiles(full)));
    } else if (/\.(png|gif|jpe?g)$/i.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

async function needsUpload(blobPath, localPath) {
  if (FORCE) return true;
  try {
    const meta = await head(blobPath, { token: TOKEN });
    const localSize = statSync(localPath).size;
    return meta.size !== localSize;
  } catch (err) {
    const msg = err?.message || '';
    if (msg.toLowerCase().includes('not exist') || msg.toLowerCase().includes('not found') || err?.status === 404) {
      return true;
    }
    throw err;
  }
}

async function uploadOne(filePath) {
  const rel = relative(ASSETS_DIR, filePath).replace(/\\/g, '/');
  const blobPath = `${PREFIX}/${rel}`;
  const need = await needsUpload(blobPath, filePath);
  if (!need) return { blobPath, skipped: true };
  const buf = await readFile(filePath);
  const ct = filePath.toLowerCase().endsWith('.gif') ? 'image/gif' : 'image/png';
  const result = await put(blobPath, buf, {
    access: 'public',
    token: TOKEN,
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: ct,
    cacheControlMaxAge: 31536000,
  });
  return { blobPath, url: result.url, skipped: false };
}

async function main() {
  console.log(`Source: ${ASSETS_DIR}`);
  console.log(`Target: ${PREFIX}/<...>`);
  console.log(`Mode:   ${FORCE ? 'FORCE upload all' : 'sync only files that differ'}`);
  const files = await getAllFiles(ASSETS_DIR);
  console.log(`Scanning ${files.length} local files...\n`);

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < files.length; i += CONCURRENCY) {
    const batch = files.slice(i, i + CONCURRENCY);
    const results = await Promise.allSettled(batch.map(uploadOne));
    for (let j = 0; j < results.length; j++) {
      const r = results[j];
      if (r.status === 'fulfilled') {
        if (r.value.skipped) {
          skipped++;
        } else {
          uploaded++;
          console.log(`  uploaded ${r.value.blobPath}`);
        }
      } else {
        failed++;
        console.error(`  FAIL ${batch[j]}: ${r.reason?.message || r.reason}`);
      }
    }
    process.stdout.write(`progress ${Math.min(i + CONCURRENCY, files.length)}/${files.length} (uploaded ${uploaded}, skipped ${skipped}, failed ${failed})\n`);
  }

  console.log(`\nDone. Uploaded ${uploaded}, skipped ${skipped}, failed ${failed}.`);
  if (uploaded > 0) {
    console.log('\nReminder: blob URLs are cached for 1 year. Browsers will fetch the new images on next page load (the URL is the same).');
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
