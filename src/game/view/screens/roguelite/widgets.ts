import { NineSliceSprite, Text as PText, TextStyle } from 'pixi.js';
import { MouseEvent, Sprite } from '@/flash/as3';
import { Shape } from '@/flash/display';
import { modules } from '@/flash/library';
import { fallbackFamilies, fontMap } from '@/flash/text';

/**
 * Widgets of the mod, made of the game's own art (library "screens"): its turquoise menu button and its dark
 * panel in the bamboo frame. Colours of the texts on them.
 */
export const COLORS = { panel: 0x1f2b2e, frame: 0xc9b27a, text: 0xf2dea5, title: 0xffd36a, dim: 0x9c8a63 };
const FONT = 'Ander Hedge';
/** the big button of the main menu (labels idle / mouseOver / mouseOut / locked) */
const BUTTON = { id: 242 };
/** the dark panel in the bamboo frame (pause / win windows), and how far its frame reaches in */
const PANEL = { id: 261, border: 30 };

/**
 * A one-line text placed exactly: in a box `width` wide it is centred (or left / right aligned), its top at y
 * (or its middle, with valign "middle"). Unlike the Flash TextField it does not move itself onto nearby graphics.
 */
export class Label extends Shape {
  private t: PText;

  constructor(
    text: string,
    size: number,
    color: number,
    boxWidth: number,
    align: 'left' | 'center' | 'right' = 'center',
    valign: 'top' | 'middle' = 'top',
    outline: number | null = null,
  ) {
    super();
    this.t = new PText({
      text,
      style: new TextStyle({
        fontFamily: [...(fontMap[FONT] ?? [FONT]), ...fallbackFamilies],
        fontSize: size,
        fill: color,
        ...(outline != null
          ? { stroke: { color: outline, width: Math.max(2, size / 6), join: 'round' as const } }
          : {}),
      }),
    });
    this.t.resolution = 2;
    this.t.anchor.set(align === 'center' ? 0.5 : align === 'right' ? 1 : 0, valign === 'middle' ? 0.5 : 0);
    this.t.x = align === 'center' ? boxWidth / 2 : align === 'right' ? boxWidth : 0;
    this._c.addChild(this.t);
  }
  get text(): string {
    return this.t.text;
  }
  set text(text: string) {
    this.t.text = text;
  }
  /** width of the text itself */
  get textWidth(): number {
    return this.t.width;
  }
  /** the font size is lowered until the text fits in `width` */
  fit(width: number) {
    const style = this.t.style;
    while (this.t.width > width && (style.fontSize as number) > 9) style.fontSize = (style.fontSize as number) - 1;
  }
}

export function label(
  text: string,
  size: number,
  color: number = COLORS.text,
  width = 300,
  align: 'left' | 'center' | 'right' = 'center',
): Label {
  return new Label(text, size, color, width, align);
}

/**
 * The dark panel of the game's windows (bamboo frame, diamond corners), stretched to w x h without bending its frame;
 * corners < 1 draws the frame and its corners smaller (for thin panels).
 */
export class GamePanel extends Shape {
  constructor(w: number, h: number, corners = 1) {
    super();
    const lib = modules.get('screens');
    const tex = lib?.shapeTexture(PANEL.id);
    if (tex) {
      const scale = lib.data.shapes[PANEL.id][7] ?? 1;
      const b = PANEL.border * scale;
      const panel = new NineSliceSprite({ texture: tex, leftWidth: b, topHeight: b, rightWidth: b, bottomHeight: b });
      panel.scale.set(corners / scale);
      panel.width = (w * scale) / corners;
      panel.height = (h * scale) / corners;
      this._c.addChild(panel);
    } else {
      this.graphics.lineStyle(3, COLORS.frame, 1);
      this.graphics.beginFill(COLORS.panel, 0.97);
      this.graphics.drawRoundRect(0, 0, w, h, 18);
    }
  }
}

/**
 * The game's turquoise button (from the main menu) stretched to w x h, with its own hover animation, and a text
 * centred on it. enabled = false shows it locked and ignores clicks.
 */
export class TextButton extends Sprite {
  private caption: Label;
  private clip: any = null;
  private on = true;

  constructor(
    text: string,
    private w: number,
    private h: number,
    onClick: () => void,
    size = 18,
  ) {
    super();
    this.clip = modules.get('screens')?.create(BUTTON.id) ?? null;
    if (this.clip) {
      if (this.clip.title) this.clip.title.visible = false; // its own text field: we put ours
      // the symbol's origin is not its top-left corner: fit its own bounds into 0,0 .. w,h
      const b = this.clip.getBounds(this.clip);
      this.clip.scaleX = w / b.width;
      this.clip.scaleY = h / b.height;
      this.clip.x = -b.x * this.clip.scaleX;
      this.clip.y = -b.y * this.clip.scaleY;
      this.clip.gotoAndStop('idle');
      this.addChild(this.clip);
    } else {
      this.drawFallback(false);
    }
    this.caption = new Label(text, size, 0xfff6dc, w, 'center', 'middle', 0x0d3a44);
    this.caption.y = h / 2;
    this.caption.fit(w * 0.82);
    this.addChild(this.caption);
    this.buttonMode = true;
    this.mouseChildren = false; // the button itself takes the clicks on its art
    this.addEventListener(MouseEvent.CLICK, () => {
      if (this.on) onClick();
    });
    this.addEventListener(MouseEvent.ROLL_OVER, () => this.hover(true));
    this.addEventListener(MouseEvent.ROLL_OUT, () => this.hover(false));
  }
  text(text: string) {
    this.caption.text = text;
    this.caption.fit(this.w * 0.82);
  }
  get enabled(): boolean {
    return this.on;
  }
  set enabled(on: boolean) {
    this.on = on;
    this.buttonMode = on;
    if (this.clip) this.clip.gotoAndStop(on ? 'idle' : 'locked');
    this.caption.alpha = on ? 1 : 0.6;
  }
  private hover(over: boolean) {
    if (!this.on) return;
    if (this.clip) this.clip.gotoAndPlay(over ? 'mouseOver' : 'mouseOut');
    else this.drawFallback(over);
  }
  private drawFallback(over: boolean) {
    const g = this.graphics;
    g.clear();
    g.lineStyle(2, over ? COLORS.title : COLORS.frame, 1);
    g.beginFill(COLORS.panel, over ? 1 : 0.92);
    g.drawRoundRect(0, 0, this.w, this.h, 12);
    g.endFill();
  }
}
