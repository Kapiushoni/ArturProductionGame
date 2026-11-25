// contact sheet of shapes: node tools/contact.mjs <module> <out.png> [from] [count]
import { readFileSync, readdirSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
const [mod, out, from = '0', count = '120'] = process.argv.slice(2);
const dir = `source/art/${mod}/shapes`;
const ids = readdirSync(dir).map((f) => +f.replace('.svg', '')).sort((a, b) => a - b).slice(+from, +from + +count);
const C = 10, S = 110;
const comps = [];
for (let i = 0; i < ids.length; i++) {
  let px;
  try {
    px = new Resvg(readFileSync(`${dir}/${ids[i]}.svg`), { fitTo: { mode: 'width', value: S - 10 } }).render();
  } catch { continue; }
  const img = await sharp(Buffer.from(px.asPng())).resize(S - 10, S - 24, { fit: 'inside' }).png().toBuffer();
  const x = (i % C) * S, y = Math.floor(i / C) * S;
  comps.push({ input: img, left: x + 5, top: y + 20 });
  comps.push({ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="18"><text x="3" y="14" font-size="14" font-family="Arial" fill="#c00">${ids[i]}</text></svg>`), left: x, top: y });
}
const rows = Math.ceil(ids.length / C);
await sharp({ create: { width: C * S, height: rows * S, channels: 4, background: '#dde' } }).composite(comps).png().toFile(out);
console.log(ids.length, 'shapes', ids[0], '..', ids.at(-1));
