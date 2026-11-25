// Minimal SWF parser: extracts what the web runtime needs (no ActionScript).
// Shapes: id + bounds (geometry comes from FFDec SVG export).
// Sprites: per-frame display-list ops, frame labels.
// EditText, fonts, exports (linkage names), bitmaps (ids only).
import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';

class Reader {
  constructor(buf, pos = 0) { this.b = buf; this.p = pos; this.bit = 0; this.cur = 0; }
  align() { this.bit = 0; }
  u8() { this.align(); return this.b[this.p++]; }
  u16() { this.align(); const v = this.b.readUInt16LE(this.p); this.p += 2; return v; }
  s16() { this.align(); const v = this.b.readInt16LE(this.p); this.p += 2; return v; }
  u32() { this.align(); const v = this.b.readUInt32LE(this.p); this.p += 4; return v; }
  f32() { this.align(); const v = this.b.readFloatLE(this.p); this.p += 4; return v; }
  fixed() { this.align(); const v = this.b.readInt32LE(this.p) / 65536; this.p += 4; return v; }
  fixed8() { this.align(); const v = this.b.readInt16LE(this.p) / 256; this.p += 2; return v; }
  str() { this.align(); const e = this.b.indexOf(0, this.p); const s = this.b.toString('utf8', this.p, e); this.p = e + 1; return s; }
  ub(n) {
    let v = 0;
    for (let i = 0; i < n; i++) {
      if (this.bit === 0) { this.cur = this.b[this.p++]; this.bit = 8; }
      this.bit--;
      v = (v << 1) | ((this.cur >> this.bit) & 1);
    }
    return v >>> 0;
  }
  sb(n) { if (!n) return 0; const v = this.ub(n); return v & (1 << (n - 1)) ? v - (1 << n) : v; }
  fb(n) { return this.sb(n) / 65536; }
  rect() {
    this.align(); const n = this.ub(5);
    const r = { xmin: this.sb(n) / 20, xmax: this.sb(n) / 20, ymin: this.sb(n) / 20, ymax: this.sb(n) / 20 };
    this.align(); return r;
  }
  rgb() { return [this.u8(), this.u8(), this.u8(), 255]; }
  rgba() { return [this.u8(), this.u8(), this.u8(), this.u8()]; }
  matrix() {
    this.align();
    let a = 1, b = 0, c = 0, d = 1;
    if (this.ub(1)) { const n = this.ub(5); a = this.fb(n); d = this.fb(n); }
    if (this.ub(1)) { const n = this.ub(5); b = this.fb(n); c = this.fb(n); }
    const n = this.ub(5); const tx = this.sb(n) / 20, ty = this.sb(n) / 20;
    this.align();
    return [a, b, c, d, tx, ty];
  }
  cxform(alpha) {
    this.align();
    const hasAdd = this.ub(1), hasMul = this.ub(1), n = this.ub(4);
    const m = [1, 1, 1, 1], o = [0, 0, 0, 0];
    const k = alpha ? 4 : 3;
    if (hasMul) for (let i = 0; i < k; i++) m[i] = this.sb(n) / 256;
    if (hasAdd) for (let i = 0; i < k; i++) o[i] = this.sb(n);
    this.align();
    return { m, o };
  }
}

function readFilters(r) {
  const n = r.u8(); const out = [];
  for (let i = 0; i < n; i++) {
    const id = r.u8();
    if (id === 0) { // drop shadow
      const color = r.rgba(), bx = r.fixed(), by = r.fixed(), angle = r.fixed(), dist = r.fixed(), strength = r.fixed8(), fl = r.u8();
      out.push({ t: 'shadow', color, bx, by, angle, dist, strength, inner: !!(fl & 0x80), knockout: !!(fl & 0x40), passes: fl & 31 });
    } else if (id === 1) {
      out.push({ t: 'blur', bx: r.fixed(), by: r.fixed(), passes: r.u8() >> 3 });
    } else if (id === 2) {
      const color = r.rgba(), bx = r.fixed(), by = r.fixed(), strength = r.fixed8(), fl = r.u8();
      out.push({ t: 'glow', color, bx, by, strength, inner: !!(fl & 0x80), knockout: !!(fl & 0x40), passes: fl & 31 });
    } else if (id === 3) {
      const shadow = r.rgba(), hi = r.rgba(), bx = r.fixed(), by = r.fixed(), angle = r.fixed(), dist = r.fixed(), strength = r.fixed8(), fl = r.u8();
      out.push({ t: 'bevel', shadow, hi, bx, by, angle, dist, strength, inner: !!(fl & 0x80), passes: fl & 15 });
    } else if (id === 4 || id === 7) {
      const nc = r.u8(); const colors = [], ratios = [];
      for (let j = 0; j < nc; j++) colors.push(r.rgba());
      for (let j = 0; j < nc; j++) ratios.push(r.u8());
      const bx = r.fixed(), by = r.fixed(), angle = r.fixed(), dist = r.fixed(), strength = r.fixed8(), fl = r.u8();
      out.push({ t: id === 4 ? 'gglow' : 'gbevel', colors, ratios, bx, by, angle, dist, strength, inner: !!(fl & 0x80) });
    } else if (id === 5) {
      const mx = r.u8(), my = r.u8(), div = r.f32(), bias = r.f32(); const m = [];
      for (let j = 0; j < mx * my; j++) m.push(r.f32());
      r.rgba(); r.u8();
      out.push({ t: 'conv', mx, my, div, bias, m });
    } else if (id === 6) {
      const m = []; for (let j = 0; j < 20; j++) m.push(r.f32());
      out.push({ t: 'cmatrix', m });
    } else throw new Error('unknown filter ' + id);
  }
  return out;
}

