// Builds the custom art kit:
//   tools/parts/parts.json                     module -> { shape id: "readable/name" }   (used by build-assets)
//   ../custom-art/_originals/<folder>/<name>.png  every part exactly as the game draws it (templates to paint over)
//   ../custom-art/_catalog/<folder>.png           contact sheet with the names
// usage: node tools/parts/catalog.mjs [module ...]
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import sharp from 'sharp';
import { Resvg } from '@resvg/resvg-js';
import { FOLDERS, NAMES } from './names.mjs';

const WEB = new URL('../..', import.meta.url).pathname.replace(/^\/(\w:)/, '$1');
const ASSETS = join(WEB, 'public', 'assets');
const KIT = join(WEB, '..', 'custom-art');
const OUT_JSON = join(WEB, 'tools', 'parts', 'parts.json');
const ROOT = join(WEB, '..');
const SVG_FONTS = [join(ROOT, 'art/fonts/12_symbol12_Ander Hedge.ttf'), join(ROOT, 'art/fonts/cyrillic/BalsamiqSans-Bold.ttf')];
/** the part as the base game art draws it (used instead of the atlas when the atlas holds the user's replacement) */
async function baseArt(mod, id, w, h) {
  const svg = join(ROOT, 'art', mod, 'shapes', id + '.svg');
  if (existsSync(svg)) {
    const r = new Resvg(readFileSync(svg), { fitTo: { mode: 'width', value: w }, font: { fontFiles: SVG_FONTS, loadSystemFonts: false, defaultFontFamily: 'Ander Hedge' } }).render();
    return sharp(Buffer.from(r.asPng())).resize(w, h, { fit: 'fill' }).png().toBuffer();
  }
  const img = join(ROOT, 'art', mod, 'images', id + '.png');
  if (existsSync(img)) return sharp(img).resize(w, h, { fit: 'fill' }).png().toBuffer();
  return null;
}
const hasCustom = (folder, name) => ['.png', '.svg', '.webp'].some((e) => existsSync(join(KIT, folder, name + e)));

const kebab = (s) => s.replace(/^assets\./, '').replace(/^\w+_fla\./, '').replace(/_\d+$/, '')
  .replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/[._\s]+/g, '-').toLowerCase().replace(/-+/g, '-').replace(/^-|-$/g, '');

/** where each shape is used: nearest class names up the sprite tree */
function contexts(d) {
  const clsOf = new Map(Object.entries(d.classes).map(([k, v]) => [v, k]));
  const parents = new Map();
  for (const [id, sp] of Object.entries(d.sprites)) for (const fr of sp.f) for (const o of fr) if (o.c !== undefined) {
    if (!parents.has(o.c)) parents.set(o.c, new Set());
    parents.get(o.c).add(+id);
  }
  const memo = new Map();
  const up = (id, seen) => {
    if (memo.has(id)) return memo.get(id);
    const out = [];
    for (const p of parents.get(id) ?? []) {
      if (seen.has(p)) continue;
      if (clsOf.has(p)) out.push(clsOf.get(p));
      else out.push(...up(p, new Set([...seen, p])));
    }
    const r = [...new Set(out)]; memo.set(id, r); return r;
  };
  return (id) => up(id, new Set([id]));
}

function autoName(mod, ctx) {
  const fx = ctx.find((c) => /(^|\.)fx_/.test(c));
  if (fx) return 'effects/' + kebab(fx).replace(/^fx-/, '') + '/frame';
  if (!ctx.length) return 'misc/part';
  const c = kebab(ctx[0]).replace(new RegExp('^' + mod.replace('_', '-') + '-'), '');
  if (mod === 'items') return c + '/part';
  if (/^enemy|^boss|^jinn/.test(mod)) return 'animation-' + c.split('-').pop() + '/part';
  return c + '/part';
}

