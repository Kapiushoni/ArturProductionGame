// Renders scenes to SVG files that replace placeholder shapes, plus PNG previews.
// usage: node tools/art/render.mjs [--preview-only] [scene ...]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import { scenes } from './scenes.mjs';
import { svgDoc } from './kit.mjs';

const ROOT = new URL('../../..', import.meta.url).pathname.replace(/^\/(\w:)/, '$1');
const PREVIEW = 'C:/Users/user/AppData/Local/Temp/claude/6a4d0f2636dba533/e88dfcab-e289-4847-8358-c963a26d473b/scratchpad/art';
export const FONTS = [join(ROOT, 'art/fonts/12_symbol12_Ander Hedge.ttf'), join(ROOT, 'art/fonts/cyrillic/BalsamiqSans-Bold.ttf')];

/** which shape each scene replaces: [module, shapeId] */
export const TARGETS = {
  menu: ['screens', 231],
  intro1: ['screens', 576], intro2: ['screens', 573], intro3: ['screens', 570], intro4: ['screens', 567],
  outro1: ['screens', 173], outro2: ['screens', 164], outro3: ['screens', 155], outro4: ['screens', 149], outro5: ['screens', 146],
  pauseBanner: ['screens', 114], winBanner: ['screens', 262], loseBanner: ['screens', 295], labPopup: ['screens', 368], heroPortrait: ['screens', 561],
};

const args = process.argv.slice(2);
const previewOnly = args.includes('--preview-only');
const names = args.filter((a) => !a.startsWith('--'));
mkdirSync(PREVIEW, { recursive: true });
for (const name of names.length ? names : Object.keys(scenes)) {
  const sc = scenes[name]();
  const [mod, id] = TARGETS[name] ?? [];
  let outW = sc.w * 2, outH = sc.h * 2;
  if (mod) { // keep the exact pixel size of the shape being replaced
    const orig = readFileSync(join(ROOT, 'ip_originals', mod, 'shapes', id + '.svg'), 'utf8').slice(0, 600);
    outW = parseFloat(orig.match(/width="([\d.]+)px"/)[1]); outH = parseFloat(orig.match(/height="([\d.]+)px"/)[1]);
  }
  const svg = svgDoc(outW, outH, `<svg x="0" y="0" width="${outW}" height="${outH}" viewBox="0 0 ${sc.w} ${sc.h}" preserveAspectRatio="xMidYMid slice">${sc.body}</svg>`, sc.defs);
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 900 }, font: { fontFiles: FONTS, loadSystemFonts: false, defaultFontFamily: 'Ander Hedge' } }).render().asPng();
  writeFileSync(join(PREVIEW, name + '.png'), png);
  if (mod && !previewOnly) writeFileSync(join(ROOT, 'web', 'source', 'art', mod, 'shapes', id + '.svg'), svg);
  console.log(name, mod ? `-> ${mod}/${id} (${outW}x${outH})` : '(preview)');
}
