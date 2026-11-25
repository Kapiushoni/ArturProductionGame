// Dev-only helpers for scripted testing (window.G). Not included in production builds.
import { player } from '@/flash/player';
import * as AS3 from '@/flash/as3';

export function installDevtools() {
  (window as any).AS3 = AS3;
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const pt = (x: number, y: number) => {
    const r = player.app.canvas.getBoundingClientRect();
    return { clientX: r.left + player.ox + x * player.scale, clientY: r.top + player.oy + y * player.scale };
  };
  const ev = (t: string, x: number, y: number) => player.app.canvas.dispatchEvent(new PointerEvent(t, { ...pt(x, y), pointerType: 'mouse', bubbles: true, pointerId: 1 }));
  const game = () => (window as any).game;
  (window as any).G = {
    sleep,
    tap: async (x: number, y: number) => { ev('pointermove', x, y); await sleep(60); ev('pointerdown', x, y); await sleep(60); ev('pointerup', x, y); },
    drag: async (x1: number, y1: number, x2: number, y2: number) => {
      ev('pointermove', x1, y1); ev('pointerdown', x1, y1);
      for (let i = 1; i <= 12; i++) { await sleep(30); ev('pointermove', x1 + (x2 - x1) * i / 12, y1 + (y2 - y1) * i / 12); }
      await sleep(60); ev('pointerup', x2, y2);
    },
    state: () => game()?.fsmAplication?.getActualState().getName(),
    until: async (fn: () => any, ms = 30000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { if (fn()) return true; } catch { /* */ } await sleep(250); } return false; },
    find: (name: string) => { const f = (o: any): any => { if (o.constructor.name === name) return o; for (const c of o._ch || []) { const r = f(c); if (r) return r; } return null; }; return f(game()); },
  };
}
