// Flash-like display list rendered with PixiJS.
// Our tree (DisplayObject/...) is the source of truth; each node owns a Pixi container `_c`.
import { Container, Matrix, Sprite as PSprite, Texture, Graphics as PGraphics, GraphicsPath, Rectangle as PRect } from 'pixi.js';
import { Event, EventDispatcher } from './events';
import { ColorTransform, M, I, mul, Point, Rectangle } from './geom';
import { makeFilters, colorFilter, setTint } from './filters';
import type { Timeline, PlaceState } from './library';
import { safeCall } from './errors';

let scriptedGuard = 0; // >0 while the timeline itself writes props
let timelineRemoving = 0; // >0 while the timeline removes its own children
const DEG = Math.PI / 180;

export class DisplayObject extends EventDispatcher {
  _c: Container;
  parent: DisplayObjectContainer | null = null;
  name = '';
  _depth: number | undefined;          // timeline depth (undefined = added by script)
  _tlKey: string | undefined;          // timeline identity key
  _clipDepth = 0;
  _m: M = [1, 0, 0, 1, 0, 0];
  _scripted = false;
  _cx: ColorTransform | null = null;
  _alpha = 1;
  _flashFilters: any[] = [];
  _filterObjs: any[] = [];
  _cxFilter: any = null;
  _blend = 'normal';
  _maskObj: DisplayObject | null = null;
  _maskedBy: DisplayObject | null = null;
  mouseEnabled = true;
  cacheAsBitmap = false;
  tabEnabled = false;
  [k: string]: any;

  constructor(c?: Container) {
    super();
    this._c = c ?? new Container();
  }

  // ---------- transform ----------
  _applyM() {
    this._pixiM(this._m);
    markMoved(this);
  }
  /** write a matrix to the pixi node (also used by render interpolation) */
  _pixiM(m: M) {
    TMP.set(m[0], m[1], m[2], m[3], m[4], m[5]);
    this._c.setFromMatrix(TMP);
  }
  _tm: M | undefined;       // matrix at the end of the previous logic tick
  _ta = 1;                  // pixi alpha at the end of the previous logic tick
  _pa = 1;                  // pixi alpha target (current logical value)
  _skipI = false;           // changed outside a tick (e.g. dragging): no interpolation this time
  _setM(m: M) { this._m = m.slice() as M; this._applyM(); }
  _touch() { if (!scriptedGuard) this._scripted = true; }

  get x() { return this._m[4]; }
  set x(v: number) { this._touch(); this._m[4] = +v || 0; this._applyM(); }
  get y() { return this._m[5]; }
  set y(v: number) { this._touch(); this._m[5] = +v || 0; this._applyM(); }
  get scaleX() { const m = this._m; const s = Math.hypot(m[0], m[1]); return m[0] * m[3] - m[1] * m[2] < 0 && m[3] > 0 ? -s : s; }
  set scaleX(v: number) { this._touch(); this._compose(v, this.scaleY, this.rotation); }
  get scaleY() { const m = this._m; const s = Math.hypot(m[2], m[3]); return m[0] * m[3] - m[1] * m[2] < 0 && m[3] <= 0 ? -s : s; }
  set scaleY(v: number) { this._touch(); this._compose(this.scaleX, v, this.rotation); }
  get rotation() { const m = this._m; const sx = this.scaleX; return Math.atan2(m[1] * Math.sign(sx || 1), m[0] * Math.sign(sx || 1)) / DEG; }
  set rotation(v: number) { this._touch(); this._compose(this.scaleX, this.scaleY, v); }
  _compose(sx: number, sy: number, rot: number) {
    const r = rot * DEG, c = Math.cos(r), s = Math.sin(r);
    this._m = [c * sx, s * sx, -s * sy, c * sy, this._m[4], this._m[5]];
    this._applyM();
  }
  get transform() {
    const self = this;
    return {
      get matrix() { const m = self._m; return { a: m[0], b: m[1], c: m[2], d: m[3], tx: m[4], ty: m[5] }; },
      set matrix(v: any) { self._touch(); self._setM([v.a, v.b, v.c, v.d, v.tx, v.ty]); },
      get colorTransform() { const c = self._cx; return c ? new ColorTransform(c.redMultiplier, c.greenMultiplier, c.blueMultiplier, c.alphaMultiplier, c.redOffset, c.greenOffset, c.blueOffset, c.alphaOffset) : new ColorTransform(1, 1, 1, self._alpha); },
      set colorTransform(v: ColorTransform) { self._touch(); self._setCx(v); },
    };
  }
  set transform(_v: any) { /* unsupported */ }

  get alpha() { return this._alpha; }
  set alpha(v: number) { this._touch(); this._alpha = +v; this._refreshColor(); }
  get visible() { return this._c.visible; }
  set visible(v: boolean) { this._touch(); this._c.visible = !!v; }

