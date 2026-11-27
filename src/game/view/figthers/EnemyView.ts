import { MovieClip, as3as, bindMethods } from '@/flash/as3';
import { FighterView } from '@/game/view/figthers/FighterView';
import { main } from '@/game/main';
import { Enemy } from '@/game/main_game/character/Enemy';
import { EnemySoundManager } from '@/game/sound/EnemySoundManager';
import { Util } from '@/game/util/Util';

export class EnemyView extends FighterView {
  declare container: any;
  constructor(fighter) {
    super(fighter);
    this.container = new MovieClip();
    this.container.enemy = null;
  }
  getMC() {
    return this.container.enemy;
  }
  setSoundManager() {
    this.soundManager = new EnemySoundManager(as3as(this.fighter, Enemy));
  }
  playAnimation(fighterAnimation) {
    if (this.getMC() != null) {
      this.container.removeChild(this.getMC());
    }
    this.container.enemy = this.getNewMc(fighterAnimation);
    this.container.addChild(this.container.enemy);
    this.container.enemy.gotoAndPlay(1);
  }
  getNewMc(fighterAnimation) {
    var text = 'assets.' + this.fighter.getName() + '.' + fighterAnimation.getName();
    var cls = main.swfLoader.getClass(text);
    return new cls();
  }
  putIn(displayObjectContainer) {
    displayObjectContainer['enemy'] = this.container;
    displayObjectContainer.addChild(this.container);
  }
  set x(value) {
    value = Number(value);
    this.container.x = value;
  }
  get x() {
    return Number(this.container.x);
  }
  set y(value) {
    value = Number(value);
    this.container.y = value;
  }
  get y() {
    return Number(this.container.y);
  }
  bringToFront() {
    var clip = this.container;
    Util.bringToFront(clip);
  }
  clear() {
    super.clear();
    if (this.container.enemy != null) {
      this.container.removeChild(this.container.enemy);
    }
    this.container.enemy = null;
    if (this.container.parent) {
      this.container.parent.removeChild(this.container);
    }
    this.container = null;
  }
}
// Defaults on the prototype, not field initializers: the FighterView constructor calls overridden methods that may set them,
// and an initializer (run after the base constructor) would overwrite them.
EnemyView.prototype.container = null;
bindMethods(EnemyView);
