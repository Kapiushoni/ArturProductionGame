// Port extras: settings panel (volumes, fullscreen, battle speed, language, save export/import),
// in-game buttons (gear, x2), hotkeys, pause audio when the tab is hidden, rotate hint on phones.
import { Sprite, Shape, DisplayObject } from '@/flash/display';
import { modules } from '@/flash/library';
import { Graphics as PGraphics, Text as PText, Container as PContainer } from 'pixi.js';
import { TextField, TextFormat } from '@/flash/text';
import { MouseEvent, KeyboardEvent, Event } from '@/flash/events';
import { clock } from '@/flash/clock';
import { player } from '@/flash/player';
import { setBusVolume, audio, SharedObject } from '@/flash/as3';
import { lang, LANGS, setLang, type Lang } from './i18n';
import { VERSION } from './version';

// ---------------- persisted settings ----------------
type Settings = { music: number; sfx: number; fast: boolean };
const KEY = 'jinn.settings';
export const settings: Settings = { music: 0.8, sfx: 0.9, fast: false, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
const save = () => localStorage.setItem(KEY, JSON.stringify(settings));
setBusVolume(settings.music, settings.sfx);

// ---------------- texts ----------------
const T: Record<Lang, Record<string, string>> = {
  en: { title: 'Settings', music: 'Music', sfx: 'Effects', full: 'Full screen', fast: 'Fast battles (x2)', lang: 'Language', save: 'Saved game', exp: 'Export to file', imp: 'Import from file', impOk: 'Save loaded. The game will restart.', impBad: 'This file is not a save of this game.', keys: 'Keys', close: 'Close', rotate: 'Turn your phone sideways for a bigger picture',
    k: '1–9 — drink the potion from that inventory cell · P / Esc — pause · X — battle speed · F — full screen' },
  ru: { title: 'Настройки', music: 'Музыка', sfx: 'Эффекты', full: 'Полный экран', fast: 'Быстрые бои (x2)', lang: 'Язык', save: 'Сохранение', exp: 'Сохранить в файл', imp: 'Загрузить из файла', impOk: 'Сохранение загружено. Игра перезапустится.', impBad: 'Это не файл сохранения этой игры.', keys: 'Клавиши', close: 'Закрыть', rotate: 'Поверни телефон горизонтально — так картинка будет больше',
    k: '1–9 — выпить зелье из этой ячейки инвентаря · P / Esc — пауза · X — скорость боя · F — полный экран' },
  uk: { title: 'Налаштування', music: 'Музика', sfx: 'Ефекти', full: 'Повний екран', fast: 'Швидкі бої (x2)', lang: 'Мова', save: 'Збереження', exp: 'Зберегти у файл', imp: 'Відкрити з файлу', impOk: 'Збереження завантажено. Гра перезапуститься.', impBad: 'Це не файл збереження цієї гри.', keys: 'Клавіші', close: 'Закрити', rotate: 'Поверни телефон горизонтально — так картинка буде більшою',
    k: '1–9 — випити зілля з цієї комірки інвентарю · P / Esc — пауза · X — швидкість бою · F — повний екран' },
};
const t = T[lang];

// ---------------- game state helpers ----------------
let app: any = null;
const mainCls = () => app?.constructor;
const appState = (): string => { try { return app.fsmAplication.getActualState().getName(); } catch { return ''; } };
const gameState = (): string => { try { return mainCls().gameHolder.gameView.fsm.getActualState().getName(); } catch { return ''; } };
export const inBattle = () => appState() === 'game' && (gameState() === 'dungeon' || gameState() === 'boss');
/** pause / win / lose windows live in GameView.pauseHolder */
/** something covers the battle: pause/win/lose windows, the recipe book, or the loading transition */
const overlayOpen = (): boolean => {
  try {
    const M = mainCls(); const gv = M.gameHolder.gameView;
    return gv.pauseHolder.numChildren > 0 || gv.cookBook != null || M.transitionHolder.numChildren > 0;
  } catch { return false; }
};
let paused = false; let hookedGame: any = null;
function trackPause() {
  const g = mainCls()?.game;
  if (g && g !== hookedGame) { hookedGame = g; paused = false; g.onPause.add((v: boolean) => { paused = !!v; }); }
}
function findDO(pred: (o: any) => boolean, root: any = app): any {
  if (!root) return null;
  if (pred(root)) return root;
  for (const c of root._ch || []) { const r = findDO(pred, c); if (r) return r; }
  return null;
}
const click = (o: any) => o && o.dispatchEvent(new MouseEvent(MouseEvent.CLICK));

// ---------------- fullscreen ----------------
export const canFullscreen = () => !!document.fullscreenEnabled;
export async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else {
      await document.documentElement.requestFullscreen({ navigationUI: 'hide' } as any);
      try { await (screen.orientation as any)?.lock?.('landscape'); } catch { /* not supported */ }
    }
  } catch (e) { console.warn('fullscreen', e); }
}