  _setCx(cx: ColorTransform | null) {
    this._cx = cx;
    this._alpha = cx ? cx.alphaMultiplier : 1;
    this._refreshColor();
  }
  _refreshColor() {
    const cx = this._cx;
    const a = Math.max(0, Math.min(1, this._alpha + (cx ? cx.alphaOffset / 255 : 0)));
    if (a !== this._pa) { this._pa = a; this._c.alpha = a; markMoved(this); }
    setTint(this._c, cx);
    const f = colorFilter(cx);
    if (f !== this._cxFilter) { this._cxFilter = f; this._rebuildFilters(); }
  }

  get filters() { return this._flashFilters.slice(); }
  set filters(v: any[]) { this._touch(); this._setFilters(v ? v.map((f) => (f && f._def) || f) : []); }
  _setFilters(defs: any[]) {
    const key = JSON.stringify(defs);
    if (key === (this as any)._fkey) return;
    (this as any)._fkey = key;
    this._flashFilters = defs;
    this._filterObjs = makeFilters(defs);
    this._rebuildFilters();
  }
  _rebuildFilters() {
    const list = this._cxFilter ? [this._cxFilter, ...this._filterObjs] : this._filterObjs;
    this._c.filters = list.length ? list : null;
  }

  get blendMode() { return this._blend; }
  set blendMode(v: string) { this._blend = v; this._c.blendMode = (v === 'layer' ? 'normal' : v) as any; }

  get mask() { return this._maskObj; }
  set mask(m: DisplayObject | null) {
    if (this._maskObj) this._maskObj._maskedBy = null;
    this._maskObj = m;
    if (m) m._maskedBy = this;
    setPixiMask(this._c, m ? maskTarget(m) : null);
  }

  get stage(): Stage | null {
    let p: DisplayObject | null = this;
    while (p.parent) p = p.parent;
    return p instanceof Stage ? p : null;
  }
  get root() { let p: DisplayObject = this; while (p.parent && !(p.parent instanceof Stage)) p = p.parent; return p; }

  // ---------- bounds / coords ----------
  _worldM(): M {
    let m: M = this._m.slice() as M;
    let p = this.parent;
    while (p && !(p instanceof Stage)) { m = mul(p._m, m); p = p.parent; }
    return m;
  }
  _localBounds(): PRect {
    // pixi children are synced lazily: bring the tree up to date first, or fresh clips measure 0x0
    if (dirtyContainers.size) flushDirty();
    const b = this._c.getLocalBounds();
    return new PRect(b.x, b.y, b.width, b.height);
  }
  getBounds(target?: DisplayObject | null): Rectangle {
    const lb = this._localBounds();
    if (lb.width === 0 && lb.height === 0) return new Rectangle(this.x, this.y, 0, 0);
    let m = this._worldM();
    if (target && !(target instanceof Stage)) m = mul(invert(target._worldM()), m);
    return xformRect(m, lb);
  }
  getRect(target?: DisplayObject | null) { return this.getBounds(target); }
  get width() { const lb = this._localBounds(); return xformRect(this._m, lb).width; }
  set width(v: number) {
    const lb = this._localBounds(); if (!lb.width) return;
    this._touch(); const r = this.rotation; this._compose(v / lb.width * (r ? 1 : 1), this.scaleY, r);
  }
  get height() { const lb = this._localBounds(); return xformRect(this._m, lb).height; }
  set height(v: number) {
    const lb = this._localBounds(); if (!lb.height) return;
    this._touch(); this._compose(this.scaleX, v / lb.height, this.rotation);
  }
  localToGlobal(p: Point) { const m = this._worldM(); return new Point(m[0] * p.x + m[2] * p.y + m[4], m[1] * p.x + m[3] * p.y + m[5]); }
  globalToLocal(p: Point) { const m = invert(this._worldM()); return new Point(m[0] * p.x + m[2] * p.y + m[4], m[1] * p.x + m[3] * p.y + m[5]); }
  get mouseX() { return this.globalToLocal(new Point(Stage.mx, Stage.my)).x; }
  get mouseY() { return this.globalToLocal(new Point(Stage.mx, Stage.my)).y; }

  hitTestPoint(x: number, y: number, shapeFlag = false): boolean {
    if (!shapeFlag) return this.getBounds(null).contains(x, y);
    return !!hitDeep(this, x, y, true);
  }
  hitTestObject(o: DisplayObject) { return this.getBounds(null).intersects(o.getBounds(null)); }

  // ---------- stage notifications ----------
  _addedToStage() { this.dispatchEvent(new Event(Event.ADDED_TO_STAGE)); }
  _removedFromStage() { this.dispatchEvent(new Event(Event.REMOVED_FROM_STAGE)); }