async function buildModule(mod, all) {
  const libPath = join(ASSETS, mod, 'lib.json');
  if (!existsSync(libPath)) return;
  const d = JSON.parse(readFileSync(libPath, 'utf8'));
  const folder = FOLDERS[mod] ?? mod;
  const manual = new Map();
  for (const [name, ids] of Object.entries(NAMES[mod] ?? {})) for (const id of ids) manual.set(id, name);
  const ctxOf = contexts(d);
  const atlases = [];
  for (let i = 0; i < d.atlases; i++) atlases.push(sharp(join(ASSETS, mod, `atlas-${i}.webp`)));
  const ids = Object.keys(d.shapes).map(Number).sort((a, b) => a - b);

  // crop every part from the atlas (the exact pixels the game draws) and drop invisible ones
  const parts = [];
  for (const id of ids) {
    const [a, x, y, w, h] = d.shapes[id];
    if (!(w >= 1 && h >= 1) || x == null || y == null) continue; // not in an atlas (e.g. bitmaps placed directly)
    const png = await atlases[a].clone().extract({ left: x, top: y, width: w, height: h }).png().toBuffer();
    const { data } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let amax = 0; for (let i = 3; i < data.length; i += 4) if (data[i] > amax) { amax = data[i]; if (amax > 24) break; }
    if (amax <= 24 && !manual.has(id)) continue; // invisible (hit areas, removed art) unless named on purpose
    parts.push({ id, png, w, h, base: manual.get(id) ?? autoName(mod, ctxOf(id)) });
  }
  // number duplicates in id order: arm-1, arm-2... (a single part keeps the plain name)
  const count = new Map(); for (const p of parts) count.set(p.base, (count.get(p.base) ?? 0) + 1);
  const seen = new Map();
  for (const p of parts) {
    const n = (seen.get(p.base) ?? 0) + 1; seen.set(p.base, n);
    p.name = count.get(p.base) > 1 ? `${p.base}-${n}` : p.base;
  }
  all[mod] = Object.fromEntries(parts.map((p) => [p.id, p.name]));
  for (const p of parts) if (hasCustom(folder, p.name)) { const b = await baseArt(mod, p.id, p.w, p.h); if (b) p.png = b; }

  // originals
  const odir = join(KIT, '_originals', folder);
  rmSync(odir, { recursive: true, force: true });
  for (const p of parts) {
    const f = join(odir, p.name + '.png');
    mkdirSync(dirname(f), { recursive: true });
    writeFileSync(f, p.png);
  }
  // catalog sheet, grouped by name (all arms together, all shields together...)
  const coll = new Intl.Collator('en', { numeric: true });
  parts.sort((x, y) => coll.compare(x.name, y.name));
  const C = 8, CW = 170, CH = 170, IMG = 120;
  const comps = [];
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    const x = (i % C) * CW, y = Math.floor(i / C) * CH;
    const img = await sharp(p.png).resize(IMG, IMG, { fit: 'inside', withoutEnlargement: false }).png().toBuffer();
    const m = await sharp(img).metadata();
    comps.push({ input: img, left: x + Math.round((CW - m.width) / 2), top: y + 6 + Math.round((IMG - m.height) / 2) });
    const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const [dirPart, file] = p.name.includes('/') ? [p.name.slice(0, p.name.lastIndexOf('/') + 1), p.name.slice(p.name.lastIndexOf('/') + 1)] : ['', p.name];
    comps.push({
      input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${CW}" height="40"><text x="${CW / 2}" y="15" text-anchor="middle" font-size="12" font-family="Arial" fill="#667">${esc(dirPart)}</text><text x="${CW / 2}" y="32" text-anchor="middle" font-size="15" font-weight="bold" font-family="Arial" fill="#222">${esc(file)}</text></svg>`),
      left: x, top: y + IMG + 8,
    });
  }
  mkdirSync(join(KIT, '_catalog'), { recursive: true });
  const rows = Math.max(1, Math.ceil(parts.length / C));
  await sharp({ create: { width: C * CW, height: rows * CH, channels: 4, background: '#e4e4ec' } })
    .composite(comps).png().toFile(join(KIT, '_catalog', folder + '.png'));
  mkdirSync(join(KIT, folder), { recursive: true });
  console.log(`${folder.padEnd(22)} ${parts.length} parts`);
}

const all = existsSync(OUT_JSON) ? JSON.parse(readFileSync(OUT_JSON, 'utf8')) : {};
const mods = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(FOLDERS);
for (const m of mods) { await buildModule(m, all); writeFileSync(OUT_JSON, JSON.stringify(all, null, 1)); }
