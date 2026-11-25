// Loads public/assets/<module>/{lib.json, atlas-N.webp} and instantiates symbols.
import { Texture, Rectangle as PRect, ImageSource } from 'pixi.js';
import { DisplayObject, MovieClip, Shape, MorphShape, AlphaRef } from './display';
import { TextField } from './text';
import type { M } from './geom';
import { frameScripts } from '../gen/frameScripts';

export interface PlaceState {
  key: string; c: number; m: M; cx?: number[]; n?: string; cd?: number; f?: any[]; b?: number; r?: number; v?: number;
}

type RawOp = { d: number; rm?: 1; mv?: 1; rp?: 1; c?: number; m?: number[]; cx?: number[]; n?: string; cd?: number; r?: number; f?: any[]; b?: number; v?: number };

export class Timeline {
  frames: RawOp[][];
  labels: Record<string, number>;
  labelList: [string, number][];
  scripts: Record<number, () => void> | undefined;
  private cache: Map<number, PlaceState>[] = [];
  constructor(public mod: LibModule, public id: number, def: any) {
    this.frames = def.f;
    // labels: [[name, frameIndex], ...] (names may repeat, e.g. "end_animation"); goto uses the first occurrence
    this.labelList = Array.isArray(def.l) ? def.l : Object.entries(def.l ?? {}) as [string, number][];
    this.labels = {};
    for (const [n, f] of this.labelList) if (!(n in this.labels)) this.labels[n] = f;
    this.scripts = frameScripts[mod.name]?.[id];
  }
  state(i: number): Map<number, PlaceState> {
    if (this.cache[i]) return this.cache[i];
    let start = i;
    while (start > 0 && !this.cache[start - 1]) start--;
    let cur = start > 0 ? new Map(this.cache[start - 1]) : new Map<number, PlaceState>();
    for (let f = start; f <= i; f++) {
      if (f > start) cur = new Map(cur);
      for (const o of this.frames[f] ?? []) {
        if (o.rm) { cur.delete(o.d); continue; }
        const prev = cur.get(o.d);
        if (o.mv && prev) {
          const st: PlaceState = { ...prev };
          if (o.rp && o.c !== undefined) { st.c = o.c; st.key = f + ':' + o.c; }
          if (o.m) st.m = o.m as M;
          if (o.cx) st.cx = o.cx;
          if (o.n) st.n = o.n;
          if (o.cd !== undefined) st.cd = o.cd;
          if (o.r !== undefined) st.r = o.r;
          if (o.f) st.f = o.f;
          if (o.b !== undefined) st.b = o.b;
          if (o.v !== undefined) st.v = o.v;
          cur.set(o.d, st);
        } else if (o.c !== undefined) {
          cur.set(o.d, {
            key: f + ':' + o.c, c: o.c, m: (o.m ?? [1, 0, 0, 1, 0, 0]) as M, cx: o.cx, n: o.n, cd: o.cd, f: o.f, b: o.b, r: o.r, v: o.v,
          });
        }
      }
      this.cache[f] = cur;
    }
    return cur;
  }
}

class AlphaMap implements AlphaRef {
  static K = 4; // downsample factor
  constructor(private data: Uint8ClampedArray, private w: number, private h: number) {}
  test(x: number, y: number) {
    const k = AlphaMap.K;
    const ix = Math.min(this.w - 1, (x / k) | 0), iy = Math.min(this.h - 1, (y / k) | 0);
    return this.data[(iy * this.w + ix) * 4 + 3] > 24;
  }
}

export class LibModule {
  name: string;
  data: any;
  atlases: Texture[] = [];
  alpha: AlphaMap[] = [];
  textures = new Map<number, Texture>();
  timelines = new Map<number, Timeline>();
  constructor(name: string, data: any) { this.name = name; this.data = data; }

  shapeTexture(id: number): Texture | null {
    let t = this.textures.get(id);
    if (t) return t;
    const s = this.data.shapes[id];
    if (!s) return null;
    t = new Texture({ source: this.atlases[s[0]].source, frame: new PRect(s[1], s[2], s[3], s[4]) });
    this.textures.set(id, t);
    return t;
  }

  timeline(id: number) {
    let tl = this.timelines.get(id);
    if (!tl) { tl = new Timeline(this, id, this.data.sprites[id]); this.timelines.set(id, tl); }
    return tl;
  }