  _onListen(type: string, on: boolean) {
    if (type === Event.ENTER_FRAME || type === Event.EXIT_FRAME) frameListeners[on ? 'add' : 'delete'](this);
  }

  /** shape hit-test of this leaf in its local space */
  _hitLocal(_x: number, _y: number): boolean { return false; }
}

export class Shape extends DisplayObject {
  _sprite: PSprite | null = null;
  _off: M = I;
  graphics: Graphics;
  constructor(tex?: Texture, off?: M, public _alphaMap?: AlphaRef) {
    super(tex ? new PSprite(tex) : new Container());
    if (tex) { this._sprite = this._c as PSprite; this._off = off!; this._applyM(); }
    this.graphics = new Graphics(this);
  }
  _pixiM(m: M) {
    const r = this._sprite ? mul(m, this._off) : m;
    TMP.set(r[0], r[1], r[2], r[3], r[4], r[5]);
    this._c.setFromMatrix(TMP);
  }
  _localBounds(): PRect {
    if (this._sprite) {
      const o = this._off, t = this._sprite.texture;
      return xformRectP(o, new PRect(0, 0, t.frame.width, t.frame.height));
    }
    return super._localBounds();
  }
  _hitLocal(x: number, y: number) {
    if (this._sprite) {
      const o = this._off; const s = o[0];
      const px = (x - o[4]) / s, py = (y - o[5]) / s;
      const t = this._sprite.texture;
      if (px < 0 || py < 0 || px >= t.frame.width || py >= t.frame.height) return false;
      const a = this._alphaMap;
      if (!a) return true;
      // Flash hit-tests the geometry, so a fully transparent fill (a button's hit area) still catches the mouse:
      // an invisible shape counts as its rectangle, a visible one by its pixels
      if (a.isEmpty?.(t.frame.x, t.frame.y, t.frame.width, t.frame.height)) return true;
      return a.test(t.frame.x + px, t.frame.y + py);
    }
    return this.graphics._hit(x, y);
  }
}

export interface AlphaRef {
  test(x: number, y: number): boolean;
  /** no visible pixel in this frame of the atlas */
  isEmpty?(x: number, y: number, w: number, h: number): boolean;
}

/** DefineMorphShape: start/end paths interpolated by the timeline "ratio" (0..65535) */
export class MorphShape extends DisplayObject {
  _g = new PGraphics();
  _ratio = -1;
  constructor(public _def: any[]) {
    super();
    this._c.addChild(this._g);
    this._setRatio(0);
  }
  _setRatio(r: number) {
    if (r === this._ratio) return;
    this._ratio = r;
    const t = Math.max(0, Math.min(1, r / 65535));
    const g = this._g; g.clear();
    for (const e of this._def) {
      const d = lerpPath(e.d[0], e.d[1], t);
      g.path(new GraphicsPath(d));
      if (e.fill) g.fill({ color: lerpColor(e.fill[0], e.fill[1], t), alpha: e.fa[0] + (e.fa[1] - e.fa[0]) * t });
      else g.stroke({ color: lerpColor(e.stroke[0], e.stroke[1], t), width: e.sw[0] + (e.sw[1] - e.sw[0]) * t, alpha: e.sa[0] + (e.sa[1] - e.sa[0]) * t });
    }
  }
  _hitLocal(x: number, y: number) { return this._g.containsPoint({ x, y } as any); }
}
const NUM = /-?\d*\.?\d+(?:e[-+]?\d+)?/gi;
function lerpPath(a: string, b: string, t: number) {
  const nb = b.match(NUM) ?? [];
  let i = 0;
  return a.replace(NUM, (s) => { const v = +s, w = nb[i++] !== undefined ? +nb[i - 1] : v; return String(v + (w - v) * t); });
}
function lerpColor(a: string, b: string, t: number) {
  const x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16);
  const ch = (s: number) => Math.round(((x >> s) & 255) + (((y >> s) & 255) - ((x >> s) & 255)) * t);
  return (ch(16) << 16) | (ch(8) << 8) | ch(0);
}

export class InteractiveObject extends DisplayObject {
  doubleClickEnabled = false;
  focusRect: any = null;
  contextMenu: any = null;
}

export class DisplayObjectContainer extends InteractiveObject {
  _ch: DisplayObject[] = [];
  mouseChildren = true;
  tabChildren = false;
  _dirty = false;

