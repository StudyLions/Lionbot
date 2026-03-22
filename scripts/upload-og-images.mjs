// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Upload OG images to Vercel Blob under og-images/ prefix
// ============================================================
import { put } from '@vercel/blob';
import { readdir, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = join(__dirname, '..', 'temp-og-images');
const PREFIX = 'og-images';

async function main() {
  const allFiles = await readdir(IMAGES_DIR);
  const pngFiles = allFiles.filter(f => f.endsWith('.png')).sort();
  console.log(`Found ${pngFiles.length} OG images to upload\n`);

  let uploaded = 0;
  let failed = 0;
  const urls = {};

  for (const file of pngFiles) {
    const pathname = `${PREFIX}/${file}`;
    try {
      const content = await readFile(join(IMAGES_DIR, file));
      const blob = await put(pathname, content, {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'image/png',
      });
      uploaded++;
      urls[file] = blob.url;
      process.stdout.write(`\r[${Math.round(uploaded / pngFiles.length * 100)}%] ${uploaded}/${pngFiles.length} uploaded`);
    } catch (err) {
      failed++;
      console.error(`\nFAIL: ${file} - ${err.message}`);
    }
  }

  console.log(`\n\nDone! ${uploaded} uploaded, ${failed} failed.\n`);
  console.log('URLs:');
  for (const [file, url] of Object.entries(urls)) {
    console.log(`  ${file} -> ${url}`);
  }
}

main().catch(console.error);
