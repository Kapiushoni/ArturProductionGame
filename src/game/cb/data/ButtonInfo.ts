/**
 * The handlers of a button (see Screen): click, mouse over, mouse out. A string handler is a frame label:
 * the button (or, with a hit box, the button's parent) goes to it.
 */
export class ButtonInfo {
  private _click: Function;
  private _over: Function;
  private _out: Function;
  private hitBox: string;

  /** playLabels: gotoAndPlay (else gotoAndStop) for label handlers */
  constructor(click: Function, over: any = null, out: any = null, playLabels = true, hitBox: string = null) {
    this._click = click;
    this._over = typeof over === 'string' ? ButtonInfo.defaultGoto(over, playLabels, hitBox) : over;
    this._out = typeof out === 'string' ? ButtonInfo.defaultGoto(out, playLabels, hitBox) : out;
    this.hitBox = hitBox;
  }
  /** a handler that moves the button to a frame label */
  static defaultGoto(label: string, play = false, hitBox: string = null): (event: any) => void {
    return (event: any) => {
      event.stopPropagation();
      const clip = hitBox ? event.currentTarget.parent : event.currentTarget;
      if (play) {
        clip.gotoAndPlay(label);
      } else {
        clip.gotoAndStop(label);
      }
    };
  }
  getHitBox(): string {
    return this.hitBox;
  }
  get click(): Function {
    return this._click;
  }
  get over(): Function {
    return this._over;
  }
  get out(): Function {
    return this._out;
  }
}