  get numChildren() { return this._ch.length; }
  addChild<T extends DisplayObject>(c: T): T { return this.addChildAt(c, c.parent === this ? this._ch.length - 1 : this._ch.length); }
  addChildAt<T extends DisplayObject>(c: T, i: number): T {
    if (!c) throw new Error('addChild: null child');
    const wasOn = !!c.stage;
    if (c.parent) c.parent._detach(c);
    i = Math.max(0, Math.min(i, this._ch.length));
    this._ch.splice(i, 0, c);
    c.parent = this;
    this._markDirty();
    c.dispatchEvent(new Event(Event.ADDED, true));
    if (!wasOn && this.stage) notifyStage(c, true);
    return c;
  }
  _detach(c: DisplayObject) {
    const i = this._ch.indexOf(c);
    if (i < 0) return;
    this._ch.splice(i, 1);
    if (c._tlKey !== undefined && !timelineRemoving) {
      // removed/reparented by script: the timeline must not re-create it while the same placement lasts
      ((this as any)._scriptRemoved ??= new Set<string>()).add(c._depth + '|' + c._tlKey);
      c._tlKey = undefined; c._depth = undefined;
    }
    c.parent = null;
    if (c._c.parent) c._c.parent.removeChild(c._c);
    this._markDirty();
  }
  removeChild<T extends DisplayObject>(c: T): T {
    // Flash throws here; the game relies on that being harmless (e.g. double removal in a tween), so it is a no-op
    if (!c || c.parent !== this) return c;
    const on = !!this.stage;
    c.dispatchEvent(new Event(Event.REMOVED, true));
    if (on) notifyStage(c, false);
    this._detach(c);
    return c;
  }
  removeChildAt(i: number) { return this.removeChild(this._ch[i]); }
  removeChildren(a = 0, b = 0x7fffffff) { for (const c of this._ch.slice(a, b + 1)) this.removeChild(c); }
  getChildAt(i: number) { return this._ch[i] ?? null; }
  getChildByName(n: string) { return this._ch.find((c) => c.name === n) ?? null; }
  getChildIndex(c: DisplayObject) { const i = this._ch.indexOf(c); if (i < 0) throw new Error('not a child'); return i; }
  setChildIndex(c: DisplayObject, i: number) {
    const cur = this._ch.indexOf(c); if (cur < 0) return;
    this._ch.splice(cur, 1); this._ch.splice(Math.min(i, this._ch.length), 0, c); this._markDirty();
  }
  swapChildren(a: DisplayObject, b: DisplayObject) {
    const i = this._ch.indexOf(a), j = this._ch.indexOf(b);
    this._ch[i] = b; this._ch[j] = a; this._markDirty();
  }
  swapChildrenAt(i: number, j: number) { this.swapChildren(this._ch[i], this._ch[j]); }
  contains(c: DisplayObject | null): boolean {
    for (let p = c; p; p = p.parent) if (p === this) return true;
    return false;
  }
  getObjectsUnderPoint(p: Point) { const r: DisplayObject[] = []; const h = hitDeep(this, p.x, p.y, true); if (h) r.push(h); return r; }

  _markDirty() { if (!this._dirty) { this._dirty = true; dirtyContainers.add(this); } }

  /** rebuild pixi children from our child list (with clipDepth mask groups) */
  _sync() {
    this._dirty = false;
    const pc = this._c;
    const want: Container[] = [];
    const gfx = (this as any).graphics?._g; // vector drawing (Graphics API) sits below the children
    if (gfx) want.push(gfx);
    let group: Container | null = null; let groupEnd = -1;
    for (const ch of this._ch) {
      if (ch._maskedBy) { // used as a script mask: keep in tree but not rendered
        want.push(ch._c); continue;
      }
      if (group && ch._depth !== undefined && ch._depth <= groupEnd) {
        if (ch._c.parent !== group) group.addChild(ch._c);
        continue;
      }
      if (group) group = null;
      if (ch._clipDepth) {
        want.push(ch._c);
        const g: Container = ((ch as any)._group ??= new Container());
        g.removeChildren();
        setPixiMask(g, maskTarget(ch));
        want.push(g);
        group = g; groupEnd = ch._clipDepth;
        continue;
      }
      want.push(ch._c);
    }
    // re-order: cheap path when identical
    const cur = pc.children;
    let same = cur.length === want.length;
    if (same) for (let i = 0; i < want.length; i++) if (cur[i] !== want[i]) { same = false; break; }
    if (!same) {
      pc.removeChildren();
      for (const w of want) pc.addChild(w);
    }
  }
}

export function maskTarget(m: DisplayObject): Container {
  // AlphaMask needs a pixi Sprite; find the single shape inside the mask clip if possible
  if (m instanceof Shape && m._sprite) return m._sprite;
  const shapes: Shape[] = [];
  const walk = (o: DisplayObject) => {
    if (o instanceof Shape) shapes.push(o);
    else if (o instanceof DisplayObjectContainer) o._ch.forEach(walk);
  };
  walk(m);
  if (shapes.length === 1 && shapes[0]._sprite) return shapes[0]._sprite;
  return m._c;
}

