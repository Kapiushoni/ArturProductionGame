// Moves third-party character shapes listed in tools/ip.json to ../ip_originals and writes placeholders.
// Idempotent: originals already moved are left alone; placeholders are regenerated from them.
import { readFileSync, writeFileSync, mkdirSync, existsSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';

const ROOT = new URL('../..', import.meta.url).pathname.replace(/^\/(\w:)/, '$1');
const cfg = JSON.parse(readFileSync(join(ROOT, 'web/tools/ip.json'), 'utf8'));
const OUTLINE = '#3d2c1e';

function flat(svg, color) {
  if (/<image\b/.test(svg)) return null;
  return svg
    .replace(/fill="(?!none)[^"]*"/g, `fill="${color}"`)
    .replace(/stroke="(?!none)[^"]*"/g, `stroke="${OUTLINE}"`)
    .replace(/<(linearGradient|radialGradient)[\s\S]*?<\/\1>/g, '');
}
function sizeOf(svg) {
  const w = parseFloat((svg.match(/width="([\d.]+)px"/) || [])[1] || '10');
  const h = parseFloat((svg.match(/height="([\d.]+)px"/) || [])[1] || '10');
  return { w, h };
}
function keepRoot(svg, inner) {
  // keep the outer <svg ...> and first <g transform> so bounds/offsets stay identical
  const open = svg.match(/<svg[^>]*>/)[0];
  return `<?xml version="1.0" encoding="UTF-8"?>\n${open}\n${inner}\n</svg>`;
}
function panel(svg) {
  const { w, h } = sizeOf(svg);
  const s = Math.min(w, h);
  return keepRoot(svg, `<rect x="0" y="0" width="${w}" height="${h}" rx="${s * 0.04}" fill="#2b2620" stroke="#8a7a55" stroke-width="${Math.max(2, s * 0.02)}"/>
<path d="M0 0 L${w} ${h} M${w} 0 L0 ${h}" stroke="#4a4234" stroke-width="${Math.max(1, s * 0.01)}"/>
<text x="${w / 2}" y="${h / 2 + s * 0.06}" font-family="Arial" font-weight="bold" font-size="${s * 0.16}" fill="#c9b27a" text-anchor="middle">ART</text>`);
}
function capsule(svg, color) {
  const { w, h } = sizeOf(svg);
  const r = Math.min(w, h) * 0.45, sw = Math.max(1.5, Math.min(w, h) * 0.025);
  return keepRoot(svg, `<rect x="${sw}" y="${h * 0.12}" width="${w - 2 * sw}" height="${h * 0.88 - sw}" rx="${r}" fill="${color}" stroke="${OUTLINE}" stroke-width="${sw}"/>`);
}
// ---- recolouring by colour class (keeps the original drawing and its animation, changes the palette)
function hsl(hex) {
  const n = parseInt(hex.slice(1), 16); const r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; let h = 0, s = 0;
  if (mx !== mn) { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; }
  return { h, s, l };
}
const shade = (light, dark, l) => (l > 0.55 ? light : dark);
const PALETTES = {
  // hero "Jinn": blue clothes -> teal tunic, white/lavender -> cream turban, skin stays skin
  hero: ({ h, s, l }) => (l < 0.18 ? null : s < 0.2 && l > 0.7 ? '#f3ead8' : h >= 185 && h <= 260 ? shade('#2aa3a3', '#176b6b', l) : h >= 260 && h < 300 && l > 0.6 ? '#f3ead8' : (h < 45 || h > 340) && l > 0.55 ? shade('#e2a774', '#c98a59', l + 0.05) : null),
  // alchemist (replaces the advisor): pink hair -> green, light coat -> purple robe, skin stays
  alch: ({ h, s, l }) => (l < 0.18 ? null : h >= 285 && h <= 345 && s > 0.3 ? shade('#7ad485', '#3f9a4b', l) : (h >= 150 && h <= 230) || (s < 0.2 && l > 0.7) ? shade('#8a6cc0', '#5a3f88', l) : null),
};
function remap(svg, palette) {
  if (/<image\b/.test(svg)) return null;
  const fn = PALETTES[palette];
  return svg.replace(/(fill|stop-color)="#([0-9a-fA-F]{6})"/g, (m, attr, hex) => { const c = fn(hsl('#' + hex)); return c ? `${attr}="${c}"` : m; });
}
function heroCapsule(svg) { // torso+hood blob: cream turban on top, teal tunic below
  const { w, h } = sizeOf(svg);
  const r = Math.min(w, h) * 0.45, sw = Math.max(1.5, Math.min(w, h) * 0.025), top = h * 0.12, split = h * 0.45;
  return keepRoot(svg, `<defs><clipPath id="cap"><rect x="${sw}" y="${top}" width="${w - 2 * sw}" height="${h * 0.88 - sw}" rx="${r}"/></clipPath></defs>
<g clip-path="url(#cap)"><rect x="0" y="0" width="${w}" height="${split}" fill="#f3ead8"/><rect x="0" y="${split}" width="${w}" height="${h}" fill="#1f8a8a"/>
<rect x="0" y="${h * 0.74}" width="${w}" height="${h * 0.07}" fill="#f0a03c"/><path d="M0 ${split * 0.62} Q${w / 2} ${split * 0.45} ${w} ${split * 0.62}" fill="none" stroke="#d8ccb2" stroke-width="${sw * 1.6}"/></g>
<circle cx="${w * 0.5}" cy="${split * 0.42}" r="${Math.min(w, h) * 0.06}" fill="#d6334a" stroke="${OUTLINE}" stroke-width="${sw}"/>
<rect x="${sw}" y="${top}" width="${w - 2 * sw}" height="${h * 0.88 - sw}" rx="${r}" fill="none" stroke="${OUTLINE}" stroke-width="${sw}"/>`);
}
function heroFace(svg) { // the face disc: skin + simple friendly face looking right
  const { w, h } = sizeOf(svg);
  const r = Math.min(w, h) / 2 - 2, cx = w / 2, cy = h / 2, sw = Math.max(1.5, r * 0.08);
  return keepRoot(svg, `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#e2a774" stroke="${OUTLINE}" stroke-width="${sw}"/>
<circle cx="${cx + r * 0.05}" cy="${cy - r * 0.12}" r="${r * 0.11}" fill="${OUTLINE}"/><circle cx="${cx + r * 0.5}" cy="${cy - r * 0.12}" r="${r * 0.11}" fill="${OUTLINE}"/>
<path d="M${cx - r * 0.05} ${cy + r * 0.25} Q${cx + r * 0.3} ${cy + r * 0.55} ${cx + r * 0.62} ${cy + r * 0.25}" fill="#7a2a1e" stroke="${OUTLINE}" stroke-width="${sw}"/>
<ellipse cx="${cx - r * 0.3}" cy="${cy + r * 0.15}" rx="${r * 0.14}" ry="${r * 0.09}" fill="#ee8f7a" opacity="0.6"/>`);
}
function empty(svg) {
  const { w, h } = sizeOf(svg);
  return keepRoot(svg, `<rect x="0" y="0" width="${w}" height="${h}" fill="#000" fill-opacity="0"/>`);
}

let n = 0;
for (const [mod, groups] of Object.entries(cfg)) {
  if (mod.startsWith('_')) continue;
  const src = join(ROOT, 'web', 'source', 'art', mod, 'shapes');
  const dst = join(ROOT, 'ip_originals', mod, 'shapes');
  mkdirSync(dst, { recursive: true });
  for (const [mode, ids] of Object.entries(groups)) {
    for (const id of ids) {
      const orig = join(dst, id + '.svg');
      const cur = join(src, id + '.svg');
      if (!existsSync(orig)) {
        if (!existsSync(cur)) { console.warn('missing', mod, id); continue; }
        renameSync(cur, orig);
        // png preview of the original for reference
        try { writeFileSync(join(dst, id + '.png'), new Resvg(readFileSync(orig), { fitTo: { mode: 'width', value: 400 } }).render().asPng()); } catch {}
      }
      if (mode === 'art') continue; // hand-made replacement written by tools/art/render.mjs
      const svg = readFileSync(orig, 'utf8');
      let out = null;
      if (mode.startsWith('flat:')) out = flat(svg, mode.slice(5)) ?? panel(svg);
      else if (mode.startsWith('capsule:')) out = capsule(svg, mode.slice(8));
      else if (mode.startsWith('remap:')) out = remap(svg, mode.slice(6)) ?? panel(svg);
      else if (mode === 'heroCapsule') out = heroCapsule(svg);
      else if (mode === 'heroFace') out = heroFace(svg);
      else if (mode === 'empty') out = empty(svg);
      else if (mode.startsWith('nofill:')) { out = svg; for (const c of mode.slice(7).split(',')) out = out.split('fill="' + c + '"').join('fill="none"'); }
      else if (mode === 'panel') out = panel(svg);
      writeFileSync(cur, out);
      n++;
    }
  }
}
console.log('placeholders written:', n);
