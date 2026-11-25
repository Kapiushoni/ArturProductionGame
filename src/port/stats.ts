// Hidden performance overlay: FPS, worst frame, JS memory, device mode.
// Toggle with the ` key (Ё on a Russian layout) or open the game with ?stats=1 (phones).
import { player } from '@/flash/player';
import { lowPower } from '@/flash/device';
import { atlasScale } from '@/flash/library';

export function installStats() {
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;left:4px;bottom:4px;z-index:99;font:12px/1.3 monospace;color:#9f9;background:rgba(0,0,0,.65);padding:3px 6px;border-radius:4px;pointer-events:none;white-space:pre;display:none';
  document.body.appendChild(el);
  let on = new URLSearchParams(location.search).get('stats') === '1';
  const show = () => { el.style.display = on ? 'block' : 'none'; };
  show();
  window.addEventListener('keydown', (e) => { if (e.code === 'Backquote') { on = !on; show(); } });
  let frames = 0, worst = 0, last = performance.now(), t0 = last;
  player.app.ticker.add(() => {
    const now = performance.now();
    worst = Math.max(worst, now - last); last = now; frames++;
    if (now - t0 < 1000 || !on) return;
    const fps = Math.round(frames * 1000 / (now - t0));
    const mem = (performance as any).memory ? Math.round((performance as any).memory.usedJSHeapSize / 1048576) + ' MB' : 'n/a';
    const r = player.app.renderer;
    el.textContent = `${fps} fps  worst ${Math.round(worst)} ms\nJS ${mem}  res ${r.resolution}x  atlas ${atlasScale}${lowPower ? '  low-power' : ''}`;
    frames = 0; worst = 0; t0 = now;
  });
}
