import { Dictionary, as3values, bindMethods, int, uint } from '@/flash/as3';
import { Signal } from '@/game/cb/signals/Signal';
import { Stat } from '@/game/main_game/character/stats/Stat';
import { StatsEffectGuardian } from '@/game/main_game/character/stats/StatsEffectGuardian';
import { StatType } from '@/game/main_game/character/stats/StatType';
import type { CharacterConfigData } from '@/game/main_game/character/CharacterConfigData';
import type { HealthStat } from '@/game/main_game/character/stats/HealthStat';
import type { LevelingStragegy } from '@/game/main_game/character/stats/LevelingStragegy';

/** All stats of a fighter (StatType -> Stat). Subclasses add health and experience. */
export class Stats {
  protected levelingStrat: LevelingStragegy;
  protected stats: any; // Dictionary: StatType -> Stat
  protected fighter: any;
  protected guardian: StatsEffectGuardian;
  onChange: Signal;

  constructor(config: CharacterConfigData, fighter: any, levelingStrat: LevelingStragegy) {
    this.onChange = new Signal();
    this.levelingStrat = levelingStrat;
    this.fighter = fighter;
    this.guardian = new StatsEffectGuardian(this);
    this.stats = new Dictionary();
    this.parseInitialStats(config);
  }
  parseInitialStats(config: CharacterConfigData) {
    this.stats.set(StatType.ATTACK, new Stat(StatType.ATTACK, config.baseAttack));
    this.stats.set(StatType.DEFENSE, new Stat(StatType.DEFENSE, config.baseDefense));
    this.stats.set(StatType.LUCK, new Stat(StatType.LUCK, config.baseLuck));
    this.stats.set(StatType.BASE_ATTACK, new Stat(StatType.BASE_ATTACK, config.baseAttack));
    this.stats.set(StatType.BASE_DEFENSE, new Stat(StatType.BASE_DEFENSE, config.baseDefense));
    this.stats.set(StatType.BASE_LUCK, new Stat(StatType.BASE_LUCK, config.baseLuck));
    this.stats.set(StatType.BASE_HEALTH, new Stat(StatType.BASE_HEALTH, config.baseHP));
  }
  /** applies / removes the modifiers of equipped and consumed items */
  getEffectGuardian(): StatsEffectGuardian {
    return this.guardian;
  }
  getLevel(): number {
    throw new Error('Must implement this method');
  }
  getStat(type: number): any {
    return this.stats.get(int(type));
  }
  downHP(amount: number) {
    this.stats.get(StatType.HEALTH).modifyValue(-uint(amount));
    this.onChange.emit();
  }
  addXP(amount: number) {
    this.stats.get(StatType.EXPERIENCE).modifyValue(uint(amount));
    this.onChange.emit();
  }
  refillHealth() {
    (this.stats.get(StatType.HEALTH) as HealthStat).fill(100);
    this.onChange.emit();
  }
  getDefense(): number {
    return Number(this.getStat(StatType.DEFENSE).getValue());
  }
  getAttack(): number {
    return Number(this.getStat(StatType.ATTACK).getValue());
  }
  getLuck(): number {
    return Number(this.getStat(StatType.LUCK).getValue());
  }
  clear() {
    this.fighter = null;
    this.guardian.clear();
    this.onChange.clear();
    for (const stat of as3values(this.stats)) {
      stat.clear();
    }
  }
  isDead(): boolean {
    return this.getStat(StatType.HEALTH).getValue() == 0;
  }
  leveling(level: number) {
    this.levelingStrat.level(uint(level), this);
  }
  /** loads saved values (the jinn's experience) */
  loadData() {}
}
bindMethods(Stats);