// ---------------- in-canvas buttons ----------------

/** part of a polygon (flat x,y list) above the line y = yCut (Sutherland–Hodgman against one half-plane) */
function clipAbove(pts: number[], yCut: number): number[] {
  const out: number[] = []; const n = pts.length / 2;
  for (let i = 0; i < n; i++) {
    const x1 = pts[i * 2], y1 = pts[i * 2 + 1], x2 = pts[((i + 1) % n) * 2], y2 = pts[((i + 1) % n) * 2 + 1];
    const in1 = y1 <= yCut, in2 = y2 <= yCut;
    if (in1) out.push(x1, y1);
    if (in1 !== in2) { const t = (yCut - y1) / (y2 - y1); out.push(x1 + (x2 - x1) * t, yCut); }
  }
  return out;
}

/** settings button: the game's own round-square music button (screens sprite 130) with a gear instead of the note */
const SOUND_BUTTON_SPRITE = 130;
function makeGearButton(onClick: () => void): DisplayObject {
  const mc: any = modules.get('screens')!.create(SOUND_BUTTON_SPRITE);
  const icon = new Shape();
  const g = new PGraphics();
  // classic cog in the note's style: white fill, light-blue shading, very thin dark-teal outline, see-through hub
  const cog = (cx: number, cy: number) => {
    const teeth = 8, rOut = 12.2, rBody = 9.4, tw = 0.2, bw = 0.3, pts: number[] = [];
    for (let i = 0; i < teeth; i++) {
      const a = (i / teeth) * Math.PI * 2;
      for (const [r, d] of [[rBody, -bw], [rOut, -tw], [rOut, tw], [rBody, bw]] as const) pts.push(cx + Math.cos(a + d) * r, cy + Math.sin(a + d) * r);
    }
    return pts;
  };
  g.poly(cog(0.8, 0.8)).fill({ color: 0x9fdcec, alpha: 0.9 });            // soft shading offset, like the note's
  g.circle(0.8, 0.8, 4.2).cut();
  g.poly(cog(0, 0)).fill(0xffffff);
  g.circle(0, 0, 4.2).cut();
  // upper half in the note's shaded tone (the note is bluish on top, white below)
  g.poly(clipAbove(cog(0, 0), 0.5)).fill(0xc9e7ef);
  g.circle(0, 0, 4.2).cut();
  g.poly(cog(0, 0)).stroke({ width: 1, color: 0x1d4650, join: 'round' });
  g.circle(0, 0, 4.2).stroke({ width: 1, color: 0x1d4650 });
  icon._c.addChild(g);
  icon.x = -1.5; icon.y = 4;
  // same layer as the note, i.e. under the button's glass highlight that darkens the icon's upper half
  if (mc.icon) mc.addChildAt(icon, mc.getChildIndex(mc.icon) + 1); else mc.addChild(icon);
  const hideNote = () => { if (mc.icon) mc.icon.visible = false; };
  hideNote();
  mc.addEventListener(Event.ENTER_FRAME, hideNote);
  mc.mouseChildren = false; mc.buttonMode = true;
  mc.addEventListener(MouseEvent.CLICK, onClick);
  mc.addEventListener(MouseEvent.ROLL_OVER, () => mc.gotoAndPlay('mouseOver'));
  mc.addEventListener(MouseEvent.ROLL_OUT, () => mc.gotoAndPlay('mouseOut'));
  return mc;
}

