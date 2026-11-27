import { Fighter } from '@/game/main_game/character/Fighter';
import { EnemyStats } from '@/game/main_game/character/stats/EnemyStats';
import type { CharacterConfigData } from '@/game/main_game/character/CharacterConfigData';
import type { Element } from '@/game/main_game/element/Element';

/** An enemy, levelled up to `level` on creation. */
export class Enemy extends Fighter {
  private element: Element;

  constructor(name: string, config: CharacterConfigData, level: number) {
    super(name, config);
    this.element = config.element;
    this.stats.leveling(Number(level));
  }
  createStats(config: CharacterConfigData): EnemyStats {
    return new EnemyStats(config, this);
  }
  getElement(): Element {
    return this.element;
  }
  /** the enemy kind, from its name ("enemyF1" -> "F") */
  getType(): string {
    return this.getName().charAt(5);
  }
}
