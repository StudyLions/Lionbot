// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Batch upload pet assets to Vercel Blob store
// ============================================================
import { put } from '@vercel/blob';
import { readdir, readFile, stat } from 'fs/promises';
import { join, relative } from 'path';

const ASSETS_DIR = process.argv[2] || 'c:\\Users\\arich\\LionBot2026\\temp-assets';
const PREFIX = 'pet-assets';
const CONCURRENCY = 10;

async function getAllFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await getAllFiles(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

async function uploadBatch(files, startIdx) {
  const batch = files.slice(startIdx, startIdx + CONCURRENCY);
  const results = await Promise.allSettled(
    batch.map(async (filePath) => {
      const rel = relative(ASSETS_DIR, filePath).replace(/\\/g, '/');
      const pathname = `${PREFIX}/${rel}`;
      const content = await readFile(filePath);
      // --- AI-MODIFIED (2026-03-16) ---
      // Purpose: Allow overwriting existing blobs when re-uploading updated assets
      const blob = await put(pathname, content, { access: 'public', addRandomSuffix: false, allowOverwrite: true });
      // --- END AI-MODIFIED ---
      return { pathname, url: blob.url };
    })
  );
  return results;
}

async function main() {
  console.log(`Scanning ${ASSETS_DIR}...`);
  const files = await getAllFiles(ASSETS_DIR);
  console.log(`Found ${files.length} files to upload`);

  let uploaded = 0;
  let failed = 0;
  let firstUrl = null;

  for (let i = 0; i < files.length; i += CONCURRENCY) {
    const results = await uploadBatch(files, i);
    for (const r of results) {
      if (r.status === 'fulfilled') {
        uploaded++;
        if (!firstUrl) firstUrl = r.value.url;
      } else {
        failed++;
        console.error(`FAIL: ${r.reason?.message || r.reason}`);
      }
    }
    const pct = Math.round(((i + results.length) / files.length) * 100);
    process.stdout.write(`\rUploaded ${uploaded}/${files.length} (${pct}%) | Failed: ${failed}`);
  }

  console.log(`\n\nDone! ${uploaded} uploaded, ${failed} failed.`);
  if (firstUrl) {
    const baseUrl = firstUrl.split('/pet-assets/')[0];
    console.log(`\nBlob base URL: ${baseUrl}`);
    console.log(`Set NEXT_PUBLIC_BLOB_URL=${baseUrl} in your env vars`);
  }
}

main().catch(console.error);
