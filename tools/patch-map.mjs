// Paint over the third-party character drawn into the map bitmap (screens shape 668) by cloning nearby terrain.
// Original kept in ../ip_originals/screens/shapes/668.svg. Idempotent.
import { readFileSync, writeFileSync, existsSync, copyFileSync, mkdirSync } from 'node:fs';
import sharp from 'sharp';
const ROOT = new URL('../..', import.meta.url).pathname.replace(/^\/(\w:)/, '$1');
const src = `${ROOT}/web/source/art/screens/shapes/668.svg`;
const orig = `${ROOT}/ip_originals/screens/shapes/668.svg`;
mkdirSync(`${ROOT}/ip_originals/screens/shapes`, { recursive: true });
if (!existsSync(orig)) copyFileSync(src, orig);
const svg = readFileSync(orig, 'utf8');
const m = svg.match(/xlink:href="data:image\/PNG;base64,([^"]+)"/);
const png = Buffer.from(m[1], 'base64');
// region (image px) to cover, and the source region to clone from (same size)
const dst = { left: 636, top: 100, width: 60, height: 64 };
const srcR = { left: 566, top: 112, width: 60, height: 64 };
const patch = await sharp(png).extract(srcR).png().toBuffer();
// feathered ellipse mask
const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${dst.width}" height="${dst.height}"><defs><radialGradient id="g"><stop offset="0.6" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><ellipse cx="${dst.width / 2}" cy="${dst.height / 2}" rx="${dst.width / 2}" ry="${dst.height / 2}" fill="url(#g)"/></svg>`);
const feathered = await sharp(patch).ensureAlpha().composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
const out = await sharp(png).composite([{ input: feathered, left: dst.left, top: dst.top }]).png().toBuffer();
writeFileSync(src, svg.replace(m[1], out.toString('base64')));
await sharp(out).extract({ left: 560, top: 60, width: 200, height: 150 }).resize(400).png().toFile(process.argv[2] ?? `${ROOT}/ip_originals/screens/shapes/668_patched_preview.png`);
console.log('patched 668');