/** "x1"/"x2" lettering in the style of the music note: white, light-blue upper half, soft blue shadow, thin dark outline */
function speedGlyph(): { view: PContainer; set: (s: string) => void } {
  const view = new PContainer();
  const mk = (fill: number) => new PText({ text: 'x1', style: { fontFamily: ['Ander Hedge', 'Arial Black', 'sans-serif'], fontSize: 25, fill, stroke: { color: 0x1d4650, width: 2, join: 'round' }, padding: 4 } });
  const shadow = mk(0x9fdcec); shadow.style.stroke = { color: 0x9fdcec, width: 2, join: 'round' }; shadow.alpha = 0.9;
  const low = mk(0xffffff), high = mk(0xc9e7ef);
  const cut = new PGraphics(); high.mask = cut;
  view.addChild(shadow, low, high, cut);
  const set = (str: string) => {
    for (const t of [shadow, low, high]) { t.text = str; t.anchor.set(0.5); }
    shadow.position.set(0.8, 0.8);
    // upper half in the shaded tone
    cut.clear().rect(-30, -30, 60, 30.5).fill(0xffffff);
  };
  set('x1');
  return { view, set };
}

/** speed button: a copy of the game's own pause button with "x1"/"x2" lettering instead of its icon */
function makeSpeedButton(pause: any, onClick: () => void): { mc: any; set: (s: string) => void } {
  const mc: any = new pause.constructor();
  // children: shadow, body, gold frame ("on"/"off"), and on top the pause-bars icon
  const icon: any = mc._ch[mc._ch.length - 1];
  const holder = new Shape();
  const glyph = speedGlyph();
  holder._c.addChild(glyph.view);
  mc.addChild(holder);
  const hideIcon = () => { if (icon) { icon.visible = false; holder.x = icon.x; holder.y = icon.y; } };
  hideIcon();
  mc.addEventListener(Event.ENTER_FRAME, hideIcon);
  mc.mouseChildren = false; mc.buttonMode = true;
  mc.addEventListener(MouseEvent.CLICK, onClick);
  mc.addEventListener(MouseEvent.ROLL_OVER, () => mc.gotoAndPlay('mouseOver'));
  mc.addEventListener(MouseEvent.ROLL_OUT, () => mc.gotoAndPlay('mouseOut'));
  return { mc, set: glyph.set };
}

