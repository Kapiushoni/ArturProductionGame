import { as3as, bindMethods, int } from '@/flash/as3';
import { services } from '@/game/services';
import { Enemy } from '@/game/main_game/character/Enemy';
import { Jinn } from '@/game/main_game/character/Jinn';
import { StatType } from '@/game/main_game/character/stats/StatType';
import { Damage } from '@/game/main_game/dungeon/Damage';
import { ElementBonus } from '@/game/main_game/dungeon/ElementBonus';
import { Element } from '@/game/main_game/element/Element';
import type { Fighter } from '@/game/main_game/character/Fighter';

/**
 * Damage of one hit, from the "Damage" section of config.di.
 * Math.random is used in this order: evade roll, critical roll (only for the jinn with a weapon), damage variance.
 */
export class DamageCalculator {
  static calculateDamage(attacker: Fighter, defender: Fighter): Damage {
    const config = services.config.get('Damage');
    const attackerLuck = Number(attacker.stats.getLuck());
    const defenderLuck = Number(defender.stats.getLuck());
    const variance = config['VariableAttackPercentage'].split(':'); // "minus:plus" in percent
    const minus = Number(variance[0]) / 100;
    const plus = Number(variance[1]) / 100;
    const criticalMultiplier = Number(config['CriticalMultiplier']);
    const evadeFactor = Number(config['EvadeFactor']);
    const criticalFactor = Number(config['CriticalFactor']);
    const minimumCritical = config['MinimumCritical'] / 100;
    const minimumEvade = config['MinimumEvade'] / 100;
    const luckCap = config['LuckCap'] / 100;

    // a luckier defender may evade
    let evadeChance = 0;
    if (attackerLuck < defenderLuck) {
      evadeChance = Math.max(minimumEvade, Math.min(luckCap, evadeFactor * (1 - attackerLuck / defenderLuck)));
    }
    const evaded = Math.random() < evadeChance;

    let multiplier = 1; // element multiplier ("<own>vs<other>_attack|_defence" in the config)
    let critical = false;
    let fireVsIce = false;
    let attackElement: Element = null; // the enemy's element, or the element of the jinn's weapon
    if (defender.isJinn()) {
      const shield = (as3as(defender, Jinn) as Jinn).gear.shield.getContent();
      const shieldType = shield != null ? shield.getElement().type : Element.NORMAL;
      attackElement = (as3as(attacker, Enemy) as Enemy).getElement();
      multiplier = Number(config[shieldType + 'vs' + attackElement.type + '_defence']);
      fireVsIce = DamageCalculator.isFireVsIce(shieldType, attackElement.type);
    } else if (attacker.isJinn()) {
      const enemyType = (as3as(defender, Enemy) as Enemy).getElement().type;
      const weapon = (as3as(attacker, Jinn) as Jinn).gear.weapon;
      let weaponType = Element.NORMAL;
      if (!weapon.isEmpty()) {
        attackElement = weapon.getContent().getElement();
        weaponType = attackElement.type;
        // a luckier jinn may hit critically
        let criticalChance = 0;
        if (attackerLuck > defenderLuck) {
          criticalChance = Math.max(
            minimumCritical,
            Math.min(luckCap, criticalFactor * (1 - defenderLuck / attackerLuck)),
          );
        }
        critical = Math.random() < criticalChance;
      }
      multiplier = Number(config[weaponType + 'vs' + enemyType + '_attack']);
      fireVsIce = DamageCalculator.isFireVsIce(weaponType, enemyType);
    }

    const attack = int(attacker.stats.getStat(StatType.ATTACK).getValue());
    const defense = int(defender.stats.getStat(StatType.DEFENSE).getValue());
    let damage = (attack - defense) * multiplier;
    damage = damage - damage * minus;
    damage = damage + damage * ((minus + plus) * Math.random());
    let hp = int(Math.max(1, Math.round(damage)));
    if (evaded) {
      hp = 0;
    } else if (critical) {
      hp = int(hp * criticalMultiplier);
    }
    const bonus = fireVsIce ? new ElementBonus(attackElement, multiplier) : null;
    return new Damage(hp, !evaded, critical, defender, bonus);
  }

  private static isFireVsIce(a: string, b: string): boolean {
    const pair = a + b;
    return pair == Element.FIRE + Element.ICE || pair == Element.ICE + Element.FIRE;
  }
}
bindMethods(DamageCalculator);
