import { bindMethods, int } from '@/flash/as3';
import { XpCalculator } from '@/game/main_game/dungeon/XpCalculator';
import type { IXpCalculator } from '@/game/main_game/dungeon/IXpCalculator';
import type { Damage } from '@/game/main_game/dungeon/Damage';
import type { Game } from '@/game/main_game/Game';
import type { Enemy } from '@/game/main_game/character/Enemy';
import type { Jinn } from '@/game/main_game/character/Jinn';
import type { Level } from '@/game/main_game/map/Level';
import type { MixResult } from '@/game/main_game/mixer/MixResult';

/** Counts mixes and critical hits during a dungeon run, and gives the experience earned at the end. */
export class DungeonStats {
  /** how experience is computed (XpCalculator, or the XpBonus of the day) */
  static xpCalculator: IXpCalculator = new XpCalculator();
  /** enemies beaten (set at the end) */
  private defeated: any[] = null;
  private mixesDone = 0;
  private criticalHits = 0;
  private theLevel: Level;
  private active = false;
  private game: Game;

  constructor(level: Level, game: Game) {
    this.theLevel = level;
    this.game = game;
  }
  start() {
    this.active = true;
    this.game.getMixer().onMixEnd.add(this.onMix);
    this.game.getJinn().onHit.add(this.onHit);
  }
  get level(): Level {
    return this.theLevel;
  }
  onMix(_mixResult: MixResult) {
    this.mixesDone = int(this.mixesDone + 1);
  }
  onHit(_jinn: Jinn, _enemy: Enemy, damage: Damage, _done: Function) {
    if (damage.critical) {
      this.criticalHits = int(this.criticalHits + 1);
    }
  }
  end(defeated: any[]) {
    this.defeated = defeated;
    this.deactivate();
  }
  getCombatExperience(): number {
    return Number(DungeonStats.xpCalculator.getXp(this.defeated));
  }
  getMixExperience(): number {
    return Number(DungeonStats.xpCalculator.getMixXp(this.mixesDone, this.game.getJinn()));
  }
  getCriticalExperience(): number {
    return Number(DungeonStats.xpCalculator.getCriticalXp(this.criticalHits, this.game.getJinn()));
  }
  getDungeonExperience(): number {
    return Number(this.getCombatExperience() + this.getCriticalExperience() + this.getMixExperience());
  }
  deactivate() {
    if (this.active) {
      this.game.getMixer().onMixEnd.remove(this.onMix);
      this.game.getJinn().onHit.remove(this.onHit);
      this.active = false;
    }
  }
  clear() {
    this.deactivate();
  }
}
bindMethods(DungeonStats, ['start', 'onMix', 'onHit', 'end', 'deactivate', 'clear']);
