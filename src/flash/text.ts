// flash.text.TextField on top of Pixi Text (box model with 2px gutter, html subset)
import { Text, TextStyle, Rectangle as PRect, Graphics as PGraphics, CanvasTextMetrics } from 'pixi.js';
import { InteractiveObject } from './display';

export class TextFormat {
  constructor(
    public font: string | null = null, public size: number | null = null, public color: number | null = null,
    public bold: boolean | null = null, public italic: boolean | null = null, public underline: boolean | null = null,
    public url: string | null = null, public target: string | null = null, public align: string | null = null,
    public leftMargin: number | null = null, public rightMargin: number | null = null, public indent: number | null = null,
    public leading: number | null = null,
  ) {}
  letterSpacing: number | null = null;
  kerning: boolean | null = null;
}
export const TextFieldAutoSize = { NONE: 'none', LEFT: 'left', CENTER: 'center', RIGHT: 'right' };
export const TextFormatAlign = { LEFT: 'left', CENTER: 'center', RIGHT: 'right', JUSTIFY: 'justify' };
export const TextFieldType = { DYNAMIC: 'dynamic', INPUT: 'input' };
export const AntiAliasType = { NORMAL: 'normal', ADVANCED: 'advanced' };

/** font name in SWF -> CSS family stack (Cyrillic fallback is appended) */
export const fontMap: Record<string, string[]> = {};
export let fallbackFamilies: string[] = ['sans-serif'];
export function setFallbackFonts(f: string[]) { fallbackFamilies = f; }
function families(name: string): string[] {
  const n = name.replace(/ Regular$/, '');
  return [...(fontMap[n] ?? [n]), ...fallbackFamilies];
}

let textRes = 2;
export const liveTexts = new Set<TextField>();
export function setTextResolution(r: number) {
  r = Math.min(4, Math.max(1, Math.round(r * 4) / 4));
  if (r === textRes) return;
  textRes = r;
  for (const t of liveTexts) { t._t.resolution = r; }
}

const ALIGNS = ['left', 'right', 'center', 'justify'];
/** ascent (em) of the fonts embedded in the SWF, as Flash uses them for line placement */
const FLASH_ASCENT: Record<string, number> = { 'Ander Hedge': 0.794, 'Arial Black': 0.716 };
const decode = (s: string) => s.replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/&amp;/g, '&');

export class TextField extends InteractiveObject {
  _t: Text;
  _box: PRect;
  _text = '';
  _fmt: TextFormat;
  _autoSize = 'none';
  wordWrap: boolean;
  multiline: boolean;
  embedFonts = true;
  selectable = false;
  type = 'dynamic';
  antiAliasType = 'advanced';
  maxChars = 0;
  restrict: string | null = null;
  displayAsPassword = false;
  _border = false; _bg = false; _bgColor = 0xffffff; _borderColor = 0;
  _deco: PGraphics | null = null;
  condenseWhite = false;
  sharpness = 0; thickness = 0; gridFitType = 'pixel';
  scrollV = 1;

  constructor(def?: any) {
    super();
    const d = def ?? { b: { xmin: 0, ymin: 0, xmax: 100, ymax: 100 }, size: 12, color: [0, 0, 0, 255], align: 0, font: 'Arial', wrap: false, multiline: false };
    this._box = new PRect(d.b.xmin, d.b.ymin, d.b.xmax - d.b.xmin, d.b.ymax - d.b.ymin);
    this.wordWrap = !!d.wrap; this.multiline = !!d.multiline;
    this._border = !!d.border;
    const color = d.color ? (d.color[0] << 16) | (d.color[1] << 8) | d.color[2] : 0;
    this._fmt = new TextFormat(d.font ?? 'Arial', d.size ?? 12, color, false, false, false, null, null, ALIGNS[d.align ?? 0] ?? 'left', d.lm ?? 0, d.rm ?? 0, d.indent ?? 0, d.leading ?? 0);
    this._t = new Text({ text: '', style: new TextStyle({}) });
    this._t.resolution = textRes;
    this._c.addChild(this._t);
    liveTexts.add(this);
    if (d.text) { if (d.html) this.htmlText = d.text; else this.text = d.text; } else this._layout();
  }

