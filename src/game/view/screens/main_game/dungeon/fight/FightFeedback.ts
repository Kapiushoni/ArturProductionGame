import { Sprite, bindMethods } from '@/flash/as3';
import { Functor } from '@/game/cb/actions/Functor';
import { EndAnimation } from '@/game/cb/conditions/EndAnimation';
import { SmartMC } from '@/game/cb/display/SmartMC';
import type { DisplayObjectContainer } from '@/flash/as3';
import type { MovieClip } from '@/flash/as3';

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
  showIn(displayObjectContainer: DisplayObjectContainer) {
    displayObjectContainer.addChild(this);
  }
  addFeedback(clip: MovieClip) {
    let above = null;
    let i = 0;
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
  makeAppear(clip: MovieClip) {
    this.addChild(clip);
    clip.gotoAndPlay(1);
    const smartMC = new SmartMC(clip);
    smartMC.trigger(new EndAnimation(), new Functor(this.removePoster, clip));
  }
  removePoster(clip: MovieClip, params: any[]) {
    const poster = params[0];
    let i = 0;
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
    let i = 0;
    while (i < 3) {
      if (this.slots[i]) {
        this.slots[i].stop();
      }
      i++;
    }
  }
  resume() {
    let i = 0;
    while (i < 3) {
      if (this.slots[i]) {
        this.slots[i].play();
      }
      i++;
    }
  }
  clear() {
    let i = 0;
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
bindMethods(FightFeedback, ['removePoster', 'pause', 'resume', 'clear']);