export class Graphics {
  _g: PGraphics | null = null;
  _fill: any = null;
  constructor(private owner: DisplayObject) {}
  private g() {
    if (!this._g) { this._g = new PGraphics(); this.owner._c.addChildAt(this._g, 0); }
    return this._g;
  }
  clear() { this._g?.clear(); this._fill = null; }
  beginFill(color: number, alpha = 1) { this._fill = { color, alpha }; }
  endFill() { this._fill = null; }
  lineStyle(thickness = 0, color = 0, alpha = 1) { (this as any)._line = thickness ? { width: thickness, color, alpha } : null; }
  private paint() {
    const g = this.g();
    if (this._fill) g.fill(this._fill);
    if ((this as any)._line) g.stroke((this as any)._line);
  }
  drawRect(x: number, y: number, w: number, h: number) { this.g().rect(x, y, w, h); this.paint(); }
  drawRoundRect(x: number, y: number, w: number, h: number, ew: number) { this.g().roundRect(x, y, w, h, ew / 2); this.paint(); }
  drawCircle(x: number, y: number, r: number) { this.g().circle(x, y, r); this.paint(); }
  drawEllipse(x: number, y: number, w: number, h: number) { this.g().ellipse(x + w / 2, y + h / 2, w / 2, h / 2); this.paint(); }
  moveTo(x: number, y: number) { this.g().moveTo(x, y); }
  lineTo(x: number, y: number) { this.g().lineTo(x, y); this.paint(); }
  _hit(x: number, y: number) { return !!this._g && this._g.containsPoint({ x, y } as any); }
}

export class Sprite extends DisplayObjectContainer {
  buttonMode = false;
  useHandCursor = true;
  hitArea: Sprite | null = null;
  graphics: Graphics = new Graphics(this);
  dropTarget: DisplayObject | null = null;
  _dragging: any = null;
  startDrag(lockCenter = false, bounds: Rectangle | null = null) {
    const p = this.parent!.globalToLocal(new Point(Stage.mx, Stage.my));
    this._dragging = { dx: lockCenter ? 0 : this.x - p.x, dy: lockCenter ? 0 : this.y - p.y, bounds };
    dragging.add(this);
  }
  stopDrag() { this._dragging = null; dragging.delete(this); }
  _hitLocal(x: number, y: number) { return this.graphics._hit(x, y); }
}

export class FrameLabel { constructor(public name: string, public frame: number) {} }

type QueuedScript = { mc: MovieClip; frame: number; visit: number };
const scriptQueue: QueuedScript[] = [];

export class MovieClip extends Sprite {
  _tl: Timeline | null = null;
  _frame = 0;            // 0-based
  _playing = true;
  _visit = 0;
  _born = 0;
  _userScripts: Record<number, () => void> | null = null;
  enabled = true;
  trackAsMenu = false;

  get currentFrame() { return this._frame + 1; }
  get totalFrames() { return this._tl ? this._tl.frames.length : 1; }
  get framesLoaded() { return this.totalFrames; }
  get isPlaying() { return this._playing; }
  get currentLabel(): string | null {
    const tl = this._tl; if (!tl) return null;
    let best: string | null = null; let bf = -1;
    for (const [n, f] of tl.labelList) if (f <= this._frame && f > bf) { best = n; bf = f; }
    return best;
  }
  get currentFrameLabel(): string | null {
    const tl = this._tl; if (!tl) return null;
    for (const [n, f] of tl.labelList) if (f === this._frame) return n;
    return null;
  }
  get currentLabels() { return (this._tl?.labelList ?? []).map(([n, f]) => new FrameLabel(n, f + 1)); }
  get scenes() { return [{ name: 'Scene 1', labels: this.currentLabels, numFrames: this.totalFrames }]; }

  /** attach a library timeline (called by library-generated classes) */
  _bind(tl: Timeline) {
    this._tl = tl;
    this._born = tickNo;
    this._enter(0, false);
    if (this.stage) allClips.add(this);
  }
  // only clips on the stage are ticked; off-stage ones are dropped from the registry so they can be garbage-collected
  _addedToStage() { if (this._tl) allClips.add(this); super._addedToStage(); }
  _removedFromStage() { allClips.delete(this); super._removedFromStage(); }

  addFrameScript(...args: any[]) {
    this._userScripts ??= {};
    for (let i = 0; i < args.length; i += 2) {
      if (args[i + 1]) this._userScripts[args[i]] = args[i + 1]; else delete this._userScripts[args[i]];
    }
    if (args[0] === this._frame && args[1] && this._tl) scriptQueue.push({ mc: this, frame: this._frame, visit: this._visit });
  }

  play() { this._playing = true; }
  stop() { this._playing = false; }
  nextFrame() { this._goto(this._frame + 1, false); }
  prevFrame() { this._goto(this._frame - 1, false); }
  gotoAndStop(f: any, _scene?: string) { this._goto(this._resolve(f), false); }
  gotoAndPlay(f: any, _scene?: string) { this._goto(this._resolve(f), true); }
  nextScene() { /* single scene */ }
  prevScene() { /* single scene */ }

