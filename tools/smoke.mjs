// Smoke test: open the game in headless Chrome, wait for the main menu, fail on any page error.
// usage: node tools/smoke.mjs [url]   (dev server must be running: npm run dev)
// Screenshots go to tools/.out/ (or $SHOT_DIR).
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';

const OUT = (process.env.SHOT_DIR || new URL('./.out/', import.meta.url).pathname.replace(/^\/(\w:)/, '$1')).replace(/\/?$/, '/');
mkdirSync(OUT, { recursive: true });
const url = process.argv[2] || 'http://localhost:5173/';

const b = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'],
});
const p = await b.newPage();
await p.setViewport({ width: 700, height: 500 });
const errors = [];
p.on('pageerror', (e) => errors.push((e.stack || e.message).split('\n').slice(0, 4).join(' | ')));
p.on('console', (m) => { if (m.type() === 'error' && !/GL Driver|GL_INVALID|AudioContext|Failed to load resource/.test(m.text())) errors.push('[console] ' + m.text()); });
p.on('response', (r) => { if (r.status() >= 400 && !r.url().includes('favicon')) errors.push('[http ' + r.status() + '] ' + r.url()); });

await p.goto(url, { waitUntil: 'load' });
const t0 = Date.now();
let ok = false;
while (Date.now() - t0 < 60000) {
  ok = await p.evaluate(() => !!(window.game && window.GM && window.game.stage)).catch(() => false);
  if (ok) break;
  await new Promise((r) => setTimeout(r, 500));
}
await new Promise((r) => setTimeout(r, 6000)); // let the preloader and menu settle
await p.screenshot({ path: OUT + 'smoke-menu.png' });
const classes = await p.evaluate(() => Object.keys(window.GM || {}).length).catch(() => 0);
await b.close();

console.log(`game started: ${ok}, exported classes: ${classes}, ${Date.now() - t0}ms`);
console.log(`screenshot: ${OUT}smoke-menu.png`);
if (errors.length) { console.log('ERRORS:\n  ' + [...new Set(errors)].join('\n  ')); }
process.exit(ok && !errors.length ? 0 : 1);
