// @ts-nocheck
import { __DEFER, bindMethods } from '@/flash/as3';
import { Functor } from '@/game/cb/actions/Functor';
import { AnimationLabelAt } from '@/game/cb/conditions/AnimationLabelAt';
import { EndAnimation } from '@/game/cb/conditions/EndAnimation';
import { SmartMC } from '@/game/cb/display/SmartMC';
import { Signal } from '@/game/cb/signals/Signal';
import { Or } from '@/game/conditions/Or';

export class FighterAnimation {
  declare atFinish: any;
  declare name: any;
  declare current_mc: any;
  declare current_smc: any;
  constructor(...__a) { if (__a[0] !== __DEFER) this.__init_FighterAnimation(...__a); }
  __init_FighterAnimation(name) {
         
         this.name = name;
         this.atFinish = new Signal();
      }
  getAtFinish() {
         return this.atFinish;
      }
  forceKill() {
         return false;
      }
  getName() {
         return this.name;
      }
  make(fighterView) {
         fighterView.playAnimation(this);
         this.current_mc = fighterView.getMC();
         this.current_smc = new SmartMC(this.current_mc);
         this.current_smc.trigger(new Or(new AnimationLabelAt("end_animation"),new EndAnimation()),new Functor(this.finish));
      }
  finish(clip) {
         this.clearMc();
         this.atFinish.emit(this);
         this.atFinish.clear();
      }
  setEffect(clip, element = null) {
         var text = null;
         if(clip.fx)
         {
            text = "normal";
            if(Boolean(element) && element.isOfFire)
            {
               text = "fire";
            }
            else if(Boolean(element) && element.isOfIce)
            {
               text = "ice";
            }
            if(clip.fx)
            {
               clip.fx.gotoAndStop(text);
            }
         }
      }
  pause() {
         this.current_mc.stop();
      }
  resume() {
         this.current_mc.play();
      }
  clearMc() {
         if(this.current_smc != null)
         {
            this.current_smc.clear();
         }
         this.current_smc = null;
         if(this.current_mc != null)
         {
            this.current_mc.stop();
         }
         this.current_mc = null;
      }
  kill() {
         this.clearMc();
         this.atFinish.clear();
      }
  mustGoToIdle() {
         return true;
      }
}
FighterAnimation.prototype.atFinish = null;
FighterAnimation.prototype.name = null;
FighterAnimation.prototype.current_mc = null;
FighterAnimation.prototype.current_smc = null;
bindMethods(FighterAnimation);
