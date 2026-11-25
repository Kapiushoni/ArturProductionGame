import { parseSwf } from './swf.mjs';
const mods = ['main','screens','jinn','items','boss','combat_fx','loading','tutorials','enemy1_normal','enemy1_fire','enemy1_ice','enemy2_normal','enemy2_fire','enemy2_ice','enemy2_snow'];
const filt = {}, blends = {};
for (const m of mods) {
  const s = parseSwf(`../scripts_${m}/_assets/assets.swf`);
  let masks = 0, ratios = 0, fr = 0;
  for (const sp of Object.values(s.sprites)) { if (sp.frames.length !== sp.fc) console.log('fc mismatch', m); fr += sp.fc;
    for (const f of sp.frames) for (const o of f.ops) { if (o.clipDepth) masks++; if (o.ratio !== undefined) ratios++; if (o.filters) for (const x of o.filters) filt[x.t] = (filt[x.t]||0)+1; if (o.blend) blends[o.blend]=(blends[o.blend]||0)+1; } }
  console.log(m, 'shapes', Object.keys(s.shapes).length, 'sprites', Object.keys(s.sprites).length, 'frames', fr, 'exports', Object.keys(s.exports).length, 'texts', Object.keys(s.texts).length, 'masks', masks, 'morph', Object.keys(s.morphs).length, 'bmp', Object.keys(s.bitmaps).length, 'fonts', JSON.stringify(s.fonts));
  console.log('   ', Object.keys(s.exports).slice(0, 12).join(', '));
}
console.log(filt, blends);
