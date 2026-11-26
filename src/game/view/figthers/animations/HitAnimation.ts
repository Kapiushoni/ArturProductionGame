// @ts-nocheck
import { __DEFER, as3as, bindMethods } from '@/flash/as3';
import { FighterAnimation } from '@/game/view/figthers/animations/FighterAnimation';
import { Functor } from '@/game/cb/actions/Functor';
import { AnimationLabelAt } from '@/game/cb/conditions/AnimationLabelAt';
import { EndAnimation } from '@/game/cb/conditions/EndAnimation';
import { SmartMC } from '@/game/cb/display/SmartMC';
import { Rule } from '@/game/cb/utils/Rule';
import { Or } from '@/game/conditions/Or';
import { Enemy } from '@/game/main_game/character/Enemy';
import { Jinn } from '@/game/main_game/character/Jinn';
import { HurtAnimation } from '@/game/view/figthers/animations/HurtAnimation';

export class HitAnimation extends FighterAnimation {
  declare receiver: any;
  declare damage: any;
  declare die: any;
  declare rule: any;
  declare element: any;
  declare atContact: any;
  constructor(receiver, damage, callback, atContact = null) {super(__DEFER); 
         var text = "attack";
         if(damage.isCritical())
         {
            text = "critical";
         }
          this.__init_FighterAnimation(text);
         this.receiver = receiver;
         this.damage = damage;
         this.atContact = atContact;
         this.rule = new Rule("made_hit","took_hit");
         this.rule.completed.add(callback);
      }
  make(fighterView) { const __self = this;
         var weapon = null;
         var fighter = fighterView;
         if(this.name == "critical")
         {
            fighter.fighterSoundManager.playCritical();
            if((as3as(fighter.getFighter(), Jinn)).gear.shield.isEmpty())
            {
               __self.name += "_sword";
            }
         }
         else
         {
            fighter.fighterSoundManager.playAttack();
         }
         fighter.playAnimation(this);
         this.current_mc = fighter.getMC();
         if(fighter.getFighter().isJinn())
         {
            weapon = (as3as(fighter.getFighter(), Jinn)).gear.weapon.getContent();
            if(weapon)
            {
               this.element = weapon.getElement();
            }
         }
         else
         {
            this.element = (as3as(fighter.getFighter(), Enemy)).getElement();
         }
         this.current_smc = new SmartMC(__self.current_mc);
         __self.current_smc.trigger(new Or(new AnimationLabelAt("end_animation"),new EndAnimation()),new Functor(this.finishMe));
         __self.current_smc.trigger(new AnimationLabelAt("hit"),new Functor(function(clip)
         {
            __self.setEffect(__self.current_mc,__self.element);
            __self.hitReceiver(clip);
         }));
      }
  hitReceiver(clip) { const __self = this;
         var mc = clip;
         var other = new HurtAnimation(this.damage,this.element);
         other.getAtFinish().add(function(fighterAnimation)
         {
            __self.rule.check("took_hit");
         });
         this.receiver.animate(other);
         this.receiver.getFighter().takeDamage(this.damage);
         this.atContact();
      }
  finishMe(clip) { const __self = this;
         this.rule.check("made_hit");
         __self.finish(null);
      }
  finishOther(fighterAnimation) {
         this.rule.check("took_hit");
      }
  forceKill() {
         return true;
      }
}
HitAnimation.prototype.receiver = null;
HitAnimation.prototype.damage = null;
HitAnimation.prototype.die = false;
HitAnimation.prototype.rule = null;
HitAnimation.prototype.element = null;
HitAnimation.prototype.atContact = null;
bindMethods(HitAnimation);
