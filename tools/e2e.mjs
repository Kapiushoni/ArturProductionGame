// End-to-end test: plays the game in headless Chrome like a player.
//   1. a new game: intro, the whole tutorial (sword, stats, fight, potion, loot, mixer);
//   2. after a reload: continue, cook book, map pages, a tip of the princess, a dungeon with the pause menu, the end of the fight,
//      back to the map and to the main menu.
// Fails on any page error or when an expected screen does not show up.
// usage: npm run e2e   (starts its own Vite dev server: the scenario uses the dev helpers G / GM / dbg)
// Chrome: $CHROME, or the default Windows install path.
import puppeteer from 'puppeteer-core';
import { createServer } from 'vite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const WEB = fileURLToPath(new URL('..', import.meta.url));
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

// ---------------- helpers inside the page
const HELPERS = () => {
  const stage = () => dbg.player.stage;
  window.E = {
    sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
    /** visible named clips matching re (with their centre on the stage) */
    named(re, root = game, maxDepth = 12) {
      const out = [];
      const walk = (o, d) => {
        if (d > maxDepth || !o) return;
        if (o.name && re.test(o.name) && o.visible !== false) {
          const r = o.getBounds(stage());
          if (r.width > 0) out.push({ n: o.name, x: r.x + r.width / 2, y: r.y + r.height / 2 });
        }
        for (const c of o._ch || []) walk(c, d + 1);
      };
      walk(root, 0);
      return out.filter((b) => b.x > 0 && b.x < 700 && b.y > 0 && b.y < 500);
    },
    async tap(re, what = String(re)) {
      const b = E.named(re)[0];
      if (!b) throw new Error('no button ' + what);
      await G.tap(b.x, b.y);
    },
    /** windows slide in and ignore clicks until then: taps the button until done() */
    async tapUntil(re, done, what, ms = 30000) {
      const t0 = Date.now();
      while (!done() && Date.now() - t0 < ms) {
        if (E.named(re).length) await E.tap(re);
        await E.sleep(1500);
      }
      if (!done()) throw new Error('timed out waiting for ' + what + ' (screens: ' + E.screens() + ')');
    },
    async tapClip(clip) {
      const r = clip.getBounds(stage());
      await G.tap(r.x + r.width / 2, r.y + r.height / 2);
    },
    async until(fn, what, ms = 30000) {
      if (!(await G.until(fn, ms))) throw new Error('timed out waiting for ' + what + ' (screens: ' + E.screens() + ')');
    },
    check(ok, what) {
      if (!ok) throw new Error('failed: ' + what + ' (screens: ' + E.screens() + ')');
    },
    screens: () =>
      ['MainMenu', 'MapView', 'CookBook', 'DungeonView', 'Pause', 'WinWindow', 'LostWindow', 'TransitionWindow', 'TutorialView', 'TutorialViewWithOk']
        .filter((n) => G.find(n))
        .join('+') + ' [' + G.state() + ']',
    tutorialStep: () => GM.services.saveSystem.tutorialStepCompleted(),
    hp: () => GM.app.game.getJinn().stats.getStat(GM.StatType.HEALTH).getValue(),
  };
};

