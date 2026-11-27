import { as3as, bindMethods } from '@/flash/as3';
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
import type { Damage } from '@/game/main_game/dungeon/Damage';
import type { Element } from '@/game/main_game/element/Element';

/**
 * An attack ("attack", or "critical" / "critical_sword" without a shield). At the "hit" label the receiver plays
 * its HurtAnimation and takes the damage; `callback` runs when both animations have ended.
 */
export class HitAnimation extends FighterAnimation {
  private receiver: any;
  private damage: Damage;
  private die = false;
  private rule: Rule;
  /** the attacker's element (enemy's, or the jinn's weapon's) */
  private element: Element = null;
  private atContact: Function;

  constructor(receiver: any, damage: Damage, callback: Function, atContact: Function = null) {
    super(damage.isCritical() ? 'critical' : 'attack');
    this.receiver = receiver;
    this.damage = damage;
    this.atContact = atContact;
    this.rule = new Rule('made_hit', 'took_hit');
    this.rule.completed.add(callback);
  }
  make(fighterView: any) {
    if (this.name == 'critical') {
      fighterView.fighterSoundManager.playCritical();
      if ((as3as(fighterView.getFighter(), Jinn) as Jinn).gear.shield.isEmpty()) {
        this.name += '_sword';
      }
    } else {
      fighterView.fighterSoundManager.playAttack();
    }
    fighterView.playAnimation(this);
    this.current_mc = fighterView.getMC();
    if (fighterView.getFighter().isJinn()) {
      const weapon = (as3as(fighterView.getFighter(), Jinn) as Jinn).gear.weapon.getContent();
      if (weapon) {
        this.element = weapon.getElement();
      }
    } else {
      this.element = (as3as(fighterView.getFighter(), Enemy) as Enemy).getElement();
    }
    this.current_smc = new SmartMC(this.current_mc);
    this.current_smc.trigger(
      new Or(new AnimationLabelAt('end_animation'), new EndAnimation()),
      new Functor(this.finishMe),
    );
    this.current_smc.trigger(
      new AnimationLabelAt('hit'),
      new Functor((clip: any) => {
        this.setEffect(this.current_mc, this.element);
        this.hitReceiver(clip);
      }),
    );
  }
  hitReceiver(_clip: any) {
    const hurt = new HurtAnimation(this.damage, this.element);
    hurt.getAtFinish().add((_animation: any) => {
      this.rule.check('took_hit');
    });
    this.receiver.animate(hurt);
    this.receiver.getFighter().takeDamage(this.damage);
    if (this.atContact) {
      this.atContact();
    }
  }
  finishMe(_clip: any) {
    this.rule.check('made_hit');
    this.finish(null);
  }
  finishOther(_animation: any) {
    this.rule.check('took_hit');
  }
  forceKill(): boolean {
    return true;
  }
}
bindMethods(HitAnimation);
