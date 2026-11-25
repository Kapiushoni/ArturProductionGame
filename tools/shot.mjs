// usage: node tools/shot.mjs <url> <out.png> [waitMs] [js-to-eval-after]
import puppeteer from 'puppeteer-core';
const [url, out, wait = '4000', js] = process.argv.slice(2);
const b = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const p = await b.newPage();
await p.setViewport({ width: 700, height: 500 });
p.on('console', (m) => console.log('[' + m.type() + ']', m.text()));
p.on('requestfailed', (r) => console.log('[reqfail]', r.url()));
p.on('response', (r) => { if (r.status() >= 400) console.log('[http ' + r.status() + ']', r.url()); });
p.on('pageerror', (e) => console.log('[pageerror]', e.stack || e.message));
await p.goto(url, { waitUntil: 'load' });
await new Promise((r) => setTimeout(r, +wait));
if (js) console.log('eval:', JSON.stringify(await p.evaluate(js)));
await p.screenshot({ path: out });
await b.close();
