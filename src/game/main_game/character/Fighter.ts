import { bindMethods } from '@/flash/as3';
import { services } from '@/game/services';
import { Signal } from '@/game/cb/signals/Signal';
import type { CharacterConfigData } from '@/game/main_game/character/CharacterConfigData';
import type { Damage } from '@/game/main_game/dungeon/Damage';
import type { Stats } from '@/game/main_game/character/stats/Stats';
import type { IFight } from '@/game/main_game/dungeon/IFight';

/** A fighter (the jinn or an enemy). The view listens to onHit(self, target, damage, done) to play the attack. */
export class Fighter {
  onHit: Signal;
  stats: Stats; // Stats (JinnStats / EnemyStats)
  private name: string;
  private nameString: string;

  constructor(name: string, config: CharacterConfigData) {
    this.name = name;
    this.onHit = new Signal();
    this.nameString = config.nameString;
    this.stats = this.createStats(config);
  }
  isJinn(): boolean {
    return false;
  }
  createStats(_config: CharacterConfigData): Stats {
    throw new Error('must override this method');
  }
  getName(): string {
    return this.name;
  }
  prepareForFight(_fight: IFight) {}
  /** attacks: the view plays the animation and calls `done` */
  hit(target: Fighter, damage: Damage, done: () => void) {
    this.onHit.emit(this, target, damage, done);
  }
  takeDamage(damage: Damage) {
    damage.apply(this.stats);
  }
  clear() {
    this.onHit.clear();
    this.stats.clear();
  }
  getNameToShow(): string {
    return services.texts.get(this.nameString);
  }
}
bindMethods(Fighter);
