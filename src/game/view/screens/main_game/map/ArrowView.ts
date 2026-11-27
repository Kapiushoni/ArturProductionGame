import { MouseEvent, bindMethods } from '@/flash/as3';
import { Functor } from '@/game/cb/actions/Functor';
import { SmartMC } from '@/game/cb/display/SmartMC';
import { EndCurrentLabel } from '@/game/conditions/EndCurrentLabel';
import { app } from '@/game/app';
import { GameSounds } from '@/game/sound/GameSounds';

export class ArrowView {
  mc: any = null;
  showing = false;
  click: any = null;
  constructor(mc: any, click: Function = null, flag: boolean = false) {
    this.click = click;
    this.mc = mc;
    this.showing = false;
    if (flag) {
      mc.gotoAndStop('arrowOut');
    } else {
      mc.gotoAndStop('arrowIn');
    }
    mc.buttonMode = true;
    this.initializeButton(mc);
    this.refreshAsButton();
  }
  initializeButton(clip: any) {
    clip.hitbox.addEventListener(MouseEvent.CLICK, this.onClick, false, 0, true);
    clip.hitbox.addEventListener(MouseEvent.ROLL_OVER, this.over, false, 0, true);
    clip.hitbox.addEventListener(MouseEvent.ROLL_OUT, this.out, false, 0, true);
  }
  onClick(event: any) {
    app.soundManager.playFx(GameSounds.BUTTON_CLICK);
    this.click();
  }
  over(event: any) {
    if (this.showing) {
      this.mc.gotoAndPlay('mouseOver');
      app.soundManager.playFx(GameSounds.MOUSE_OVER);
    }
  }
  out(event: any) {
    if (this.showing) {
      this.mc.gotoAndPlay('mouseOut');
      app.soundManager.playFx(GameSounds.MOUSE_OVER);
    }
  }
  hide() {
    if (this.showing) {
      this.showing = false;
      this.refreshAsButton();
      this.mc.gotoAndPlay('arrowOut');
    }
  }
  show() {
    if (!this.showing) {
      this.showing = true;
      this.mc.gotoAndPlay('arrowIn');
      new SmartMC(this.mc).trigger(new EndCurrentLabel(this.mc), Functor.wrap(this.refreshAsButton));
    }
  }
  refreshAsButton() {
    this.mc.mouseEnabled = this.showing;
    this.mc.mouseChildren = this.showing;
  }
  clear() {
    this.mc = null;
    this.click = null;
  }
}
bindMethods(ArrowView);
