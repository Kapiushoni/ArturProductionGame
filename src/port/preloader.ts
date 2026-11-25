// Replacement for the missing PreloaderAP.swf: same contract (done_mc.gotoAndStop(0..100), 43 frames, stop at 43).
import { MovieClip, Sprite, allClips } from '@/flash/display';
import { TextField, TextFormat } from '@/flash/text';
import { lang } from './i18n';

class Bar extends MovieClip {
  private fill = new Sprite();
  private pct = 0;
  constructor() {
    super();
    const frame = new Sprite();
    frame.graphics.lineStyle(2, 0xc9b27a, 1);
    frame.graphics.beginFill(0x1a1612, 1);
    frame.graphics.drawRoundRect(-152, -10, 304, 20, 10);
    this.addChild(frame);
    this.addChild(this.fill);
    this.draw();
  }
  get totalFrames() { return 101; }
  get currentFrame() { return this.pct; }
  gotoAndStop(f: any) { this.pct = Math.max(0, Math.min(100, +f || 0)); this.draw(); }
  gotoAndPlay(f: any) { this.gotoAndStop(f); }
  private draw() {
    const g = this.fill.graphics; g.clear();
    g.beginFill(0xe0b84a, 1);
    if (this.pct > 0) g.drawRoundRect(-148, -6, 296 * this.pct / 100, 12, 6);
  }
}

export class PreloaderAP extends MovieClip {
  done_mc: Bar;
  constructor() {
    super();
    const bg = new Sprite();
    bg.graphics.beginFill(0x0a0a0a, 1); bg.graphics.drawRect(0, 0, 700, 500);
    this.addChild(bg);
    const t = new TextField();
    t.width = 700; t.height = 60; t.y = 200;
    const f = new TextFormat('Ander Hedge', 34, 0xc9b27a); f.align = 'center';
    t.defaultTextFormat = f; t.text = ({ en: 'Loading...', ru: 'Загрузка...', uk: 'Завантаження...' } as any)[lang] ?? 'Loading...';
    this.addChild(t);
    this.done_mc = new Bar(); this.done_mc.x = 350; this.done_mc.y = 280;
    this.addChild(this.done_mc);
    this._playing = false;
    allClips.add(this);
  }
  // width/height are forced to 700x500 by the game: keep the box exact
  get width() { return 700; } set width(_v: number) { /* fixed */ }
  get height() { return 500; } set height(_v: number) { /* fixed */ }
  get totalFrames() { return 43; }
  _advance() {
    if (!this._playing) return;
    if (this._frame < 42) this._frame++;
    if (this._frame >= 42) { this._playing = false; this.alpha = 0; }
    else if (this._frame > 2) this.alpha = 1 - (this._frame - 2) / 40;
  }
  _goto(i: number, play: boolean) { this._playing = play; this._frame = Math.max(0, Math.min(42, i)); }
}
