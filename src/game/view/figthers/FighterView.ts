import { bindMethods } from '@/flash/as3';
import { Util } from '@/game/util/Util';
import { HitAnimation } from '@/game/view/figthers/animations/HitAnimation';
import { IdleAnimation } from '@/game/view/figthers/animations/IdleAnimation';
import { NoneAnimation } from '@/game/view/figthers/animations/NoneAnimation';
import type { Damage } from '@/game/main_game/dungeon/Damage';
import type { Fighter } from '@/game/main_game/character/Fighter';
import type { IFighterAnimation } from '@/game/view/figthers/animations/IFighterAnimation';

export class FighterView {
  fighter: any = null;
  currentAnimation: any = null;
  nextAnimation: any = null;
  soundManager: any = null;
  constructor(fighter: Fighter) {
    this.fighter = fighter;
    this.setSoundManager();
  }
  setSoundManager() {
    throw new Error('Abstract Class');
  }
  get fighterSoundManager() {
    return this.soundManager;
  }
  animate(nextAnimation: IFighterAnimation) {
    this.nextAnimation = nextAnimation;
    if (this.currentAnimation == null) {
      this.endCurrentAnimation(null);
    } else if (this.nextAnimation.forceKill()) {
      this.currentAnimation.kill();
      this.endCurrentAnimation(this.currentAnimation);
    }
  }
  endCurrentAnimation(fighterAnimation: IFighterAnimation) {
    if (this.nextAnimation == null) {
      if (fighterAnimation.mustGoToIdle()) {
        this.nextAnimation = new IdleAnimation();
      } else {
        this.nextAnimation = new NoneAnimation();
      }
    }
    this.currentAnimation = this.nextAnimation;
    this.nextAnimation = null;
    this.currentAnimation.atFinish.addAtFirst(this.endCurrentAnimation);
    this.currentAnimation.make(this);
  }
  pause() {
    this.currentAnimation.pause();
    this.soundManager.pause();
  }
  resume() {
    this.currentAnimation.resume();
    this.soundManager.resume();
  }
  clear() {
    this.currentAnimation.kill();
    this.currentAnimation = null;
  }
  playAnimation(fighterAnimation: IFighterAnimation) {}
  set x(value: number) {
    value = Number(value);
  }
  get x() {
    return 0;
  }
  set y(value: number) {
    value = Number(value);
  }
  get y() {
    return 0;
  }
  getMC() {
    return null;
  }
  putIn(displayObjectContainer: any) {}
  onHit(fighterView: FighterView, damage: Damage, callback: Function, callback2: Function = null) {
    this.bringToFront();
    var hitAnimation = new HitAnimation(fighterView, damage, callback, callback2);
    this.animate(hitAnimation);
  }
  bringToFront() {
    Util.bringToFront(this.getMC());
  }
}
bindMethods(FighterView);
