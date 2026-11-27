import { bindMethods, int } from '@/flash/as3';
import { Dungeon } from '@/game/main_game/dungeon/Dungeon';
import type { Damage } from '@/game/main_game/dungeon/Damage';
import type { Game } from '@/game/main_game/Game';

/** Counts mixes and critical hits during a dungeon run, and gives the experience earned at the end. */
export class DungeonStats {
  /** enemies beaten (set at the end) */
  private defeated: any[] = null;
  private mixesDone = 0;
  private criticalHits = 0;
  private theLevel: any;
  private active = false;
  private game: Game;

  constructor(level: any, game: Game) {
    this.theLevel = level;
    this.game = game;
  }
  start() {
    this.active = true;
    this.game.getMixer().onMixEnd.add(this.onMix);
    this.game.getJinn().onHit.add(this.onHit);
  }
  get level(): any {
    return this.theLevel;
  }
  onMix(_mixResult: any) {
    this.mixesDone = int(this.mixesDone + 1);
  }
  onHit(_jinn: any, _enemy: any, damage: Damage, _done: Function) {
    if (damage.critical) {
      this.criticalHits = int(this.criticalHits + 1);
    }
  }
  end(defeated: any[]) {
    this.defeated = defeated;
    this.deactivate();
  }
  getCombatExperience(): number {
    return Number(Dungeon.xpCalulator.getXp(this.defeated));
  }
  getMixExperience(): number {
    return Number(Dungeon.xpCalulator.getMixXp(this.mixesDone, this.game.getJinn()));
  }
  getCriticalExperience(): number {
    return Number(Dungeon.xpCalulator.getCriticalXp(this.criticalHits, this.game.getJinn()));
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
bindMethods(DungeonStats);
