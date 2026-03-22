import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dir = join(__dirname, '..', 'temp-og-images');
const files = readdirSync(dir).filter(f => f.endsWith('.png')).sort();

const categories = { Marketing: [], Dashboard: [], Server: [], Pet: [] };
for (const f of files) {
  const name = f.replace('.png', '');
  if (name.startsWith('server-')) categories.Server.push(f);
  else if (name.startsWith('dashboard-')) categories.Dashboard.push(f);
  else if (name.startsWith('pet-')) categories.Pet.push(f);
  else categories.Marketing.push(f);
}

let html = `<!DOCTYPE html><html><head><title>LionBot OG Image Preview</title>
<style>
body { background: #111; color: #fff; font-family: system-ui; padding: 40px; margin: 0; }
h1 { text-align: center; margin-bottom: 40px; font-size: 28px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(560px, 1fr)); gap: 24px; }
.card { background: #1a1a2e; border-radius: 12px; overflow: hidden; border: 1px solid #333; }
.card img { width: 100%; display: block; }
.card .name { padding: 12px 16px; font-size: 14px; color: #aaa; font-family: monospace; }
h2 { color: #888; margin-top: 48px; margin-bottom: 16px; font-size: 18px; border-bottom: 1px solid #333; padding-bottom: 8px; }
</style></head><body>
<h1>LionBot OG Images Preview (${files.length} images)</h1>`;

for (const [cat, catFiles] of Object.entries(categories)) {
  html += `<h2>${cat} (${catFiles.length})</h2><div class="grid">`;
  for (const f of catFiles) {
    const b64 = readFileSync(join(dir, f)).toString('base64');
    html += `<div class="card"><img src="data:image/png;base64,${b64}" /><div class="name">${f}</div></div>`;
  }
  html += `</div>`;
}

html += `</body></html>`;
const outPath = join(dir, 'preview.html');
writeFileSync(outPath, html);
const sizeMB = (statSync(outPath).size / 1024 / 1024).toFixed(1);
console.log(`Preview created: ${outPath}`);
console.log(`Size: ${sizeMB} MB`);
