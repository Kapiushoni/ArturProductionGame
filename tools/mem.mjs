// Memory of the whole browser (all Chrome processes, like the Task Manager) while the game runs.
// node tools/mem.mjs [url] [label]   (needs a dev server: uses the window.G helpers)
// Scenario: main menu -> Continue (or New Game + intro) -> map -> first dungeon at x2 for 60 s.
import puppeteer from 'puppeteer-core';
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, rmSync } from 'node:fs';

const SCR = 'C:/Users/user/AppData/Local/Temp/claude/6a4d0f2636dba533/e88dfcab-e289-4847-8358-c963a26d473b/scratchpad/';
const [url = 'http://localhost:5173/', label = 'run'] = process.argv.slice(2);
const prof = SCR + 'mem-profile-' + label;
if (existsSync(prof)) rmSync(prof, { recursive: true, force: true });
if (existsSync(SCR + 'chrome-profile')) cpSync(SCR + 'chrome-profile', prof, { recursive: true });
const b = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', userDataDir: prof,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required', '--enable-precise-memory-info'],
});
const root = b.process().pid;

const PS = "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | Select-Object ProcessId,ParentProcessId,PrivatePageCount,CommandLine | ConvertTo-Json -Compress";
function browserMem() {
  const list = JSON.parse(execFileSync('powershell', ['-NoProfile', '-Command', PS]).toString());
  const kids = new Map(); const byPid = new Map();
  for (const r of list) { byPid.set(r.ProcessId, r); if (!kids.has(r.ParentProcessId)) kids.set(r.ParentProcessId, []); kids.get(r.ParentProcessId).push(r.ProcessId); }
  let sum = 0; const parts = []; const st = [root];
  while (st.length) {
    const pid = st.pop(); const r = byPid.get(pid);
    if (r) {
      const mb = Math.round(r.PrivatePageCount / 1048576); sum += mb;
      const t = (r.CommandLine || '').match(/--type=([\w-]+)/); const u = (r.CommandLine || '').match(/--utility-sub-type=([\w.]+)/);
      parts.push([(t ? t[1] : 'browser') + (u ? ':' + u[1].split('.').pop() : ''), mb]);
    }
    for (const c of kids.get(pid) || []) st.push(c);
  }
  return { sum, parts: parts.filter((x) => x[1] >= 20).sort((a, c) => c[1] - a[1]).map((x) => x.join(' ')).join(', ') };
}

const p = await b.newPage();
await p.setViewport({ width: 1280, height: 720 });
p.on('pageerror', (e) => console.log('[pageerror]', e.message.split('\n')[0]));
await p.goto(url, { waitUntil: 'load' });
const ev = (f, ...a) => p.evaluate(f, ...a);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const stat = async (name) => {
  const js = await ev(() => ({ heap: Math.round(performance.memory.usedJSHeapSize / 1048576), clips: window.dbg?.allClips.size, texts: window.dbg?.liveTexts.size }));
  const m = browserMem();
  console.log(`${label}\t${name}\tbrowser ${m.sum} MB\tjs heap ${js.heap} MB\tclips ${js.clips}\ttexts ${js.texts}\n    ${m.parts}`);
};
await p.waitForFunction(() => window.G && window.G.state() === 'mainMenu', { timeout: 60000 });
await sleep(3000);
await stat('menu');
await ev(() => { localStorage.setItem('jinn.settings', JSON.stringify({ ...JSON.parse(localStorage.getItem('jinn.settings') || '{}'), fast: true })); });
await ev(() => G.tap(350, 455));
const inGame = await p.waitForFunction(() => G.state() === 'game', { timeout: 8000 }).then(() => true, () => false);
if (!inGame) { // no saved game: New Game, then click through the intro
  await ev(() => G.tap(350, 395));
  for (let i = 0; i < 60; i++) {
    if (await ev(() => G.state() === 'game')) break;
    await ev(() => G.tap(350, 250)); await sleep(1000);
  }
}
await sleep(5000);
await stat('map');
await ev(async () => { if (G.find('MapView')) { await G.tap(35, 124); await G.sleep(2000); } await G.tap(102, 161); });
for (let t = 20; t <= 60; t += 20) { await sleep(20000); await stat(`dungeon ${t}s`); }
await b.close();
rmSync(prof, { recursive: true, force: true });