  _resolve(f: any): number {
    if (typeof f === 'string' && isNaN(+f)) {
      const i = this._tl?.labels[f];
      if (i === undefined) throw new Error(`Frame label ${f} not found in scene.`);
      return i;
    }
    return Math.max(0, (+f | 0) - 1);
  }
  _goto(i: number, play: boolean) {
    this._playing = play;
    const n = this.totalFrames;
    i = Math.max(0, Math.min(n - 1, i));
    if (i === this._frame) return;
    this._enter(i, true);
  }

  /** move the playhead and update the display list */
  _enter(i: number, runNow: boolean) {
    const tl = this._tl;
    this._frame = i;
    this._visit++;
    if (!tl) return;
    const target = tl.state(i);
    // remove/update existing timeline children
    for (const ch of this._ch.slice()) {
      if (ch._tlKey === undefined) continue;
      const st = target.get(ch._depth!);
      if (st && st.key === ch._tlKey) { applyState(ch, st); continue; }
      if (this.contains(ch)) this._removeTl(ch);
    }
    const sr: Set<string> | undefined = (this as any)._scriptRemoved;
    if (sr) for (const k of sr) { const [d, key] = [+k.slice(0, k.indexOf('|')), k.slice(k.indexOf('|') + 1)]; if (target.get(d)?.key !== key) sr.delete(k); }
    for (const [depth, st] of target) {
      if (this._ch.some((c) => c._depth === depth && c._tlKey === st.key)) continue;
      if (sr?.has(depth + '|' + st.key)) continue;
      const obj = tl.mod.create(st.c);
      if (!obj) continue;
      obj._depth = depth; obj._tlKey = st.key;
      applyState(obj, st, true);
      if (st.n) obj.name = st.n;
      // insert by depth among timeline children
      let idx = this._ch.length;
      for (let k = 0; k < this._ch.length; k++) {
        const d = this._ch[k]._depth;
        if (d !== undefined && d > depth) { idx = k; break; }
      }
      if (idx === this._ch.length) {
        // after last timeline child with lower depth, but below script children placed above it
        let last = -1;
        for (let k = 0; k < this._ch.length; k++) if (this._ch[k]._depth !== undefined) last = k;
        idx = last + 1;
      }
      if (st.n) this[st.n] = obj;
      this.addChildAt(obj, idx);
    }
    const has = (tl.scripts && tl.scripts[i]) || (this._userScripts && this._userScripts[i]);
    if (has) {
      if (runNow) this._runScript(i);
      else scriptQueue.push({ mc: this, frame: i, visit: this._visit });
    }
  }
  _removeTl(ch: DisplayObject) {
    if (ch.name && this[ch.name] === ch) this[ch.name] = null;
    timelineRemoving++;
    try { this.removeChild(ch); } finally { timelineRemoving--; }
    if (ch instanceof MovieClip) ch._dispose();
  }
  _dispose() {
    allClips.delete(this);
    for (const c of this._ch) if (c instanceof MovieClip) c._dispose();
  }
  _runScript(i: number) {
    const u = this._userScripts?.[i];
    if (u) { safeCall('frame script', () => u.call(this)); return; } // class scripts replace timeline scripts
    const s = this._tl?.scripts?.[i];
    if (s) safeCall('frame script', () => s.call(this));
  }
  _advance() {
    if (!this._playing || this._born === tickNo) return;
    const n = this.totalFrames;
    if (n <= 1) return;
    this._enter((this._frame + 1) % n, false);
  }
}

function applyState(o: DisplayObject, st: PlaceState, fresh = false) {
  scriptedGuard++;
  try {
    if (fresh || !o._scripted) {
      o._setM(st.m);
      o._setCx(st.cx ? new ColorTransform(st.cx[0], st.cx[1], st.cx[2], st.cx[3], st.cx[4], st.cx[5], st.cx[6], st.cx[7]) : null);
      o._setFilters(st.f ?? []);
      if (st.b !== undefined) o.blendMode = BLEND[st.b] ?? 'normal';
      if (st.v !== undefined) o._c.visible = !!st.v;
    }
    if (o._clipDepth !== (st.cd ?? 0)) { o._clipDepth = st.cd ?? 0; o.parent?._markDirty(); }
    if (st.r !== undefined && (o as any)._ratio !== st.r) (o as any)._setRatio?.(st.r);
  } finally { scriptedGuard--; }
}
const BLEND: Record<number, string> = { 0: 'normal', 1: 'normal', 2: 'normal', 3: 'multiply', 4: 'screen', 5: 'lighten', 6: 'darken', 7: 'difference', 8: 'add', 9: 'subtract', 10: 'invert', 11: 'normal', 12: 'erase', 13: 'overlay', 14: 'hard-light' };

