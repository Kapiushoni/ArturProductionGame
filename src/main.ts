import { player } from './flash/player';
import { lib } from './flash/library';
import { fontMap, setFallbackFonts } from './flash/text';
import { paths } from './flash/as3';
import { PreloaderAP } from './port/preloader';
import { lang } from './port/i18n';
import { installSettings } from './port/settings';
import { installStats } from './port/stats';

lib.define('assets.PreloaderAP', PreloaderAP);
paths.rewrite['locale.txt'] = `locale_${lang}.txt`;
// special events were scheduled for 2013 only: repeat them every year (this year and next, for "next event" hints)
paths.transform['dailyBonus.di'] = (text) => {
  const y = new Date().getFullYear();
  return text.replace(/^(\s*)date_(\d\d)_(\d\d)_\d{4}(\s*=.*)$/gm, (_m, ind, mm, dd, rest) =>
    `${ind}date_${mm}_${dd}_${y}${rest}\n${ind}date_${mm}_${dd}_${y + 1}${rest}`);
};

async function loadFonts() {
  const faces = [
    new FontFace('Ander Hedge', 'url(./fonts/AnderHedge.woff2)'),
    new FontFace('Arial Black PX', 'url(./fonts/ArialBlackPX.woff2)'),
    new FontFace('Cyrillic Fallback', 'url(./fonts/CyrFallback.woff2)'),
  ];
  await Promise.all(faces.map(async (f) => { await f.load(); (document as any).fonts.add(f); }));
  fontMap['Ander Hedge'] = ['Ander Hedge'];
  fontMap['Arial Black'] = ['Arial Black PX', 'Arial Black'];
  // the original fonts only have Latin glyphs: Cyrillic falls back per glyph
  setFallbackFonts(['Cyrillic Fallback', 'Arial', 'sans-serif']);
}

async function viewer(q: URLSearchParams) {
  for (const m of (q.get('mod') ?? 'screens').split(',')) await lib.load(m);
  const C = lib.getClass(q.get('sym') ?? 'assets.MainMenu');
  const mc = new C();
  player.stage.addChild(mc);
  if (q.get('x')) { mc.x = +q.get('x')!; mc.y = +q.get('y')!; }
  if (q.get('s')) mc.scaleX = mc.scaleY = +q.get('s')!;
  if (q.get('f')) mc.gotoAndStop(q.get('f'));
  (window as any).mc = mc;
}

async function boot() {
  await player.init(document.getElementById('game')!);
  await loadFonts();
  document.getElementById('boot')?.remove();
  const q = new URLSearchParams(location.search);
  if (q.has('sym')) return viewer(q);
  const GM = await import('./game/index');
  const app = new GM.main();
  player.stage.addChild(app);


  installSettings(app, { MainMenu: GM.MainMenu, Pause: GM.Pause });
  installStats();

  if (import.meta.env.DEV) {
    const d = await import('./flash/display');
    const tx = await import('./flash/text');
    Object.assign(window as any, { GM, game: app, dbg: { player, hitDeep: d.hitDeep, mouseTarget: d.mouseTarget, allClips: d.allClips, frameListeners: d.frameListeners, liveTexts: tx.liveTexts } });
    (await import('./port/devtools')).installDevtools();
  }
}

boot().catch((e) => { console.error(e); const b = document.getElementById('boot'); if (b) b.textContent = String(e); });