// ---------------- settings panel (DOM) ----------------
let panel: HTMLDivElement | null = null;
function css() {
  const s = document.createElement('style');
  s.textContent = `
#jset{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:#0008;z-index:10;font-family:'Ander Hedge','Cyrillic Fallback',sans-serif;color:#f2dea5}
#jset .box{background:#2b2620;border:4px solid #8a6a3e;outline:2px solid #c9a462;outline-offset:-9px;border-radius:16px;padding:22px 26px;min-width:300px;max-width:min(440px,92vw);max-height:92vh;overflow:auto;box-shadow:0 10px 40px #000a}
#jset h2{margin:0 0 14px;text-align:center;font-size:30px;color:#ffd36a;letter-spacing:1px}
#jset label{display:flex;align-items:center;justify-content:space-between;gap:14px;margin:10px 0;font-size:20px}
#jset input[type=range]{width:170px;accent-color:#e0b84a}
#jset input[type=checkbox]{width:22px;height:22px;accent-color:#e0b84a}
#jset select,#jset button{font:inherit;font-size:18px;color:#2b1d14;background:#e9d6a8;border:2px solid #8a6a3e;border-radius:10px;padding:5px 12px;cursor:pointer}
#jset .row{display:flex;gap:10px;justify-content:center;margin:8px 0;flex-wrap:wrap}
#jset .keys{font-family:'Cyrillic Fallback',sans-serif;font-size:14px;line-height:1.5;opacity:.85;margin-top:12px}
#jset .close{display:block;margin:16px auto 0;font-size:20px;padding:6px 26px;background:#e0b84a}
#jrot{position:fixed;left:0;right:0;bottom:0;padding:10px 14px;background:#2b2620ee;color:#f2dea5;font:15px 'Cyrillic Fallback',sans-serif;text-align:center;z-index:9;display:none}
@media (orientation:portrait) and (max-width:700px){#jrot{display:block}}`;
  document.head.appendChild(s);
}
function buildPanel() {
  css();
  const d = document.createElement('div');
  d.id = 'jset';
  const langOpts = LANGS.map((l) => `<option value="${l}" ${l === lang ? 'selected' : ''}>${{ en: 'English', ru: 'Русский', uk: 'Українська' }[l]}</option>`).join('');
  d.innerHTML = `<div class="box" role="dialog" aria-label="${t.title}"><h2>${t.title}</h2>
<label>${t.music}<input id="jmus" type="range" min="0" max="100" value="${Math.round(settings.music * 100)}"></label>
<label>${t.sfx}<input id="jsfx" type="range" min="0" max="100" value="${Math.round(settings.sfx * 100)}"></label>
${canFullscreen() ? `<label>${t.full}<input id="jfull" type="checkbox"></label>` : ''}
<label>${t.fast}<input id="jfast" type="checkbox" ${settings.fast ? 'checked' : ''}></label>
<label>${t.lang}<select id="jlang">${langOpts}</select></label>
<label style="justify-content:center">${t.save}</label>
<div class="row"><button id="jexp">${t.exp}</button><button id="jimp">${t.imp}</button><input id="jfile" type="file" accept=".json,application/json" hidden></div>
<div class="keys"><b>${t.keys}:</b> ${t.k}</div>
<button class="close" id="jclose">${t.close}</button></div>`;
  document.body.appendChild(d);
  const $ = (id: string) => d.querySelector('#' + id) as HTMLInputElement;
  $('jmus').oninput = () => { settings.music = +$('jmus').value / 100; setBusVolume(settings.music, settings.sfx); save(); };
  $('jsfx').oninput = () => { settings.sfx = +$('jsfx').value / 100; setBusVolume(settings.music, settings.sfx); save(); };
  if (canFullscreen()) $('jfull').onchange = () => toggleFullscreen();
  $('jfast').onchange = () => { settings.fast = $('jfast').checked; save(); refreshFastButton(); };
  ($('jlang') as unknown as HTMLSelectElement).onchange = (e) => setLang((e.target as HTMLSelectElement).value as Lang);
  $('jexp').onclick = () => {
    const blob = new Blob([SharedObject.exportAll()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `desert-of-doom-save-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  $('jimp').onclick = () => $('jfile').click();
  $('jfile').onchange = async () => {
    const f = $('jfile').files?.[0]; if (!f) return;
    try { SharedObject.importAll(await f.text()); alertBox(t.impOk); setTimeout(() => location.reload(), 1200); }
    catch { alertBox(t.impBad); }
  };
  $('jclose').onclick = () => closePanel();
  d.onclick = (e) => { if (e.target === d) closePanel(); };
  document.addEventListener('fullscreenchange', () => { const c = d.querySelector('#jfull') as HTMLInputElement | null; if (c) c.checked = !!document.fullscreenElement; });
  panel = d;
}
function alertBox(msg: string) {
  const box = panel!.querySelector('.keys') as HTMLElement;
  box.textContent = msg;
}
export function openPanel() {
  if (!panel) buildPanel();
  panel!.style.display = 'flex';
}
function closePanel() { if (panel) panel.style.display = 'none'; }
const panelOpen = () => panel?.style.display === 'flex';

// ---------------- battle speed ----------------
let fastBtn: { mc: any; set: (s: string) => void } | null = null;
let pauseBtn: any = null;
let menuRef: any = null;
let versionLabel: TextField | null = null;
function refreshFastButton() { fastBtn?.set(settings.fast ? 'x2' : 'x1'); }

// ---------------- hotkeys ----------------
function drinkFromCell(n: number) {
  try {
    const g = mainCls().game; const jinn = g.getJinn(); const liver = jinn.liver;
    const slot = g.getInventory().getSlot(n); const item = slot && slot.getContent();
    if (item && liver.canMoveFrom(item, slot)) liver.moveFrom(item, slot);
  } catch (e) { console.warn('hotkey potion', e); }
}
function togglePause() {
  if (paused) {
    const pauseScreen = findDO((o) => o instanceof GC.Pause);
    click(pauseScreen?.bg?.cancel);
  } else if (inBattle()) {
    click(findDO((o) => o.constructor._libName === 'assets.ButtonPause'));
  }
}
function onKey(e: KeyboardEvent) {
  if (panelOpen()) { if (e.key === 'Escape') closePanel(); return; }
  const k = e.key.toLowerCase();
  if (k >= '1' && k <= '9' && inBattle() && !paused && !overlayOpen()) drinkFromCell(+k - 1);
  else if (k === 'p' || k === 'escape' || e.code === 'KeyP') togglePause();
  else if (k === 'x' || e.code === 'KeyX') { settings.fast = !settings.fast; save(); refreshFastButton(); }
  else if (k === 'f' || e.code === 'KeyF') toggleFullscreen();
}

// ---------------- install ----------------
/** game classes (looked up with instanceof: class names are minified in the production build) */
let GC: { MainMenu: any; Pause: any } = { MainMenu: null, Pause: null };

export function installSettings(mainApp: any, gameClasses: { MainMenu: any; Pause: any }) {
  app = mainApp; GC = gameClasses;
  // created once the game's graphics are loaded (it reuses the music button artwork)
  let gear: DisplayObject | null = null;
  player.onFrame.push(() => {
    trackPause();
    const st = appState();
    const battle = inBattle();
    if (!gear && modules.has('screens')) gear = makeGearButton(openPanel);
    // The settings button lives inside the screen it belongs to, so transitions/animations cover it
    // together with the neighbouring buttons: main menu -> next to the music button; pause -> in the pause window.
    let host: any = null, gx = 0, gy = 0;
    if (st === 'mainMenu') {
      if (!menuRef || !menuRef.stage) menuRef = findDO((o) => o instanceof GC.MainMenu);
      const snd = menuRef?.bg?.container?.sound;
      if (snd) {
        // music moves one slot left (offset on top of the timeline position: setting .x would freeze the fly-in)
        if (snd._m[4] !== snd.__myx) { snd._scripted = false; const m = snd._m.slice(); m[4] -= 58; snd._setM(m); snd.__myx = m[4]; }
        host = snd.parent; gx = snd.x + 58; gy = snd.y;
      }
    } else if (paused) {
      const ps = findDO((o) => o instanceof GC.Pause);
      if (ps) { host = ps; gx = 48; gy = 37; }
    }
    // version label in the menu's top-left corner (inside the menu, so transitions cover it too)
    if (st === 'mainMenu' && menuRef?.bg && versionLabel?.parent !== menuRef.bg) {
      versionLabel = new TextField();
      versionLabel.width = 120; versionLabel.height = 20; versionLabel.x = 10; versionLabel.y = 6;
      versionLabel.defaultTextFormat = new TextFormat('Ander Hedge', 14, 0xc9b27a);
      versionLabel.text = 'v' + VERSION; versionLabel.alpha = 0.85; versionLabel.mouseEnabled = false;
      menuRef.bg.addChild(versionLabel);
    }
    if (gear) {
      if (host) {
        if (gear.parent !== host) host.addChild(gear);
        gear.x = gx; gear.y = gy; gear.visible = true;
      } else if (gear.parent) gear.parent.removeChild(gear);
    }
    // the speed button lives next to the game's own pause button (same layer), so everything that covers
    // or reveals the pause button (recipe book, loading screen, windows) does the same to it
    if (battle) {
      if (!pauseBtn || !pauseBtn.stage) pauseBtn = findDO((o) => o.constructor._libName === 'assets.ButtonPause');
      if (pauseBtn && !fastBtn) { fastBtn = makeSpeedButton(pauseBtn, () => { settings.fast = !settings.fast; save(); refreshFastButton(); }); refreshFastButton(); }
      const fb = fastBtn?.mc;
      if (pauseBtn && fb) {
        if (fb.parent !== pauseBtn.parent) pauseBtn.parent.addChildAt(fb, pauseBtn.parent.getChildIndex(pauseBtn) + 1);
        // right next to the pause button, same size
        const w = pauseBtn._localBounds().width * Math.abs(pauseBtn.scaleX);
        fb.x = pauseBtn.x + w + 2; fb.y = pauseBtn.y; fb.scaleX = pauseBtn.scaleX; fb.scaleY = pauseBtn.scaleY;
        fb.visible = pauseBtn.visible;
      }
    } else if (fastBtn?.mc.parent) {
      fastBtn.mc.parent.removeChild(fastBtn.mc); pauseBtn = null;
    }
    clock.scale = battle && settings.fast ? 2 : 1;
  });
  player.stage.addEventListener(KeyboardEvent.KEY_DOWN, onKey as any);
  // silence and freeze when the tab is hidden
  document.addEventListener('visibilitychange', () => {
    try { if (document.hidden) audio().suspend(); else audio().resume(); } catch { /* */ }
  });
  // phones held upright: suggest landscape
  const rot = document.createElement('div'); rot.id = 'jrot'; rot.textContent = t.rotate;
  rot.onclick = () => rot.remove();
  if (!panel) css();
  document.body.appendChild(rot);
}