// ---------------- the scenario (each step runs in the page)
const NEW_GAME = [
  ['new game, intro', async () => {
    await E.until(() => G.find('MainMenu'), 'main menu', 60000);
    await E.sleep(6000); // the menu buttons animate in
    await E.tap(/^new_game$/);
    await E.until(() => G.state() === 'intro', 'intro', 90000);
    const t0 = Date.now();
    while (G.state() === 'intro' && Date.now() - t0 < 120000) {
      const arrow = E.named(/^arrow_right$/)[0];
      if (arrow) await G.tap(arrow.x, arrow.y);
      await E.sleep(1500);
    }
    await E.until(() => G.state() === 'game' && G.find('MapView'), 'map', 60000);
    await E.sleep(3000);
  }],
  ['tutorial 1: equip the sword (drag and drop)', async () => {
    await E.until(() => G.find('TutorialView'), 'sword tutorial');
    await G.drag(269, 339, 173, 389);
    await E.until(() => !GM.app.game.getJinn().gear.weapon.isEmpty(), 'sword in the weapon slot', 5000);
  }],
  ['tutorial 2: stats (OK)', async () => {
    await E.until(() => G.find('TutorialViewWithOk'), 'stats tutorial');
    await E.tapUntil(/^ok$/, () => !G.find('TutorialViewWithOk') && E.tutorialStep() >= 2, 'stats tutorial done');
  }],
  ['tutorial 3: a fight, drink a potion', async () => {
    await E.tap(/^dungeon_1$/);
    await E.until(() => G.find('TutorialView') && E.hp() < 50, 'potion tutorial', 90000);
    const before = E.hp();
    const g = GM.app.game;
    let slot = null;
    for (let i = 0; i < 12 && !slot; i++) if (g.inv.itemOfSlot(i)?.getCategory().type === 'C') slot = g.inv.getSlot(i);
    E.check(slot, 'a potion in the inventory');
    g.getJinn().liver.moveFrom(slot.getContent(), slot); // (drag and drop is checked with the sword)
    await E.until(() => E.hp() > before, 'health up after the potion', 5000);
  }],
  ['tutorial 4: win, take all the loot', async () => {
    await E.until(() => G.find('WinWindow'), 'win window', 120000);
    await E.until(() => G.find('TutorialView'), 'take-all tutorial');
    await E.tapUntil(/^loot$/, () => E.tutorialStep() === 4 && G.find('TutorialViewWithOk'), 'loot taken, mixer tutorial');
  }],
  ['tutorials 5-6: the mixer', async () => {
    await E.tapUntil(/^ok$/, () => E.tutorialStep() === 5 && GM.services.tutorial.isMixKnown(), 'mixer enabled');
    const g = GM.app.game;
    const m = g.getMixer();
    const full = [];
    for (let i = 0; i < 12 && full.length < 2; i++) if (g.inv.itemOfSlot(i)) full.push(i);
    E.check(full.length === 2, 'two items to mix');
    m.slot_1.moveFrom(g.inv.itemOfSlot(full[0]), g.inv.getSlot(full[0]));
    m.slot_2.moveFrom(g.inv.itemOfSlot(full[1]), g.inv.getSlot(full[1]));
    E.check(m.canMix(), 'the mixer can mix');
    await E.tapUntil(/^mix_button$/, () => E.tutorialStep() === 6, 'mix tutorial done');
    await E.until(() => !m.slot_3.isEmpty(), 'mix result', 60000);
    E.check(!g.inv.getTrash().locked, 'trash unlocked at the end of the tutorial');
    E.check(GM.services.saveSystem.getExperience() > 0, 'experience saved');
  }],
];
const SCREENS = [
  ['continue the game', async () => {
    await E.until(() => G.find('MainMenu'), 'main menu', 60000);
    await E.sleep(6000);
    await E.tapUntil(/^continue_game$/, () => G.state() === 'game', 'game started');
    await E.until(() => G.find('MapView') && !G.find('TransitionWindow'), 'map', 90000);
    await E.sleep(2000);
  }],
  ['cook book', async () => {
    await E.tapUntil(/^book$/, () => G.find('CookBook'), 'cook book');
    await G.tap(658, 131); // next page
    await E.sleep(1500);
    await E.tapUntil(/^cancel$/, () => !G.find('CookBook'), 'cook book closed');
  }],
  ['map pages', async () => {
    await G.tap(659, 128);
    await E.sleep(2500);
    await G.tap(40, 128);
    await E.sleep(2500);
    E.check(G.find('MapView'), 'still on the map');
  }],
  ['the princess gives a tip when clicked', async () => {
    const princess = G.find('GameView').princess;
    E.check(!GM.app.game.getShmabledum().getLocker().isLocked, 'the princess is not locked');
    await E.tapClip(princess.bg.hitbox);
    await E.until(() => princess.tips.length > 0, 'a tip', 5000);
    await E.sleep(3000); // the tip hides itself
  }],
  ['dungeon 2 with the pause menu', async () => {
    await E.tapUntil(/^dungeon_2$/, () => !G.find('MapView') || G.find('TransitionWindow'), 'leaving the map');
    await E.until(() => G.find('DungeonView') && !G.find('TransitionWindow'), 'dungeon', 60000);
    await E.sleep(1500);
    await E.tapClip(G.find('DungeonView').background.information.pause);
    await E.until(() => G.find('Pause'), 'pause menu');
    await E.tapUntil(/^cancel$/, () => !G.find('Pause'), 'pause menu closed');
  }],
  ['end of the fight, back to the map', async () => {
    await E.until(() => G.find('WinWindow') || G.find('LostWindow'), 'end of the fight', 150000);
    await E.tapUntil(/^level_select$/, () => !G.find('WinWindow') && !G.find('LostWindow') || G.find('TransitionWindow'), 'leaving the dungeon');
    await E.until(() => G.find('MapView') && !G.find('WinWindow') && !G.find('LostWindow') && !G.find('TransitionWindow'), 'map', 60000);
    await E.sleep(2000);
  }],
  ['back to the main menu', async () => {
    await E.tapUntil(/^back$/, () => G.state() === 'mainMenu' || G.find('TransitionWindow'), 'leaving the map');
    await E.until(() => G.state() === 'mainMenu' && !G.find('TransitionWindow'), 'main menu', 60000);
  }],
];