function notifyStage(o: DisplayObject, on: boolean) {
  if (on) o._addedToStage(); else o._removedFromStage();
  if (o instanceof DisplayObjectContainer) for (const c of o._ch.slice()) notifyStage(c, on);
}

// ---------- matrix helpers ----------
export function invert(m: M): M {
  const det = m[0] * m[3] - m[1] * m[2] || 1e-9;
  return [m[3] / det, -m[1] / det, -m[2] / det, m[0] / det, (m[2] * m[5] - m[3] * m[4]) / det, (m[1] * m[4] - m[0] * m[5]) / det];
}
function xformRectP(m: M, r: PRect): PRect {
  const xs: number[] = [], ys: number[] = [];
  for (const [x, y] of [[r.x, r.y], [r.x + r.width, r.y], [r.x, r.y + r.height], [r.x + r.width, r.y + r.height]]) {
    xs.push(m[0] * x + m[2] * y + m[4]); ys.push(m[1] * x + m[3] * y + m[5]);
  }
  const x0 = Math.min(...xs), y0 = Math.min(...ys);
  return new PRect(x0, y0, Math.max(...xs) - x0, Math.max(...ys) - y0);
}
function xformRect(m: M, r: PRect): Rectangle { const p = xformRectP(m, r); return new Rectangle(p.x, p.y, p.width, p.height); }

// ---------- hit testing ----------
/** deepest leaf hit at stage point (x,y) under `o`, honoring visibility & masks */
export function hitDeep(o: DisplayObject, x: number, y: number, ignoreMouse = false, m?: M, asMask = false): DisplayObject | null {
  if (!asMask && (!o._c.visible || o._maskedBy || o._clipDepth)) return null;
  const wm = m ? mul(m, o._m) : o._worldM();
  if (o._maskObj && !hitDeep(o._maskObj, x, y, true, undefined, true)) return null;
  if (o instanceof DisplayObjectContainer) {
    if ((o as any).hitArea) {
      const ha = (o as any).hitArea as DisplayObject;
      return hitDeep(ha, x, y, true) ? o : null;
    }
    const ch = o._ch;
    for (let i = ch.length - 1; i >= 0; i--) {
      const c = ch[i];
      if (!ignoreMouse && c instanceof InteractiveObject && !c.mouseEnabled && !(c instanceof DisplayObjectContainer && c.mouseChildren)) continue;
      // masked by a timeline clip layer?
      if (c._depth !== undefined) {
        const mk = ch.find((k) => k._clipDepth && k._depth! < c._depth! && c._depth! <= k._clipDepth);
        if (mk && !hitDeep(mk, x, y, true, wm, true)) continue;
      }
      const h = hitDeep(c, x, y, ignoreMouse, wm);
      if (h) return h;
    }
    const inv = invert(wm);
    return o._hitLocal(inv[0] * x + inv[2] * y + inv[4], inv[1] * x + inv[3] * y + inv[5]) ? o : null;
  }
  const inv = invert(wm);
  return o._hitLocal(inv[0] * x + inv[2] * y + inv[4], inv[1] * x + inv[3] * y + inv[5]) ? o : null;
}

/** Flash mouse target: nearest InteractiveObject ancestor respecting mouseEnabled/mouseChildren */
export function mouseTarget(leaf: DisplayObject | null): InteractiveObject | null {
  if (!leaf) return null;
  let t: DisplayObject | null = leaf;
  while (t && !(t instanceof InteractiveObject)) t = t.parent;
  // climb above any ancestor that disables mouseChildren
  const path: DisplayObject[] = [];
  for (let p: DisplayObject | null = t; p; p = p.parent) path.unshift(p);
  for (const p of path) {
    if (p instanceof DisplayObjectContainer && !p.mouseChildren && p !== t) { t = p; break; }
  }
  while (t && !(t as InteractiveObject).mouseEnabled) t = t.parent;
  if (t instanceof Stage) return null;
  return t as InteractiveObject;
}