function skipClipActions(r, end) { r.p = end; } // AS2 only; never in these files

function readPlace(r, tag, end) {
  const op = { op: 'place' };
  if (tag === 4) { // PlaceObject1
    op.id = r.u16(); op.depth = r.u16(); op.matrix = r.matrix();
    if (r.p < end) op.cx = r.cxform(false);
    op.op = 'new';
    return op;
  }
  const f = r.u8(); const f2 = tag === 70 ? r.u8() : 0;
  op.depth = r.u16();
  const move = f & 1, hasChar = f & 2, hasMatrix = f & 4, hasCx = f & 8, hasRatio = f & 16, hasName = f & 32, hasClip = f & 64, hasActions = f & 128;
  if (tag === 70 && ((f2 & 8) || ((f2 & 16) && hasChar))) op.className = r.str();
  if (hasChar) op.id = r.u16();
  if (hasMatrix) op.matrix = r.matrix();
  if (hasCx) op.cx = r.cxform(true);
  if (hasRatio) op.ratio = r.u16();
  if (hasName) op.name = r.str();
  if (hasClip) op.clipDepth = r.u16();
  if (tag === 70) {
    if (f2 & 1) op.filters = readFilters(r);
    if (f2 & 2) op.blend = r.u8();
    if (f2 & 4) op.cache = r.u8();
    if (f2 & 32) op.visible = r.u8();
    if (f2 & 64) op.bg = r.rgba();
  }
  if (hasActions) skipClipActions(r, end);
  op.op = move && hasChar ? 'replace' : move ? 'move' : 'new';
  return op;
}

export function parseSwf(path) {
  let buf = readFileSync(path);
  const sig = buf.toString('latin1', 0, 3);
  if (sig === 'CWS') buf = Buffer.concat([buf.subarray(0, 8), inflateSync(buf.subarray(8))]);
  else if (sig !== 'FWS') throw new Error('unsupported swf ' + sig);
  const r = new Reader(buf, 8);
  const stage = r.rect(); const fps = r.u16() / 256; r.u16();
  const out = { stage, fps, shapes: {}, sprites: {}, texts: {}, fonts: {}, bitmaps: {}, morphs: {}, exports: {}, sounds: {} };

  function readTags(end, sprite) {
    let frame = { ops: [] }; const frames = sprite ? [] : null;
    while (r.p < end) {
      const h = r.u16(); const tag = h >> 6; let len = h & 63;
      if (len === 63) len = r.u32();
      const start = r.p, tend = start + len;
      switch (tag) {
        case 0: r.p = tend; return frames;
        case 1: if (sprite) { frames.push(frame); frame = { ops: [] }; } break;
        case 2: case 22: case 32: case 83: {
          const id = r.u16(); const b = r.rect(); out.shapes[id] = { b }; break;
        }
        case 46: case 84: { const id = r.u16(); const b1 = r.rect(); const b2 = r.rect(); out.morphs[id] = { b1, b2 }; break; }
        case 6: case 21: case 35: case 90: case 20: case 36: out.bitmaps[r.u16()] = { tag }; break;
        case 14: out.sounds[r.u16()] = {}; break;
        case 39: {
          const id = r.u16(); const fc = r.u16();
          const frs = readTags(tend, true);
          out.sprites[id] = { frames: frs, fc };
          break;
        }
        case 4: case 26: case 70: if (sprite) frame.ops.push(readPlace(r, tag, tend)); break;
        case 5: if (sprite) { r.u16(); frame.ops.push({ op: 'remove', depth: r.u16() }); } break;
        case 28: if (sprite) frame.ops.push({ op: 'remove', depth: r.u16() }); break;
        case 43: if (sprite) frame.label = r.str(); break;
        case 56: case 76: {
          const n = r.u16();
          for (let i = 0; i < n; i++) { const id = r.u16(); const name = r.str(); if (tag === 56 || id) out.exports[name] = id; }
          break;
        }
        case 48: case 75: {
          const id = r.u16(); const fl = r.u8(); r.u8(); const nl = r.u8();
          const name = buf.toString('utf8', r.p, r.p + nl).replace(/\0+$/, '');
          out.fonts[id] = { name, bold: !!(fl & 1), italic: !!(fl & 2) }; break;
        }
        case 88: { const id = r.u16(); const name = r.str(); out.fonts[id] = { ...(out.fonts[id] || {}), name }; break; }
        case 37: {
          const id = r.u16(); const b = r.rect();
          const f1 = r.u8(), f2 = r.u8();
          const t = { b, wrap: !!(f1 & 64), multiline: !!(f1 & 32), password: !!(f1 & 16), readOnly: !!(f1 & 8), autoSize: !!(f2 & 64), noSelect: !!(f2 & 16), border: !!(f2 & 8), html: !!(f2 & 2) };
          if (f1 & 1) t.font = r.u16();
          if (f2 & 128) t.fontClass = r.str();
          if ((f1 & 1) || (f2 & 128)) t.size = r.u16() / 20;
          if (f1 & 4) t.color = r.rgba();
          if (f1 & 2) t.maxLen = r.u16();
          if (f2 & 32) { t.align = r.u8(); t.lm = r.u16() / 20; t.rm = r.u16() / 20; t.indent = r.u16() / 20; t.leading = r.s16() / 20; }
          t.var = r.str();
          if (f1 & 128) t.text = r.str();
          out.texts[id] = t; break;
        }
      }
      r.p = tend;
    }
    return frames;
  }
  readTags(buf.length, false);
  return out;
}
