import { Point, bindMethods } from '@/flash/as3';
import { RemoveFromParent } from '@/game/cb/actions/RemoveFromParent';
import { EndAnimation } from '@/game/cb/conditions/EndAnimation';
import { SmartMC } from '@/game/cb/display/SmartMC';
import { app } from '@/game/app';
import type { DisplayObjectContainer } from '@/flash/as3';
import type { MovieClip } from '@/flash/as3';

export class Effect {
  effect: MovieClip = null;
  constructor(effect: MovieClip) {
    this.effect = effect;
  }
  playOn(displayObjectContainer: DisplayObjectContainer, displayObjectContainer2: DisplayObjectContainer = null) {
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
