import { MovieClip, as3as, bindMethods, int } from '@/flash/as3';
import { app } from '@/game/app';
import type { Damage } from '@/game/main_game/dungeon/Damage';

/** The pop-up clips of a hit (moved here from Damage: the game logic does not create views). */
export class DamageFeedback {
  /** over the attacker: critical hit, element bonus */
  static hitter(damage: Damage): MovieClip[] {
    const list = [];
    if (damage.critical) {
      const clip = as3as(app.swfLoader.getObject('assets.criticalHit'), MovieClip);
      clip.number_heathl_parts_blocked.title.title.text = app.locale.get('critical_bonus');
      list.push(clip);
    }
    if (damage.doesHeHit() && damage.elementBonus && damage.elementBonus.value > 1) {
      const clip = DamageFeedback.elementClip(damage);
      clip.number_heathl_parts_blocked.title.title.text = app.locale.get('element_bonus', [
        int(damage.elementBonus.value * 100),
      ]);
      list.push(clip);
    }
    return list;
  }
  /** over the defender: evaded, or resisted the element */
  static defender(damage: Damage): MovieClip[] {
    const list = [];
    if (!damage.doesHeHit()) {
      const clip = as3as(app.swfLoader.getObject('assets.blocked'), MovieClip);
      clip.number_heathl_parts_blocked.title.title.text = app.locale.get('evade_bonus');
      list.push(clip);
    } else if (damage.elementBonus && damage.elementBonus.value < 1) {
      // the defender resisted the attacker's element (the original game prepared this clip but never showed it)
      const clip = DamageFeedback.elementClip(damage);
      clip.number_heathl_parts_blocked.title.title.text = app.locale.get('element_bonus', [
        int((2 - damage.elementBonus.value) * 100),
      ]);
      list.push(clip);
    }
    return list;
  }
  private static elementClip(damage: Damage): any {
    if (damage.elementBonus.element.isOfFire) {
      return as3as(app.swfLoader.getObject('assets.elementBonus_fire'), MovieClip);
    }
    if (damage.elementBonus.element.isOfIce) {
      return as3as(app.swfLoader.getObject('assets.elementBonus_ice'), MovieClip);
    }
    return null;
  }
}
bindMethods(DamageFeedback);
