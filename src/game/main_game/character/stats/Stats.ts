// @ts-nocheck
import { Dictionary, as3values, bindMethods, int, uint } from '@/flash/as3';
import { Signal } from '@/game/cb/signals/Signal';
import { Stat } from '@/game/main_game/character/stats/Stat';
import { StatsEffectGuardian } from '@/game/main_game/character/stats/StatsEffectGuardian';
import { StatType } from '@/game/main_game/character/stats/StatType';

export class Stats {
  declare levelingStrat: any;
  declare stats: any;
  declare fighter: any;
  declare guardian: any;
  declare onChange: any;
  constructor(characterConfigData, fighter, levelingStrat) {
         
         this.onChange = new Signal();
         this.levelingStrat = levelingStrat;
         this.fighter = fighter;
         this.guardian = new StatsEffectGuardian(this);
         this.stats = new Dictionary();
         this.parseInitialStats(characterConfigData);
      }
  parseInitialStats(characterConfigData) {
         this.stats.set(StatType.ATTACK, new Stat(StatType.ATTACK,characterConfigData.baseAttack));
         this.stats.set(StatType.DEFENSE, new Stat(StatType.DEFENSE,characterConfigData.baseDefense));
         this.stats.set(StatType.LUCK, new Stat(StatType.LUCK,characterConfigData.baseLuck));
         this.stats.set(StatType.BASE_ATTACK, new Stat(StatType.BASE_ATTACK,characterConfigData.baseAttack));
         this.stats.set(StatType.BASE_DEFENSE, new Stat(StatType.BASE_DEFENSE,characterConfigData.baseDefense));
         this.stats.set(StatType.BASE_LUCK, new Stat(StatType.BASE_LUCK,characterConfigData.baseLuck));
         this.stats.set(StatType.BASE_HEALTH, new Stat(StatType.BASE_HEALTH,characterConfigData.baseHP));
      }
  getEffectGuardian() {
         return this.guardian;
      }
  getLevel() {
         throw new Error("Must implement this method");
      }
  getStat(num) { num = int(num);
         return this.stats.get(num);
      }
  downHP(num) { num = uint(num);
         this.stats.get(StatType.HEALTH).modifyValue(-num);
         this.onChange.emit();
      }
  addXP(num) { num = uint(num);
         this.stats.get(StatType.EXPERIENCE).modifyValue(num);
         this.onChange.emit();
      }
  refillHealth() {
         this.stats.get(StatType.HEALTH).fill(100);
         this.onChange.emit();
      }
  getDefense() {
         return Number(this.getStat(StatType.DEFENSE).getValue());
      }
  getAttack() {
         return Number(this.getStat(StatType.ATTACK).getValue());
      }
  getLuck() {
         return Number(this.getStat(StatType.LUCK).getValue());
      }
  clear() {
         var stat = null;
         this.fighter = null;
         this.guardian.clear();
         this.onChange.clear();
         for (stat of as3values(this.stats))
         {
            stat.clear();
         }
      }
  isDead() {
         return this.getStat(StatType.HEALTH).getValue() == 0;
      }
  leveling(num) { num = uint(num);
         this.levelingStrat.level(num,this);
      }
  loadData() {
      }
}
Stats.prototype.levelingStrat = null;
Stats.prototype.stats = null;
Stats.prototype.fighter = null;
Stats.prototype.guardian = null;
Stats.prototype.onChange = null;
bindMethods(Stats);
