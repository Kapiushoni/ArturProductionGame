import { Sprite, bindMethods } from '@/flash/as3';
import { Functor } from '@/game/cb/actions/Functor';
import { EndAnimation } from '@/game/cb/conditions/EndAnimation';
import { SmartMC } from '@/game/cb/display/SmartMC';

export class FightFeedback extends Sprite {
  static readonly gap = -50;
  declare slots: any;
  constructor() {
    super();
    this.slots = new Object();
    this.slots[0] = null;
    this.slots[1] = null;
    this.slots[2] = null;
  }
  showIn(displayObjectContainer: any) {
    displayObjectContainer.addChild(this);
  }
  addFeedback(clip: any) {
    var above = null;
    var i = 0;
    while (i < 3) {
      if (!this.slots[i]) {
        this.slots[i] = clip;
        if (i > 0) {
          above = this.slots[i - 1];
          clip.y = above.y + above.height + FightFeedback.gap;
        }
        this.makeAppear(clip);
        break;
      }
      i++;
    }
  }
  makeAppear(clip: any) {
    this.addChild(clip);
    clip.gotoAndPlay(1);
    var smartMC = new SmartMC(clip);
    smartMC.trigger(new EndAnimation(), new Functor(this.removePoster, clip));
  }
  removePoster(clip: any, params: any[]) {
    var poster = params[0];
    var i = 0;
    while (i < 3) {
      if (this.slots[i] == poster) {
        this.slots[i] = null;
        poster.stop();
        this.removeChild(poster);
        break;
      }
      i++;
    }
  }
  pause() {
    var i = 0;
    while (i < 3) {
      if (this.slots[i]) {
        this.slots[i].stop();
      }
      i++;
    }
  }
  resume() {
    var i = 0;
    while (i < 3) {
      if (this.slots[i]) {
        this.slots[i].play();
      }
      i++;
    }
  }
  clear() {
    var i = 0;
    while (i < 3) {
      if (this.slots[i]) {
        this.slots[i].stop();
      }
      i++;
    }
    if (this.parent) {
      this.parent.removeChild(this);
    }
    this.slots = null;
  }
}
// Defaults on the prototype, not field initializers: the Sprite constructor runs first and may set it,
// and an initializer (run after the base constructor) would overwrite them.
FightFeedback.prototype.slots = null;
bindMethods(FightFeedback);
