// Game clock: scaled time (x2 combat speed), paused when the tab is hidden.
import { EventDispatcher, TimerEvent } from './events';
import { safeCall } from './errors';

export const clock = {
  now: 0,          // scaled ms since start
  scale: 1,
  paused: false,
};

const timers = new Set<Timer>();
const timeouts = new Map<number, { at: number; fn: () => void; every?: number }>();
let toId = 1;

export function getTimer() { return Math.floor(clock.now); }

/** advance game time by real dt (ms); fires timers */
export function advanceClock(dtReal: number) {
  if (clock.paused) return;
  clock.now += dtReal * clock.scale;
  for (const t of Array.from(timers)) t._check();
  for (const [id, t] of Array.from(timeouts)) {
    if (clock.now >= t.at) {
      if (t.every) t.at += t.every; else timeouts.delete(id);
      safeCall('timeout', t.fn);
    }
  }
}

export function setTimeout(fn: (...a: any[]) => void, ms: number, ...args: any[]) {
  const id = toId++; timeouts.set(id, { at: clock.now + ms, fn: () => fn(...args) }); return id;
}
export function clearTimeout(id: number) { timeouts.delete(id); }
export function setInterval(fn: (...a: any[]) => void, ms: number, ...args: any[]) {
  const id = toId++; timeouts.set(id, { at: clock.now + ms, fn: () => fn(...args), every: Math.max(1, ms) }); return id;
}
export const clearInterval = clearTimeout;

export class Timer extends EventDispatcher {
  delay: number;
  repeatCount: number;
  currentCount = 0;
  running = false;
  private next = 0;
  constructor(delay: number, repeatCount = 0) { super(); this.delay = delay; this.repeatCount = repeatCount; }
  /** time source in ms (game clock; AudioTimer overrides it with the audio clock) */
  _now() { return clock.now; }
  start() { if (this.running) return; this.running = true; this.next = this._now() + this.delay; timers.add(this); }
  stop() { this.running = false; timers.delete(this); }
  reset() { this.stop(); this.currentCount = 0; }
  _check() {
    let guard = 0;
    while (this.running && this._now() >= this.next && guard++ < 10) {
      this.currentCount++;
      this.next += Math.max(this.delay, 1);
      this.dispatchEvent(new TimerEvent(TimerEvent.TIMER));
      if (this.repeatCount > 0 && this.currentCount >= this.repeatCount) {
        this.stop();
        this.dispatchEvent(new TimerEvent(TimerEvent.TIMER_COMPLETE));
      }
    }
  }
}