// ---------------- runner
const server = await createServer({ root: WEB, logLevel: 'error', server: { port: 5199 } });
await server.listen();
const url = server.resolvedUrls.local[0];
const profile = mkdtempSync(join(tmpdir(), 'jinn-e2e-'));
const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new', userDataDir: profile, protocolTimeout: 600000,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'],
});
const page = await browser.newPage();
await page.setViewport({ width: 700, height: 500 });
const errors = [];
page.on('pageerror', (e) => errors.push((e.stack || e.message).split('\n').slice(0, 4).join(' | ')));
page.on('console', (m) => {
  if (m.type() === 'error' && !/GL Driver|GL_INVALID|AudioContext|Failed to load resource/.test(m.text())) errors.push('[console] ' + m.text());
});

/** loads the page until the game and the dev helpers are there (Vite may reload once while optimizing) */
async function open(reload) {
  if (reload) await page.reload({ waitUntil: 'load' });
  else await page.goto(url, { waitUntil: 'load' });
  const t0 = Date.now();
  while (Date.now() - t0 < 180000) {
    const ready = await page.evaluate(() => typeof G !== 'undefined' && !!window.game && !!GM.app.swfLoader).catch(() => false);
    if (ready) return page.evaluate(HELPERS);
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('the game did not start');
}
let failed = null;
async function run(steps) {
  for (const [name, step] of steps) {
    if (failed) return;
    const t0 = Date.now();
    try {
      await page.evaluate(step);
      const err = errors.length ? ' — page errors!' : '';
      console.log(`  ok  ${name} (${((Date.now() - t0) / 1000).toFixed(0)}s)${err}`);
    } catch (e) {
      failed = `${name}: ${String(e.message).split('\n')[0]}`;
      console.log(`  FAIL ${failed}`);
    }
  }
}
try {
  console.log('new game:');
  await open(false);
  await run(NEW_GAME);
  if (!failed) {
    console.log('screens:');
    await open(true);
    await run(SCREENS);
  }
} catch (e) {
  failed = String(e.message);
} finally {
  await browser.close();
  await server.close();
  rmSync(profile, { recursive: true, force: true });
}
if (errors.length) console.log('page errors:\n  ' + [...new Set(errors)].join('\n  '));
const ok = !failed && !errors.length;
console.log(ok ? 'e2e passed' : 'e2e FAILED' + (failed ? ': ' + failed : ''));
process.exit(ok ? 0 : 1);
