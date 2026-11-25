// npm run art — rebuilds the game graphics of every character whose files in ../custom-art changed
// (added, edited or deleted) since the last run. Then reload the game page.
//   npm run art -- --all     rebuild every character that has custom files
//   npm run art -- --kit     also regenerate custom-art/_originals and _catalog (after names.mjs changes)
import { readdirSync, statSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';
import { FOLDERS } from './names.mjs';

const WEB = new URL('../..', import.meta.url).pathname.replace(/^\/(\w:)/, '$1');
const KIT = join(WEB, '..', 'custom-art');
const STATE = join(KIT, '.build-state.json');
const args = process.argv.slice(2);
const node = (script, more) => {
  const r = spawnSync(process.execPath, [join(WEB, script), ...more], { cwd: WEB, stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

if (args.includes('--kit') || !existsSync(join(WEB, 'tools/parts/parts.json'))) node('tools/parts/catalog.mjs', []);

const files = (dir) => {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) out.push(...files(p));
    else if (/\.(png|svg|webp)$/i.test(f)) out.push(p);
  }
  return out;
};
// files whose name matches no part are ignored by the build: say so
const PARTS = JSON.parse(readFileSync(join(WEB, 'tools/parts/parts.json'), 'utf8'));
let unknown = 0;
for (const [mod, folder] of Object.entries(FOLDERS)) {
  const names = new Set(Object.values(PARTS[mod] ?? {}));
  for (const f of files(join(KIT, folder))) {
    const n = relative(join(KIT, folder), f).replace(/\\/g, '/').replace(/\.(png|svg|webp)$/i, '');
    if (!names.has(n)) { console.warn(`WARNING: custom-art/${folder}/${n} — no part with this name (see custom-art/_originals/${folder}/), file ignored`); unknown++; }
  }
}
if (unknown) console.warn('');

const prev = existsSync(STATE) ? JSON.parse(readFileSync(STATE, 'utf8')) : {};
const next = {};
const changed = [];
for (const [mod, folder] of Object.entries(FOLDERS)) {
  const sig = files(join(KIT, folder)).map((f) => { const s = statSync(f); return `${relative(KIT, f)}|${s.size}|${Math.round(s.mtimeMs)}`; }).sort().join('\n');
  next[mod] = sig;
  if (args.includes('--all') ? sig !== '' : sig !== (prev[mod] ?? '')) changed.push(mod);
}
if (!changed.length) { console.log('Nothing changed in custom-art. (npm run art -- --all rebuilds everything with custom files)'); process.exit(0); }
console.log('Rebuilding:', changed.map((m) => FOLDERS[m]).join(', '));
node('tools/build-assets.mjs', changed);
writeFileSync(STATE, JSON.stringify(next, null, 1));
for (const m of changed) {
  const n = files(join(KIT, FOLDERS[m])).length;
  console.log(`  ${FOLDERS[m]}: ${n} custom file(s)`);
}
console.log('Done. Reload the game page to see the new art.');