// ---------- render interpolation ----------
// Game logic runs at 30 fps like the original; rendering runs at the display refresh rate.
// Between two logic frames every object that moved is drawn at an interpolated transform/alpha.
const TMP = new Matrix();
const moved = new Set<DisplayObject>();
let inTick = false;
type IEntry = { o: DisplayObject; f: M; t: M; fa: number; ta: number; m: boolean };
let interp: IEntry[] = [];
function markMoved(o: DisplayObject) {
  moved.add(o);
  if (!inTick) o._skipI = true; // changed by input between ticks: show it right away
}
/** start of a logic tick: put interpolated objects back on their exact logical state */
export function beginTick() {
  for (const e of interp) { if (e.m) e.o._pixiM(e.o._m); e.o._c.alpha = e.o._pa; }
  interp = [];
  inTick = true;
}
/** end of a logic tick: remember what moved, from where to where */
export function endTick() {
  inTick = false;
  for (const o of moved) {
    const from = o._tm;
    if (from && !o._skipI) {
      const to = o._m;
      const mm = from[0] !== to[0] || from[1] !== to[1] || from[2] !== to[2] || from[3] !== to[3] || from[4] !== to[4] || from[5] !== to[5];
      // big jumps (teleports, wrap-arounds) and mirror flips are shown as-is
      const jump = Math.abs(to[4] - from[4]) + Math.abs(to[5] - from[5]) > 120
        || Math.sign(from[0] * from[3] - from[1] * from[2]) !== Math.sign(to[0] * to[3] - to[1] * to[2]);
      const am = o._ta !== o._pa;
      if ((mm && !jump) || am) interp.push({ o, f: from, t: to.slice() as M, fa: o._ta, ta: o._pa, m: mm && !jump });
    }
    o._tm = o._m.slice() as M; o._ta = o._pa; o._skipI = false;
  }
  moved.clear();
}
const LM: M = [1, 0, 0, 1, 0, 0];
/** draw objects at fraction k (0..1) of the way from the previous to the current logic frame */
export function renderInterp(k: number) {
  if (k >= 1) k = 1;
  for (const e of interp) {
    const o = e.o;
    if (o._skipI) continue;
    if (e.m) {
      const f = e.f, t = e.t;
      for (let i = 0; i < 6; i++) LM[i] = f[i] + (t[i] - f[i]) * k;
      o._pixiM(LM);
    }
    if (e.fa !== e.ta) o._c.alpha = e.fa + (e.ta - e.fa) * k;
  }
}

// ---------- frame loop registries ----------
export const frameListeners = new Set<DisplayObject>();
export const allClips = new Set<MovieClip>();
export const dirtyContainers = new Set<DisplayObjectContainer>();
export const dragging = new Set<Sprite>();
export let tickNo = 0;

export function flushDirty() {
  for (const c of dirtyContainers) c._sync();
  dirtyContainers.clear();
}

export function runFrame(stage: Stage) {
  tickNo++;
  // 1) enterFrame
  const ef = new Event(Event.ENTER_FRAME);
  for (const o of Array.from(frameListeners)) { ef._stop = ef._stopNow = false; o._fire(ef, false); }
  // 2) advance playheads of clips on stage
  for (const mc of Array.from(allClips)) {
    if (!mc.stage) continue;
    mc._advance();
  }
  // 3) frame scripts
  for (let i = 0; i < scriptQueue.length; i++) {
    const q = scriptQueue[i];
    if (q.mc._visit === q.visit && q.mc._frame === q.frame) q.mc._runScript(q.frame);
  }
  scriptQueue.length = 0;
  // 4) exitFrame
  const xf = new Event(Event.EXIT_FRAME);
  for (const o of Array.from(frameListeners)) if (o._ls?.[Event.EXIT_FRAME]) { o._fire(xf, false); }
  for (const s of dragging) {
    const d = s._dragging; if (!d || !s.parent) continue;
    const p = s.parent.globalToLocal(new Point(Stage.mx, Stage.my));
    let nx = p.x + d.dx, ny = p.y + d.dy;
    if (d.bounds) { nx = Math.max(d.bounds.left, Math.min(d.bounds.right, nx)); ny = Math.max(d.bounds.top, Math.min(d.bounds.bottom, ny)); }
    s.x = nx; s.y = ny;
  }
  void stage;
}

export class Stage extends DisplayObjectContainer {
  static mx = 0; static my = 0;
  static instance: Stage;
  stageWidth = 700; stageHeight = 500;
  frameRate = 30;
  scaleMode = 'showAll'; align = ''; quality = 'high';
  focus: any = null;
  displayState = 'normal';
  constructor() { super(); Stage.instance = this; }
  get stage() { return this; }
  get mouseX() { return Stage.mx; }
  get mouseY() { return Stage.my; }
}

export class Bitmap extends DisplayObject {
  bitmapData: any; smoothing = true;
  constructor(bd?: any) { super(bd?._tex ? new PSprite(bd._tex) : new Container()); this.bitmapData = bd; }
}

/** Flash masks use the mask's shape (its alpha), Pixi's alpha mask defaults to the red channel */
function setPixiMask(c: Container, target: Container | null) {
  if (!target) { c.mask = null; (c as any)._maskT = null; return; }
  if ((c as any)._maskT === target) return;
  (c as any)._maskT = target;
  if (target instanceof PSprite) c.setMask({ mask: target, channel: 'alpha' } as any);
  else c.mask = target;
}
