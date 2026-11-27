import { MouseEvent, Sprite, TextField, TextFormat } from '@/flash/as3';

/** Drawn widgets of the mod in the colours of the port's own buttons (dark teal, gold frame, cream text). */
export const COLORS = { panel: 0x1f2b2e, frame: 0xc9b27a, text: 0xf2dea5, title: 0xffd36a, dim: 0x9c8a63 };
const FONT = 'Ander Hedge';

export function label(
  text: string,
  size: number,
  color: number = COLORS.text,
  width = 300,
  align = 'center',
): TextField {
  const t = new TextField();
  t.width = width;
  t.height = size + 12;
  const f = new TextFormat(FONT, size, color);
  f.align = align;
  t.defaultTextFormat = f;
  t.text = text;
  t.mouseEnabled = false;
  return t;
}

/** a rounded button with a text; text(s) changes it */
export class TextButton extends Sprite {
  private caption: TextField;

  constructor(
    text: string,
    private w: number,
    private h: number,
    onClick: () => void,
    size = 18,
  ) {
    super();
    this.draw(false);
    this.caption = label(text, size, COLORS.text, w);
    this.caption.y = (h - size) / 2 - 4;
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
