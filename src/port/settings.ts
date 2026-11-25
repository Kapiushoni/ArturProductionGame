// Port extras: settings panel (volumes, fullscreen, battle speed, language, save export/import),
// in-game buttons (gear, x2), hotkeys, pause audio when the tab is hidden, rotate hint on phones.
import { Sprite } from '@/flash/display';
import { TextField, TextFormat } from '@/flash/text';
import { MouseEvent, KeyboardEvent } from '@/flash/events';
import { clock } from '@/flash/clock';
import { player } from '@/flash/player';
import { setBusVolume, audio, SharedObject } from '@/flash/as3';
import { lang, LANGS, setLang, type Lang } from './i18n';

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
const overlayOpen = (): boolean => { try { return mainCls().gameHolder.gameView.pauseHolder.numChildren > 0; } catch { return false; } };
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
class IconButton extends Sprite {
  label: TextField;
  constructor(text: string, w: number, onClick: () => void) {
    super();
    const g = this.graphics;
    g.lineStyle(2, 0xc9b27a, 1); g.beginFill(0x1f2b2e, 0.92); g.drawRoundRect(0, 0, w, 34, 12);
    this.label = new TextField();
    this.label.width = w; this.label.height = 30; this.label.y = 3;
    const f = new TextFormat('Ander Hedge', 20, 0xf2dea5); f.align = 'center';
    this.label.defaultTextFormat = f; this.label.text = text; this.label.mouseEnabled = false;
    this.addChild(this.label);
    this.buttonMode = true;
    this.addEventListener(MouseEvent.CLICK, onClick);
    this.addEventListener(MouseEvent.ROLL_OVER, () => { this.alpha = 0.85; });
    this.addEventListener(MouseEvent.ROLL_OUT, () => { this.alpha = 1; });
  }
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
let fastBtn: IconButton | null = null;
function refreshFastButton() { if (fastBtn) fastBtn.label.text = settings.fast ? 'x2' : 'x1'; }

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
    const pauseScreen = findDO((o) => o.constructor.name === 'Pause');
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
export function installSettings(mainApp: any) {
  app = mainApp;
  const gear = new IconButton('⚙', 40, openPanel);
  gear.label.defaultTextFormat = Object.assign(new TextFormat('Arial', 22, 0xf2dea5), { align: 'center' });
  gear.label.text = '⚙';
  gear.x = 76; gear.y = 14;
  fastBtn = new IconButton('x1', 44, () => { settings.fast = !settings.fast; save(); refreshFastButton(); });
  fastBtn.x = 80; fastBtn.y = 208;
  refreshFastButton();
  player.stage.addChild(gear);
  player.stage.addChild(fastBtn);
  player.onFrame.push(() => {
    trackPause();
    const st = appState();
    const battle = inBattle();
    gear.visible = st === 'mainMenu' || paused;
    if (paused) { gear.x = 14; gear.y = 14; } else { gear.x = 76; gear.y = 14; }
    fastBtn!.visible = battle && !paused && !overlayOpen();
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
