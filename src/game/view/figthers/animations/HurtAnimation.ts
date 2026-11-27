import { bindMethods } from '@/flash/as3';
import { FighterAnimation } from '@/game/view/figthers/animations/FighterAnimation';
import type { Damage } from '@/game/main_game/dungeon/Damage';
import type { Element } from '@/game/main_game/element/Element';

/** Receiving a hit: dies, gets hurt or evades (with the attacker's element effect). */
export class HurtAnimation extends FighterAnimation {
  static readonly DIE = 'die';
  static readonly HURT = 'hurt';
  static readonly EVADE = 'evade';
  private damage: Damage;
  private element: Element;

  constructor(damage: Damage, element: Element) {
    let label: string;
    if (damage.doesHeDie()) {
      label = HurtAnimation.DIE;
    } else if (damage.doesHeHit()) {
      label = HurtAnimation.HURT;
    } else {
      label = HurtAnimation.EVADE;
    }
    super(label);
    this.damage = damage;
    this.element = element;
  }
  make(fighterView: any) {
    if (this.name == HurtAnimation.EVADE) {
      fighterView.fighterSoundManager.playBlock();
    } else if (this.name == HurtAnimation.HURT) {
      fighterView.fighterSoundManager.playHurt();
    } else if (this.name == HurtAnimation.DIE) {
      fighterView.fighterSoundManager.playDie();
    }
    super.make(fighterView);
    this.setEffect(fighterView.getMC(), this.element);
  }
  forceKill(): boolean {
    return true;
  }
  mustGoToIdle(): boolean {
    return this.name != 'die';
  }
}
bindMethods(HurtAnimation);