  get defaultTextFormat() { return Object.assign(new TextFormat(), this._fmt); }
  set defaultTextFormat(f: TextFormat) { this._merge(f); }
  setTextFormat(f: TextFormat, _b = -1, _e = -1) { this._merge(f); }
  getTextFormat() { return this.defaultTextFormat; }
  _merge(f: TextFormat) {
    for (const k of Object.keys(f) as (keyof TextFormat)[]) if (f[k] !== null && f[k] !== undefined) (this._fmt as any)[k] = f[k];
    this._layout();
  }

  get text() { return this._text; }
  set text(v: string) { this._text = String(v ?? '').replace(/\r\n?/g, '\n'); this._layout(); }
  appendText(s: string) { this.text = this._text + s; }
  get htmlText() { return this._text; }
  set htmlText(h: string) {
    h = String(h ?? '');
    const font = h.match(/<font([^>]*)>/i);
    if (font) {
      const a = font[1];
      const face = a.match(/face="([^"]*)"/i); if (face) this._fmt.font = face[1];
      const size = a.match(/size="([^"]*)"/i); if (size) this._fmt.size = +size[1];
      const col = a.match(/color="#([0-9a-f]{6})"/i); if (col) this._fmt.color = parseInt(col[1], 16);
      const ls = a.match(/letterSpacing="([^"]*)"/i); if (ls) this._fmt.letterSpacing = +ls[1];
    }
    const al = h.match(/<p[^>]*align="(\w+)"/i); if (al) this._fmt.align = al[1].toLowerCase();
    if (/<b>/i.test(h)) this._fmt.bold = true;
    const txt = h.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>\s*<p[^>]*>/gi, '\n').replace(/<[^>]+>/g, '');
    this._text = decode(txt);
    this._layout();
  }
  get textColor() { return this._fmt.color ?? 0; }
  set textColor(c: number) { this._fmt.color = c; this._layout(); }
  get length() { return this._text.length; }
  get autoSize() { return this._autoSize; }
  set autoSize(v: string) { this._autoSize = v; this._layout(); }
  get border() { return this._border; } set border(v: boolean) { this._border = v; this._layout(); }
  get background() { return this._bg; } set background(v: boolean) { this._bg = v; this._layout(); }
  get backgroundColor() { return this._bgColor; } set backgroundColor(v: number) { this._bgColor = v; this._layout(); }
  get borderColor() { return this._borderColor; } set borderColor(v: number) { this._borderColor = v; this._layout(); }

  get textWidth() { return this._t.width; }
  get textHeight() { return this._t.height; }
  get numLines() { return Math.max(1, Math.round(this._t.height / this._lineH())); }
  get maxScrollV() { return 1; }
  get bottomScrollV() { return this.numLines; }
  getLineText(i: number) { return this._text.split('\n')[i] ?? ''; }
  setSelection(_a: number, _b: number) { /* */ }

  // width/height resize the box (not scale)
  get width() { return this._box.width * Math.abs(this.scaleX); }
  set width(v: number) { this._box.width = v / (Math.abs(this.scaleX) || 1); this._layout(); }
  get height() { return this._box.height * Math.abs(this.scaleY); }
  set height(v: number) { this._box.height = v / (Math.abs(this.scaleY) || 1); this._layout(); }
  _localBounds() { return this._box.clone(); }
  _addedToStage() { super._addedToStage(); this._layout(); } // re-centre once the surrounding graphics exist
  _hitLocal(x: number, y: number) { return this._box.contains(x, y); }

  _lineH() { const f = this._fmt; return (f.size ?? 12) * 1.18 + (f.leading ?? 0); }

  _layout() {
    const f = this._fmt; const t = this._t;
    const size = f.size ?? 12;
    const inner = Math.max(1, this._box.width - 4 - (f.leftMargin ?? 0) - (f.rightMargin ?? 0));
    const align = (f.align ?? 'left') as any;
    t.style = new TextStyle({
      fontFamily: families(f.font ?? 'Arial'), fontSize: size, fill: f.color ?? 0,
      fontWeight: f.bold ? 'bold' : 'normal', fontStyle: f.italic ? 'italic' : 'normal',
      align: align === 'justify' ? 'left' : align, letterSpacing: f.letterSpacing ?? 0,
      lineHeight: this._lineH(), wordWrap: this.wordWrap, wordWrapWidth: inner, breakWords: this.wordWrap,
      padding: 4,
    });
    let s = this.displayAsPassword ? '*'.repeat(this._text.length) : this._text;
    if (!this.multiline && !this.wordWrap) s = s.replace(/\n/g, ' ');
    t.text = s;
    const tw = t.width, th = t.height;
    if (this._autoSize !== 'none') {
      const w = tw + 4, h = th + 4;
      if (!this.wordWrap) {
        if (this._autoSize === 'center') this._box.x += (this._box.width - w) / 2;
        else if (this._autoSize === 'right') this._box.x += this._box.width - w;
        this._box.width = w;
      }
      this._box.height = h;
    }
    const x0 = this._box.x + 2 + (f.leftMargin ?? 0);
    let x = x0;
    if (align === 'center') x = x0 + (inner - tw + (f.letterSpacing ?? 0)) / 2; // trailing letter spacing
    else if (align === 'right') x = x0 + inner - tw;
    t.x = x; t.y = this._box.y + 2;
    // Place the first baseline exactly where Flash puts it: box top + 2px gutter + font ascent.
    // Browser metrics (and the Cyrillic fallback) differ, so Pixi's own baseline is corrected to it.
    {
      const lh = this._lineH();
      const fm = CanvasTextMetrics.measureFont((t.style as any)._fontString);
      const shift = Math.max(0, (lh - fm.fontSize) / 2);
      const asc = FLASH_ASCENT[(f.font ?? '').replace(/ Regular$/, '')] ?? 0.9;
      // small text sits ~2px low in the browser compared to Flash (hinting/rounding); large text matches
      const small = -2 * Math.max(0, Math.min(1, (30 - size) / 12));
      t.y = this._box.y + 2 + asc * size + small - (fm.ascent + shift);
      // one-line labels sitting on a bar/plate (HP, XP, level...): centre the glyphs on that graphic,
      // the invisible text box is often taller than the bar and placed differently from field to field
      if (!this.wordWrap && !this.multiline && this._autoSize === 'none' && this.parent) {
        let host: any = this.parent; let up = 0;
        while (host && host._ch.length === 1 && up < 2) { host = host.parent; up++; }
        if (host && host._ch && host._ch.length > 1) {
          const vis = this._c.visible; this._c.visible = false;
          const hb = host.getBounds(this);
          this._c.visible = vis;
          if (hb.height > size * 0.9 && hb.height <= size * 2.2) t.y = hb.y + hb.height / 2 + size * 0.36 - (fm.ascent + shift);
          // the hero level label sits on a plate drawn inside the big stats panel: nudge it onto the plate's centre
          else if (this.name === 'title_1' && this.parent?.name === 'level' && this.parent?.parent?.name === 'stats') t.y += 3;
        }
      }
    }
    if (this._border || this._bg) {
      this._deco ??= this._c.addChildAt(new PGraphics(), 0);
      const g = this._deco; g.clear(); g.rect(this._box.x, this._box.y, this._box.width, this._box.height);
      if (this._bg) g.fill(this._bgColor);
      if (this._border) g.stroke({ width: 1, color: this._borderColor });
    } else if (this._deco) this._deco.clear();
  }
}
