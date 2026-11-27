import { bindMethods, uint } from '@/flash/as3';
import { StatType } from '@/game/main_game/character/stats/StatType';
import type { ElementBonus } from '@/game/main_game/dungeon/ElementBonus';
import type { Fighter } from '@/game/main_game/character/Fighter';
import type { Stats } from '@/game/main_game/character/stats/Stats';

/** Result of one hit (see DamageCalculator). Its pop-up clips: see DamageFeedback (view). */
export class Damage {
  hp_damage: number;
  hit: boolean;
  critical: boolean;
  target: Fighter; // Fighter
  elementBonus: ElementBonus | null;

  constructor(hp_damage: number, hit: boolean, critical: boolean, target: Fighter, elementBonus: ElementBonus = null) {
    this.hp_damage = uint(hp_damage);
    this.hit = hit;
    this.critical = critical;
    this.target = target;
    this.elementBonus = elementBonus;
  }
  apply(stats: Stats) {
    stats.downHP(this.hp_damage);
  }
  doesHeDie(): boolean {
    return this.doesHeHit() && this.target.stats.getStat(StatType.HEALTH).getValue() <= this.hp_damage;
  }
  doesHeHit(): boolean {
    return this.hit;
  }
  stringValue(): string {
    return this.hp_damage.toString();
  }
}
bindMethods(Damage);
