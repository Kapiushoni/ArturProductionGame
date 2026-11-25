// Flash filters -> Pixi filters (cached and shared; pixel sizes follow the stage scale)
import { ColorMatrixFilter, BlurFilter, Container, Filter } from 'pixi.js';
import { GlowFilter, DropShadowFilter, BevelFilter } from 'pixi-filters';
import type { ColorTransform } from './geom';

let fxScale = 1;
const cache = new Map<string, Filter>();
const live: { def: any; f: Filter }[] = [];

const rgb = (c: number[]) => (c[0] << 16) | (c[1] << 8) | c[2];

function build(d: any): Filter | null {
  const k = fxScale;
  switch (d.t) {
    case 'glow': {
      const dist = Math.max(1, Math.round(Math.max(d.bx, d.by) * k));
      const strength = Math.min(d.strength, 6);
      const f = new GlowFilter({
        distance: Math.min(dist, 30), outerStrength: d.inner ? 0 : strength * 1.2, innerStrength: d.inner ? strength : 0,
        color: rgb(d.color), alpha: d.color[3] / 255, quality: 0.2, knockout: !!d.knockout,
      });
      return f;
    }
    case 'shadow': {
      const a = d.angle;
      return new DropShadowFilter({
        offset: { x: Math.cos(a) * d.dist * k, y: Math.sin(a) * d.dist * k }, color: rgb(d.color),
        alpha: Math.min(1, (d.color[3] / 255) * d.strength), blur: Math.max(0, (d.bx + d.by) / 4 * k), quality: 3, shadowOnly: !!d.knockout,
      });
    }
    case 'bevel':
      return new BevelFilter({ rotation: d.angle * 180 / Math.PI, thickness: d.dist * k, lightColor: rgb(d.hi), lightAlpha: d.hi[3] / 255, shadowColor: rgb(d.shadow), shadowAlpha: d.shadow[3] / 255 });
    case 'blur':
      return new BlurFilter({ strength: Math.max(d.bx, d.by) / 2 * k, quality: Math.max(1, d.passes) });
    case 'cmatrix': {
      const f = new ColorMatrixFilter();
      const m = d.m.slice();
      m[4] /= 255; m[9] /= 255; m[14] /= 255; m[19] /= 255;
      f.matrix = m as any;
      return f;
    }
  }
  return null;
}

export function makeFilters(defs: any[]): Filter[] {
  const out: Filter[] = [];
  for (const d of defs) {
    if (!d) continue;
    const key = JSON.stringify(d);
    let f = cache.get(key);
    if (!f) {
      const b = build(d);
      if (!b) continue;
      f = b; (f as any)._def = d;
      cache.set(key, f); live.push({ def: d, f });
    }
    out.push(f);
  }
  return out;
}

/** called on resize: pixel-size dependent filters are rebuilt in place */
export function setFxScale(s: number) {
  if (Math.abs(s - fxScale) < 0.05) return;
  fxScale = s;
  for (const e of live) {
    const n = build(e.def);
    if (!n) continue;
    // copy uniforms/props of the rebuilt filter onto the shared instance
    const f: any = e.f, nf: any = n;
    if (e.def.t === 'glow') { f.distance = nf.distance; }
    else if (e.def.t === 'shadow') { f.offset = nf.offset; f.blur = nf.blur; }
    else if (e.def.t === 'bevel') { f.thickness = nf.thickness; }
    else if (e.def.t === 'blur') { f.strength = nf.strength; }
    n.destroy();
  }
}

// ---- color transforms
const cxCache = new Map<string, ColorMatrixFilter>();
export function colorFilter(cx: ColorTransform | null): Filter | null {
  if (!cx || (!cx.redOffset && !cx.greenOffset && !cx.blueOffset)) return null;
  const key = [cx.redMultiplier, cx.greenMultiplier, cx.blueMultiplier, cx.redOffset, cx.greenOffset, cx.blueOffset].join();
  let f = cxCache.get(key);
  if (!f) {
    f = new ColorMatrixFilter();
    f.matrix = [
      cx.redMultiplier, 0, 0, 0, cx.redOffset / 255,
      0, cx.greenMultiplier, 0, 0, cx.greenOffset / 255,
      0, 0, cx.blueMultiplier, 0, cx.blueOffset / 255,
      0, 0, 0, 1, 0,
    ] as any;
    cxCache.set(key, f);
  }
  return f;
}

export function setTint(c: Container, cx: ColorTransform | null) {
  if (!cx || (cx.redOffset || cx.greenOffset || cx.blueOffset)) { c.tint = 0xffffff; return; }
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(v * 255)));
  c.tint = (ch(cx.redMultiplier) << 16) | (ch(cx.greenMultiplier) << 8) | ch(cx.blueMultiplier);
}

// AS3 filter classes (constructed by game code)
export class ColorMatrixFilterAS { _def: any; constructor(m: number[] = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0]) { this._def = { t: 'cmatrix', m }; } get matrix() { return this._def.m; } set matrix(v) { this._def = { t: 'cmatrix', m: v }; } }
export class GlowFilterAS { _def: any; constructor(color = 0xff0000, alpha = 1, blurX = 6, blurY = 6, strength = 2, _q = 1, inner = false, knockout = false) { this._def = { t: 'glow', color: [(color >> 16) & 255, (color >> 8) & 255, color & 255, alpha * 255], bx: blurX, by: blurY, strength, inner, knockout }; } }
export class DropShadowFilterAS { _def: any; constructor(distance = 4, angle = 45, color = 0, alpha = 1, blurX = 4, blurY = 4, strength = 1, _q = 1, inner = false, knockout = false) { this._def = { t: 'shadow', color: [(color >> 16) & 255, (color >> 8) & 255, color & 255, alpha * 255], bx: blurX, by: blurY, angle: angle * Math.PI / 180, dist: distance, strength, inner, knockout }; } }
export class BlurFilterAS { _def: any; constructor(bx = 4, by = 4, q = 1) { this._def = { t: 'blur', bx, by, passes: q }; } }
