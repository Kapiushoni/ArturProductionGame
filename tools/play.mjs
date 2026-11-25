// scripted play-through: node tools/play.mjs "<steps>" [url]
// steps (separated by ;): wait:ms | click:x,y | move:x,y | drag:x1,y1,x2,y2 | key:Key | shot:name | eval:js | evalf:file.js | until:file.js,timeoutMs
// The browser profile persists between runs (game saves live in localStorage).
import puppeteer from 'puppeteer-core';
import { readFileSync } from 'node:fs';

const OUT = 'C:/Users/user/AppData/Local/Temp/claude/6a4d0f2636dba533/e88dfcab-e289-4847-8358-c963a26d473b/scratchpad/';
const [steps, url = 'http://localhost:5173/'] = process.argv.slice(2);
const b = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', userDataDir: OUT + 'chrome-profile',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'],
});
const p = await b.newPage();
await p.setViewport({ width: 700, height: 500 });
const seen = new Map();
const log = (s) => { const n = (seen.get(s) || 0) + 1; seen.set(s, n); if (n <= 2) console.log(s); };
p.on('console', (m) => { const t = m.text(); if (!/GL Driver|GL_INVALID|\[vite\]|AudioContext was not allowed|Failed to load resource/.test(t)) log('[' + m.type() + '] ' + t); });
p.on('pageerror', (e) => log('[pageerror] ' + (e.stack || e.message).split('\n').slice(0, 4).join(' | ')));
p.on('response', (r) => { if (r.status() >= 400 && !r.url().includes('favicon')) log('[http ' + r.status() + '] ' + r.url()); });
await p.goto(url, { waitUntil: 'load' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ev = async (code) => {
  try { return await p.evaluate(code); } catch (e) { return 'eval error: ' + String(e.message).split('\n')[0]; }
};
for (const st of steps.split(';').filter(Boolean)) {
  const i = st.indexOf(':');
  const k = st.slice(0, i), v = st.slice(i + 1);
  if (k === 'wait') await sleep(+v);
  else if (k === 'click') { const [x, y] = v.split(',').map(Number); await p.mouse.move(x, y); await sleep(150); await p.mouse.down(); await sleep(80); await p.mouse.up(); }
  else if (k === 'move') { const [x, y] = v.split(',').map(Number); await p.mouse.move(x, y); }
  else if (k === 'drag') {
    const [x1, y1, x2, y2] = v.split(',').map(Number);
    await p.mouse.move(x1, y1); await p.mouse.down();
    for (let j = 1; j <= 10; j++) { await p.mouse.move(x1 + (x2 - x1) * j / 10, y1 + (y2 - y1) * j / 10); await sleep(40); }
    await p.mouse.up();
  }
  else if (k === 'key') await p.keyboard.press(v);
  else if (k === 'shot') { await p.screenshot({ path: OUT + v + '.png' }); console.log('shot', v); }
  else if (k === 'eval') console.log('eval:', JSON.stringify(await ev(v)));
  else if (k === 'evalf') console.log('eval:', JSON.stringify(await ev(readFileSync(v, 'utf8')), null, 1));
  else if (k === 'until') { // wait until the file's expression is truthy
    const [f, t = '30000'] = v.split(',');
    const code = readFileSync(f, 'utf8'); const t0 = Date.now(); let r;
    while (Date.now() - t0 < +t) { r = await ev(code); if (r && !String(r).startsWith('eval error')) break; await sleep(500); }
    console.log('until', f, '->', JSON.stringify(r), `${Date.now() - t0}ms`);
  }
}
await b.close();
