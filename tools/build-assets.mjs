// SWF modules -> public/assets/<module>/{lib.json, atlas-N.webp}
// usage: node tools/build-assets.mjs [module ...]
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync, rmSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import { MaxRectsPacker } from 'maxrects-packer';
import { parseSwf } from './swf.mjs';
import { FOLDERS } from './parts/names.mjs';

const ROOT = new URL('../..', import.meta.url).pathname.replace(/^\/(\w:)/, '$1');
const OUT = join(ROOT, 'web', 'public', 'assets');
const GEN = join(ROOT, 'web', 'src', 'gen');
const RES = 1.5;          // device px per stage px rasterization target
const MAX_TEX = 2048;
const PAD = 2;
const JSON_ONLY = process.argv.includes('--json-only');
const SVG_FONTS = [join(ROOT, 'art/fonts/12_symbol12_Ander Hedge.ttf'), join(ROOT, 'art/fonts/cyrillic/BalsamiqSans-Bold.ttf')]; // for <text> in hand-made art

const ALL = ['screens', 'backgrounds', 'jinn', 'items', 'boss', 'combat_fx', 'loading', 'tutorials',
  'enemy1_normal', 'enemy1_fire', 'enemy1_ice', 'enemy2_normal', 'enemy2_fire', 'enemy2_ice', 'enemy2_snow'];

// user art: web/custom-art/<character>/<part name>.png|svg replaces that part (names: tools/parts/parts.json)
const PARTS = existsSync(join(ROOT, 'web/tools/parts/parts.json')) ? JSON.parse(readFileSync(join(ROOT, 'web/tools/parts/parts.json'), 'utf8')) : {};
function customFile(mod, id) {
  const name = PARTS[mod]?.[id]; if (!name) return null;
  for (const ext of ['.png', '.svg', '.webp']) { const f = join(ROOT, 'web', 'custom-art', FOLDERS[mod] ?? mod, name + ext); if (existsSync(f)) return f; }
  return null;
}
export let customUsed = 0;
// third-party art moved to ../ip_originals (old path -> new readable name)
const IP_RENAMED = existsSync(join(ROOT, 'ip_originals/_png-renames.json')) ? JSON.parse(readFileSync(join(ROOT, 'ip_originals/_png-renames.json'), 'utf8')) : {};

const r2 = (v) => Math.round(v * 100) / 100;
const r4 = (v) => Math.round(v * 10000) / 10000;

function walk(dir) {
  const out = [];
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) out.push(...walk(p)); else out.push(p);
  }
  return out;
}

