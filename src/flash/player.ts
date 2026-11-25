// The "Flash Player": Pixi app, letterboxed 700x500 stage, frame loop, mouse/touch input.
import { Application, Container, Graphics } from 'pixi.js';
import { Stage, runFrame, flushDirty, hitDeep, mouseTarget, DisplayObject, Sprite, InteractiveObject, beginTick, endTick, renderInterp } from './display';
import { MouseEvent, KeyboardEvent } from './events';
import { advanceClock, clock } from './clock';
import { setFxScale } from './filters';
import { setTextResolution } from './text';

export const W = 700, H = 500;
export const FPS = 30;

export class Player {
  app!: Application;
  stage = new Stage();
  root = new Container();
  scale = 1;
  ox = 0; oy = 0;
  private acc = 0;
  private over: InteractiveObject | null = null;
  private down: InteractiveObject | null = null;
  onFrame: (() => void)[] = [];

  async init(host: HTMLElement) {
    const app = new Application();
    await app.init({
      background: '#0a0a0a', antialias: true, autoDensity: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2), resizeTo: window,
      preference: 'webgl', powerPreference: 'high-performance',
    });
    this.app = app;
    host.appendChild(app.canvas);
    this.root.addChild(this.stage._c);
    // like the Flash embed: nothing outside the 700x500 stage is visible
    const clip = new Graphics().rect(0, 0, W, H).fill(0xffffff);
    this.root.addChild(clip); this.root.mask = clip;
    app.stage.addChild(this.root);
    // letterbox mask so nothing draws outside 700x500
    window.addEventListener('resize', () => this.layout());
    this.layout();
    this.bindInput(app.canvas);
    app.ticker.maxFPS = 0;
    app.ticker.add((t) => this.tick(t.deltaMS));
    document.addEventListener('visibilitychange', () => { clock.paused = document.hidden; this.acc = 0; });
  }

  layout() {
    const sw = window.innerWidth, sh = window.innerHeight;
    const s = Math.min(sw / W, sh / H);
    this.scale = s; this.ox = (sw - W * s) / 2; this.oy = (sh - H * s) / 2;
    this.root.scale.set(s); this.root.position.set(this.ox, this.oy);
    const dpr = this.app.renderer.resolution;
    setFxScale(s * dpr / 1);
    setTextResolution(s * dpr);
  }

  private tick(dtMs: number) {
    if (clock.paused) return;
    dtMs = Math.min(dtMs, 250);
    const frame = 1000 / FPS / clock.scale;
    this.acc += dtMs;
    let n = 0;
    while (this.acc >= frame && n < 4) {
      this.acc -= frame; n++;
      beginTick();
      advanceClock(frame);
      runFrame(this.stage);
      for (const f of this.onFrame) f();
      flushDirty();
      this.refreshHover();
      endTick();
    }
    if (this.acc > frame * 4) this.acc = 0;
    flushDirty();
    // smooth motion between logic frames (display refresh rate)
    renderInterp(this.smooth ? this.acc / frame : 1);
  }
  /** interpolate rendering between 30 fps logic frames */
  smooth = true;

  // ---------- input ----------
  private toStage(e: PointerEvent) {
    const r = (e.target as HTMLElement).getBoundingClientRect();
    Stage.mx = (e.clientX - r.left - this.ox) / this.scale;
    Stage.my = (e.clientY - r.top - this.oy) / this.scale;
  }
  private targetAt(): InteractiveObject | null {
    if (Stage.mx < 0 || Stage.my < 0 || Stage.mx > W || Stage.my > H) return null;
    return mouseTarget(hitDeep(this.stage, Stage.mx, Stage.my));
  }
  private fire(t: DisplayObject | null, type: string, related: any = null, bubbles = true) {
    if (!t) return;
    const e = new MouseEvent(type, bubbles);
    e.stageX = Stage.mx; e.stageY = Stage.my; e.relatedObject = related;
    const l = t.globalToLocal({ x: Stage.mx, y: Stage.my } as any); e.localX = l.x; e.localY = l.y;
    e.buttonDown = !!this.down;
    t.dispatchEvent(e);
  }
  private setOver(t: InteractiveObject | null) {
    const prev = this.over;
    if (prev === t) return;
    this.over = t;
    // rollOut/rollOver along the non-shared ancestor chains
    const chain = (o: DisplayObject | null) => { const a: DisplayObject[] = []; for (let p = o; p && !(p instanceof Stage); p = p.parent) a.push(p); return a; };
    const pa = chain(prev), na = chain(t);
    if (prev) {
      this.fire(prev, MouseEvent.MOUSE_OUT, t);
      for (const p of pa) if (!na.includes(p)) this.fire(p, MouseEvent.ROLL_OUT, t, false);
    }
    if (t) {
      for (const p of na.slice().reverse()) if (!pa.includes(p)) this.fire(p, MouseEvent.ROLL_OVER, prev, false);
      this.fire(t, MouseEvent.MOUSE_OVER, prev);
    }
    this.updateCursor();
  }
  private updateCursor() {
    let hand = false;
    for (let p: DisplayObject | null = this.over; p; p = p.parent) {
      if (p instanceof Sprite && p.buttonMode && p.useHandCursor) { hand = true; break; }
    }
    this.app.canvas.style.cursor = hand ? 'pointer' : 'default';
  }
  private lastPointerType = 'mouse';
  /** display list changes under a still pointer must also produce over/out */
  private refreshHover() {
    if (this.lastPointerType !== 'mouse') return;
    this.setOver(this.targetAt());
  }

  private bindInput(cv: HTMLCanvasElement) {
    cv.addEventListener('pointermove', (e) => {
      this.lastPointerType = e.pointerType; this.toStage(e);
      const t = this.targetAt();
      if (e.pointerType === 'mouse' || this.down) this.setOver(t);
      this.fire(t ?? this.stage, MouseEvent.MOUSE_MOVE);
    });
    cv.addEventListener('pointerdown', (e) => {
      this.lastPointerType = e.pointerType; this.toStage(e);
      cv.setPointerCapture?.(e.pointerId);
      const t = this.targetAt();
      this.setOver(t);
      this.down = t;
      this.fire(t ?? this.stage, MouseEvent.MOUSE_DOWN);
    });
    const up = (e: PointerEvent) => {
      this.toStage(e);
      const t = this.targetAt();
      this.fire(t ?? this.stage, MouseEvent.MOUSE_UP);
      if (t && t === this.down) this.fire(t, MouseEvent.CLICK);
      this.down = null;
      if (e.pointerType !== 'mouse') this.setOver(null); // touch: no hover after lifting
      else this.setOver(t);
    };
    cv.addEventListener('pointerup', up);
    cv.addEventListener('pointercancel', (e) => { this.down = null; if (e.pointerType !== 'mouse') this.setOver(null); });
    cv.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') this.setOver(null); });
    cv.addEventListener('contextmenu', (e) => e.preventDefault());
    const key = (type: string) => (e: globalThis.KeyboardEvent) => {
      const k = new KeyboardEvent(type);
      k.keyCode = e.keyCode; k.charCode = e.key.length === 1 ? e.key.charCodeAt(0) : 0; k.key = e.key; k.code = e.code;
      this.stage.dispatchEvent(k);
    };
    window.addEventListener('keydown', key(KeyboardEvent.KEY_DOWN));
    window.addEventListener('keyup', key(KeyboardEvent.KEY_UP));
  }
}

export const player = new Player();
