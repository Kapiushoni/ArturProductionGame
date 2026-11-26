// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { Util } from '@/game/util/Util';
import { HitAnimation } from '@/game/view/figthers/animations/HitAnimation';
import { IdleAnimation } from '@/game/view/figthers/animations/IdleAnimation';
import { NoneAnimation } from '@/game/view/figthers/animations/NoneAnimation';

export class FighterView {
  declare fighter: any;
  declare currentAnimation: any;
  declare nextAnimation: any;
  declare soundManager: any;
  constructor(fighter) {
         
         this.fighter = fighter;
         this.setSoundManager();
      }
  getFighter() {
         return this.fighter;
      }
  setSoundManager() {
         throw new Error("Abstract Class");
      }
  get fighterSoundManager() {
         return this.soundManager;
      }
  animate(nextAnimation) {
         this.nextAnimation = nextAnimation;
         if(this.currentAnimation == null)
         {
            this.endCurrentAnimation(null);
         }
         else if(this.nextAnimation.forceKill())
         {
            this.currentAnimation.kill();
            this.endCurrentAnimation(this.currentAnimation);
         }
      }
  endCurrentAnimation(fighterAnimation) {
         if(this.nextAnimation == null)
         {
            if(fighterAnimation.mustGoToIdle())
            {
               this.nextAnimation = new IdleAnimation();
            }
            else
            {
               this.nextAnimation = new NoneAnimation();
            }
         }
         this.currentAnimation = this.nextAnimation;
         this.nextAnimation = null;
         this.currentAnimation.getAtFinish().addAtFirst(this.endCurrentAnimation);
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
  playAnimation(fighterAnimation) {
      }
  set x(value) { value = Number(value);
      }
  get x() {
         return Number(0);
      }
  set y(value) { value = Number(value);
      }
  get y() {
         return Number(0);
      }
  getMC() {
         return null;
      }
  putIn(displayObjectContainer) {
      }
  onHit(fighterView, damage, callback, callback2 = null) {
         this.bringToFront();
         var hitAnimation = new HitAnimation(fighterView,damage,callback,callback2);
         this.animate(hitAnimation);
      }
  bringToFront() {
         Util.bringToFront(this.getMC());
      }
}
FighterView.prototype.fighter = null;
FighterView.prototype.currentAnimation = null;
FighterView.prototype.nextAnimation = null;
FighterView.prototype.soundManager = null;
bindMethods(FighterView);
