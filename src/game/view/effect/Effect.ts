import { Point, bindMethods } from '@/flash/as3';
import { RemoveFromParent } from '@/game/cb/actions/RemoveFromParent';
import { EndAnimation } from '@/game/cb/conditions/EndAnimation';
import { SmartMC } from '@/game/cb/display/SmartMC';
import { app } from '@/game/app';

export class Effect {
  effect: any = null;
  constructor(effect: any) {
    this.effect = effect;
  }
  playOn(displayObjectContainer: any, displayObjectContainer2: any = null) {
    let point = null;
    let popUpHolder = null;
    let point2 = null;
    if (displayObjectContainer2 == null) {
      point = displayObjectContainer.localToGlobal(new Point(0, 0));
      popUpHolder = app.popUpHolder;
      point2 = popUpHolder.globalToLocal(point);
      this.effect.x = point2.x;
      this.effect.y = point2.y;
      displayObjectContainer2 = popUpHolder;
    }
    displayObjectContainer2.addChild(this.effect);
    this.effect.gotoAndPlay(1);
    const smartMC = new SmartMC(this.effect);
    smartMC.trigger(new EndAnimation(), new RemoveFromParent());
  }
  clear() {
    if (this.effect.parent != null) {
      this.effect.stop();
      this.effect.parent.removeChild(this.effect);
    }
    this.effect = null;
  }
}
bindMethods(Effect);