  create(id: number): DisplayObject | null {
    const d = this.data;
    if (d.sprites[id]) {
      const Cls = classById.get(this.name + ':' + id) ?? MovieClip;
      const mc = new (Cls as any)();
      if (!mc._tl) mc._bind(this.timeline(id));
      return mc;
    }
    const s = d.shapes[id];
    if (s) {
      const tex = this.shapeTexture(id)!;
      return new Shape(tex, [s[7], 0, 0, s[7], s[5], s[6]], s[8] ? undefined : this.alpha[s[0]]);
    }
    if (d.texts[id]) return new TextField(d.texts[id]);
    if (d.morphs?.[id]) return new MorphShape(d.morphs[id]);
    return new Shape(); // morph shapes / unknown -> empty
  }
}

// ---------- global registry (one ApplicationDomain, like the original SwfBulkLoader) ----------
export const modules = new Map<string, LibModule>();
const classByName = new Map<string, { mod: LibModule; id: number }>();
const classById = new Map<string, any>();
const ctorCache = new Map<string, any>();
const defined = new Set<string>();

export const lib = {
  base: './assets/',
  has(name: string) { return classByName.has(name) || defined.has(name); },
  /** constructor for a linked library class (e.g. "assets.MainMenu") */
  getClass(name: string): any {
    let C = ctorCache.get(name);
    if (C) return C;
    const e = classByName.get(name);
    if (!e) {
      // modules that were never shipped (e.g. PreloaderAP): an empty clip keeps the game running
      console.warn('Library class not found, using empty clip:', name);
      C = class extends MovieClip {};
      ctorCache.set(name, C);
      return C;
    }
    const tl = () => e.mod.timeline(e.id);
    if (e.mod.data.sprites[e.id]) {
      C = class extends MovieClip { constructor() { super(); this._bind(tl()); } };
    } else {
      C = class extends Shape { constructor() { const s = e.mod.data.shapes[e.id]; super(e.mod.shapeTexture(e.id)!, [s[7], 0, 0, s[7], s[5], s[6]], s[8] ? undefined : e.mod.alpha[s[0]]); } };
    }
    Object.defineProperty(C, 'name', { value: name.split('.').pop() });
    (C as any)._libName = name;
    ctorCache.set(name, C);
    return C;
  },
  /** register a game class for a library symbol so timeline instances use it */
  /** provide a class for a name that has no library symbol (replacement assets) */
  define(name: string, Cls: any) { ctorCache.set(name, Cls); defined.add(name); },
  register(name: string, Cls: any) {
    const e = classByName.get(name);
    if (e) classById.set(e.mod.name + ':' + e.id, Cls);
  },
  async load(name: string, onProgress?: (f: number) => void): Promise<LibModule> {
    const have = modules.get(name);
    if (have) return have;
    const res = await fetch(`${lib.base}${name}/lib.json`);
    if (!res.ok) throw new Error('missing module ' + name);
    const data = await res.json();
    const mod = new LibModule(name, data);
    let done = 0;
    await Promise.all(Array.from({ length: data.atlases }, async (_, i) => {
      const blob = await (await fetch(`${lib.base}${name}/atlas-${i}.webp`)).blob();
      const bmp = await createImageBitmap(blob, { premultiplyAlpha: 'premultiply' });
      mod.atlases[i] = new Texture({ source: new ImageSource({ resource: bmp, alphaMode: 'premultiplied-alpha' }) });
      mod.alpha[i] = alphaMap(bmp);
      onProgress?.(++done / data.atlases);
    }));
    for (const [cls, id] of Object.entries<number>(data.classes)) classByName.set(cls, { mod, id });
    modules.set(name, mod);
    return mod;
  },
};

function alphaMap(bmp: ImageBitmap): AlphaMap {
  const k = AlphaMap.K;
  const w = Math.max(1, Math.ceil(bmp.width / k)), h = Math.max(1, Math.ceil(bmp.height / k));
  const cv = new OffscreenCanvas(w, h);
  const cx = cv.getContext('2d', { willReadFrequently: true })!;
  cx.drawImage(bmp, 0, 0, w, h);
  return new AlphaMap(cx.getImageData(0, 0, w, h).data, w, h);
}
