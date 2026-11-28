import { Text as PText, TextStyle } from 'pixi.js';
import { MouseEvent, Sprite } from '@/flash/as3';
import { Shape } from '@/flash/display';
import { fallbackFamilies, fontMap } from '@/flash/text';

/** Drawn widgets of the mod in the colours of the port's own buttons (dark teal, gold frame, cream text). */
export const COLORS = { panel: 0x1f2b2e, frame: 0xc9b27a, text: 0xf2dea5, title: 0xffd36a, dim: 0x9c8a63 };
const FONT = 'Ander Hedge';

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
  ) {
    super();
    this.t = new PText({
      text,
      style: new TextStyle({
        fontFamily: [...(fontMap[FONT] ?? [FONT]), ...fallbackFamilies],
        fontSize: size,
        fill: color,
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

/** a rounded button with a text centred on it; text(s) changes it */
export class TextButton extends Sprite {
  private caption: Label;

  constructor(
    text: string,
    private w: number,
    private h: number,
    onClick: () => void,
    size = 18,
  ) {
    super();
    this.draw(false);
    this.caption = new Label(text, size, COLORS.text, w, 'center', 'middle');
    this.caption.y = h / 2;
    this.addChild(this.caption);
    this.buttonMode = true;
    this.addEventListener(MouseEvent.CLICK, () => onClick());
    this.addEventListener(MouseEvent.ROLL_OVER, () => this.draw(true));
    this.addEventListener(MouseEvent.ROLL_OUT, () => this.draw(false));
  }
  text(text: string) {
    this.caption.text = text;
  }
  private draw(over: boolean) {
    const g = this.graphics;
    g.clear();
    g.lineStyle(2, over ? COLORS.title : COLORS.frame, 1);
    g.beginFill(COLORS.panel, over ? 1 : 0.92);
    g.drawRoundRect(0, 0, this.w, this.h, 12);
    g.endFill();
  }
}