// ---- class files: class name -> symbol id, frame scripts, declared vars
function readClasses(mod) {
  const dir = join(ROOT, 'scripts_' + mod);
  const classes = {}; const scripts = {};
  for (const f of walk(dir)) {
    if (!f.endsWith('.as')) continue;
    const src = readFileSync(f, 'utf8');
    const em = src.match(/\[Embed\(source="[^"]*", symbol="symbol(\d+)"\)\]/);
    if (!em) continue;
    const pkg = (src.match(/^package\s*([\w.]*)/m) || [])[1] || '';
    const cls = src.match(/class\s+(\S+)\s+extends\s+(\w+)/);
    const name = (pkg ? pkg + '.' : '') + cls[1].replace(/§/g, '');
    const id = +em[1];
    classes[name] = id;
    const fs = src.match(/addFrameScript\(([^)]*)\)/);
    if (fs) {
      const parts = fs[1].split(',').map((s) => s.trim());
      const map = {};
      for (let i = 0; i < parts.length; i += 2) {
        const frame = +parts[i]; const fn = parts[i + 1].replace('this.', '');
        const body = src.match(new RegExp('function ' + fn + '\\(\\) : \\*\\s*\\{([\\s\\S]*?)\\n      \\}'));
        map[frame] = translate(body[1]);
      }
      scripts[id] = map;
    }
  }
  return { classes, scripts };
}

// AS3 frame-script body -> JS body (`this` is the clip)
function translate(body) {
  let s = body.trim();
  s = s.replace(/int\(Math\.ceil\(([^;]*?)\)\)\)/g, '(Math.ceil($1)|0))');
  s = s.replace(/new Event\(("[^"]+")\)/g, '$1');
  s = s.replace(/\b(stop|play|gotoAndPlay|gotoAndStop|dispatchEvent|nextFrame|prevFrame)\(/g, 'this.$1(');
  if (/\bint\(|\bvar\b|:\s*\w+\s*=/.test(s)) throw new Error('untranslated frame script: ' + s);
  return s.replace(/\s+/g, ' ');
}

function matScale(m) {
  return Math.max(Math.hypot(m[0], m[1]), Math.hypot(m[2], m[3]));
}

async function buildModule(mod) {
  let swfPath = join(ROOT, 'scripts_' + mod, '_assets', 'assets.swf');
  if (!existsSync(swfPath)) swfPath = join(ROOT, 'scripts_' + mod, '_assets', mod + '.swf');
  if (!existsSync(swfPath)) { console.log('skip', mod); return null; }
  const swf = parseSwf(swfPath);
  const { classes, scripts } = readClasses(mod);

  // ---- reachability + max scale per character
  const scale = {};
  const children = {};
  for (const [id, sp] of Object.entries(swf.sprites)) {
    const c = new Map(); const cur = {};
    for (const fr of sp.frames) for (const o of fr.ops) {
      if (o.op === 'remove') { delete cur[o.depth]; continue; }
      const st = cur[o.depth] = { ...(o.op === 'move' ? cur[o.depth] : {}), ...o };
      if (o.op === 'move' && cur[o.depth].id === undefined) continue;
      if (st.id === undefined) continue;
      const s = st.matrix ? matScale(st.matrix) : 1;
      c.set(st.id, Math.max(c.get(st.id) || 0, s));
    }
    children[id] = c;
  }
  const roots = new Set(Object.values(classes));
  for (const id of Object.values(swf.exports)) roots.add(id);
  const order = [];
  const seen = new Set();
  const visit = (id) => { if (seen.has(id)) return; seen.add(id); for (const k of (children[id] || new Map()).keys()) visit(k); order.push(id); };
  for (const id of roots) visit(id);
  order.reverse(); // parents before children
  for (const id of roots) scale[id] = Math.max(scale[id] || 0, 1);
  for (const id of order) {
    const s = scale[id] || 0; if (!s) continue;
    for (const [k, ls] of (children[id] || new Map())) scale[k] = Math.max(scale[k] || 0, s * ls);
  }

  const modOut = join(OUT, mod);
  let shapes = {}; let atlasCount = 0; let bytes = 0; let usedShapes = [];
  if (JSON_ONLY && existsSync(join(modOut, 'lib.json'))) {
    const prev = JSON.parse(readFileSync(join(modOut, 'lib.json'), 'utf8'));
    shapes = prev.shapes; atlasCount = prev.atlases; usedShapes = Object.keys(shapes);
  } else {
  // ---- rasterize shapes
  const svgDir = join(ROOT, 'art', mod, 'shapes');
  const rects = [];
  usedShapes = Object.keys(swf.shapes).filter((id) => seen.has(+id));
  for (const id of usedShapes) {
    const b = swf.shapes[id].b;
    const bw = b.xmax - b.xmin, bh = b.ymax - b.ymin;
    if (bw <= 0 || bh <= 0) continue;
    let k = Math.min(Math.max(scale[id], 0.25), 3) * RES;
    if (bw * k > MAX_TEX - 2 * PAD) k = (MAX_TEX - 2 * PAD) / bw;
    if (bh * k > MAX_TEX - 2 * PAD) k = (MAX_TEX - 2 * PAD) / bh;
    const w = Math.max(1, Math.ceil(bw * k)), h = Math.max(1, Math.ceil(bh * k));
    const custom = customFile(mod, id);
    if (custom && !custom.endsWith('.svg')) {
      // a painted replacement: scaled into the original part's box (keep the template's size and margins)
      const px = await sharp(custom).ensureAlpha().resize(w, h, { fit: 'fill' }).raw().toBuffer();
      let am = 0; for (let i = 3; i < px.length; i += 4) if (px[i] > am) { am = px[i]; if (am > 16) break; }
      rects.push({ id: +id, width: w, height: h, px, k: w / bw, b, hb: am <= 16 });
      customUsed++; continue;
    }
    if (custom) customUsed++;
    const svg = readFileSync(custom ?? join(svgDir, id + '.svg'));
    const rv = new Resvg(svg, { fitTo: { mode: 'width', value: w }, imageRendering: 0, shapeRendering: 2, font: { fontFiles: SVG_FONTS, loadSystemFonts: false, defaultFontFamily: 'Ander Hedge' } });
    const img = rv.render();
    const pxBuf = img.pixels;
    let amax = 0; for (let i = 3; i < pxBuf.length; i += 4) if (pxBuf[i] > amax) { amax = pxBuf[i]; if (amax > 16) break; }
    rects.push({ id: +id, width: img.width, height: img.height, px: pxBuf, k: img.width / bw, b, hb: amax <= 16 });
  }

  // ---- bitmaps placed directly on the display list
  const imgDir = join(ROOT, 'art', mod, 'images');
  // only bitmaps the game places itself (on a timeline or as a class); a bitmap used as the fill of a shape is
  // already inside that shape's SVG, and adding it again only wastes atlas memory (and shipped replaced art)
  const placedIds = new Set([...roots]);
  for (const sp of Object.values(swf.sprites)) for (const fr of sp.frames) for (const o of fr.ops) if (o.id !== undefined) placedIds.add(o.id);
  for (const id of Object.keys(swf.bitmaps).filter((id) => seen.has(+id) && placedIds.has(+id))) {
    const src = join(imgDir, id + '.png');
    if (!existsSync(src)) { if (!IP_RENAMED[`${mod}/images/${id}.png`]) console.warn(`  ${mod}: bitmap ${id} not exported`); continue; } // removed third-party art stays out
    const meta = await sharp(src).metadata();
    let k = Math.min(Math.max(scale[id] || 1, 0.25), 2);
    if (meta.width * k > MAX_TEX - 2 * PAD) k = (MAX_TEX - 2 * PAD) / meta.width;
    if (meta.height * k > MAX_TEX - 2 * PAD) k = (MAX_TEX - 2 * PAD) / meta.height;
    const w = Math.max(1, Math.round(meta.width * k)), h = Math.max(1, Math.round(meta.height * k));
    const px = await sharp(src).ensureAlpha().resize(w, h).raw().toBuffer();
    rects.push({ id: +id, width: w, height: h, px, k: w / meta.width, b: { xmin: 0, ymin: 0 } });
  }

  const packer = new MaxRectsPacker(MAX_TEX, MAX_TEX, PAD, { smart: true, pot: false, square: false, allowRotation: false, border: 1 });
  packer.addArray(rects);
  if (existsSync(modOut)) rmSync(modOut, { recursive: true });
  mkdirSync(modOut, { recursive: true });
  atlasCount = packer.bins.length;
  for (let bi = 0; bi < packer.bins.length; bi++) {
    const bin = packer.bins[bi];
    const W = bin.width, H = bin.height;
    const comps = bin.rects.map((r) => ({ input: Buffer.from(r.px), raw: { width: r.width, height: r.height, channels: 4 }, left: r.x, top: r.y }));
    const file = `atlas-${bi}.webp`;
    const buf = await sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite(comps).webp({ quality: 88, alphaQuality: 90, effort: 5 }).toBuffer();
    writeFileSync(join(modOut, file), buf);
    bytes += buf.length;
    for (const r of bin.rects) {
      // frame in atlas px, offset (stage units) and texture scale
      shapes[r.id] = [bi, r.x, r.y, r.width, r.height, r2(r.b.xmin), r2(r.b.ymin), r4(1 / r.k)];
      if (r.hb) shapes[r.id].push(1); // invisible hit area: hit-test by bounds
    }
  }
  } // end rasterize

  // ---- sprites
  const sprites = {};
  for (const [id, sp] of Object.entries(swf.sprites)) {
    if (!seen.has(+id)) continue;
    const labels = [];
    const frames = sp.frames.map((fr, i) => {
      if (fr.label) labels.push([fr.label, i]);
      return fr.ops.map((o) => {
        if (o.op === 'remove') return { d: o.depth, rm: 1 };
        const e = { d: o.depth };
        if (o.op === 'move') e.mv = 1;
        if (o.op === 'replace') e.rp = 1;
        if (o.id !== undefined) e.c = o.id;
        if (o.matrix) e.m = [r4(o.matrix[0]), r4(o.matrix[1]), r4(o.matrix[2]), r4(o.matrix[3]), r2(o.matrix[4]), r2(o.matrix[5])];
        if (o.cx) e.cx = [...o.cx.m.map(r4), ...o.cx.o];
        if (o.name) e.n = o.name;
        if (o.clipDepth) e.cd = o.clipDepth;
        if (o.ratio !== undefined) e.r = o.ratio;
        if (o.filters) e.f = o.filters.map(cleanFilter);
        if (o.blend !== undefined) e.b = o.blend;
        if (o.visible !== undefined) e.v = o.visible;
        if (o.cache) e.ca = 1;
        return e;
      });
    });
    const s = { f: frames };
    if (labels.length) s.l = labels;
    if (scripts[id]) s.s = 1;
    sprites[id] = s;
  }

  const texts = {};
  for (const [id, t] of Object.entries(swf.texts)) {
    if (!seen.has(+id)) continue;
    texts[id] = { ...t, font: t.font !== undefined ? (swf.fonts[t.font] || {}).name : undefined };
  }
  // morph shapes: start/end paths from FFDec's animated SVG export (art/<mod>/morphs/<id>.svg)
  const morphs = {};
  for (const id of Object.keys(swf.morphs).filter((id) => seen.has(+id))) {
    const f = join(ROOT, 'art', mod, 'morphs', id + '.svg');
    if (!existsSync(f)) { console.warn(`  ${mod}: morph ${id} not exported (rendered empty)`); continue; }
    morphs[id] = parseMorph(readFileSync(f, 'utf8'));
  }
  const missing = [...seen].filter((id) => !swf.shapes[id] && !swf.bitmaps[id] && !swf.sprites[id] && !swf.texts[id] && !swf.morphs[id]);
  if (missing.length) console.warn(`  ${mod}: unknown chars ${missing}`);

  const lib = { atlases: atlasCount, shapes, sprites, texts, classes, morphs };
  const json = JSON.stringify(lib);
  writeFileSync(join(modOut, 'lib.json'), json);
  console.log(`${mod}: ${usedShapes.length} shapes, ${Object.keys(sprites).length} sprites, ${atlasCount} atlases ${(bytes / 1024).toFixed(0)} KB, json ${(json.length / 1024).toFixed(0)} KB`);
  return { scripts, classes };
}

/** FFDec morphshape SVG -> [{d:[start,end], fill:[c0,c1], fa:[a0,a1], stroke:[c0,c1], sw:[w0,w1], sa:[a0,a1]}] */
function parseMorph(svg) {
  const out = [];
  for (const m of svg.matchAll(/<path\b([^>]*)>([\s\S]*?)<\/path>/g)) {
    const attrs = m[1], body = m[2];
    const anim = (name) => { const a = body.match(new RegExp('attributeName="' + name + '"[^>]*values="([^"]*)"')); return a ? a[1].split(';') : null; };
    const attr = (name) => (attrs.match(new RegExp('(?:^|[ ])' + name + '="([^"]*)"')) || [])[1];
    const d = anim('d'); if (!d) continue;
    const fill = attr('fill');
    const e = { d };
    if (fill && fill !== 'none') { e.fill = anim('fill') ?? [fill, fill]; const fa = anim('fill-opacity'); e.fa = fa ? fa.map(Number) : [1, 1]; }
    else {
      const st = attr('stroke'); if (!st || st === 'none') continue;
      e.stroke = anim('stroke') ?? [st, st];
      e.sw = (anim('stroke-width') ?? [attr('stroke-width'), attr('stroke-width')]).map(Number);
      const so = attr('stroke-opacity'); e.sa = [so ? +so : 1, so ? +so : 1];
      if (e.sw[0] === 0 && e.sw[1] === 0) continue;
    }
    out.push(e);
  }
  return out;
}

function cleanFilter(f) {
  const o = { ...f };
  for (const k of Object.keys(o)) if (typeof o[k] === 'number') o[k] = r4(o[k]);
  return o;
}

const args = process.argv.slice(2).filter((a) => a !== '--json-only');
const mods = args.length ? args : ALL;
mkdirSync(GEN, { recursive: true });
const scriptsOut = {};
for (const m of mods) {
  const r = await buildModule(m);
  if (r) scriptsOut[m] = r.scripts;
}
// frame scripts -> generated TS (merged with any previously built modules)
const scriptsFile = join(GEN, 'frameScripts.json');
const prev = existsSync(scriptsFile) ? JSON.parse(readFileSync(scriptsFile, 'utf8')) : {};
Object.assign(prev, scriptsOut);
writeFileSync(scriptsFile, JSON.stringify(prev, null, 1));
let ts = '// GENERATED by tools/build-assets.mjs — do not edit\n/* eslint-disable */\nexport const frameScripts: Record<string, Record<number, Record<number, (this: any) => void>>> = {\n';
for (const [m, sc] of Object.entries(prev)) {
  ts += `  ${JSON.stringify(m)}: {\n`;
  for (const [id, fr] of Object.entries(sc)) {
    ts += `    ${id}: { ${Object.entries(fr).map(([f, b]) => `${f}: function () { ${b} }`).join(', ')} },\n`;
  }
  ts += '  },\n';
}
ts += '};\n';
writeFileSync(join(GEN, 'frameScripts.ts'), ts);
