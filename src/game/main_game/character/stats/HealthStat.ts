import { bindMethods } from '@/flash/as3';
import { Stat } from '@/game/main_game/character/stats/Stat';

/** Health: stays between 0 and the max-health stat. */
export class HealthStat extends Stat {
  private maxHealth: Stat;

  constructor(type: number, maxHealth: Stat, value = 0) {
    super(type, value);
    this.maxHealth = maxHealth;
  }
  modifyValue(amount: number) {
    this.value = Math.max(0, Math.min(this.value + Number(amount), this.getUpperBound().getValue()));
  }
  /** changes the max health and heals to full */
  modifyUpperBound(amount: number) {
    this.maxHealth.modifyValue(Number(amount));
    this.fill(100);
  }
  /** heals by a share of the max health, rounded down */
  fill(percent = 100) {
    this.modifyValue(Math.floor((this.getUpperBound().getValue() * Number(percent)) / 100));
  }
  getUpperBound(): Stat {
    return this.maxHealth;
  }
}
bindMethods(HealthStat);
