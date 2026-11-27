import { as3as, bindMethods } from '@/flash/as3';
import { Dungeon } from '@/game/main_game/dungeon/Dungeon';
import { Boss } from '@/game/main_game/boss_dungeon/Boss';
import { BossFight } from '@/game/main_game/boss_dungeon/BossFight';
import { CharacterFactory } from '@/game/main_game/character/CharacterFactory';
import type { IFight } from '@/game/main_game/dungeon/IFight';

/** Dungeon 25: every enemy of its config is replaced by the boss, at that enemy's level. */
export class BossDungeon extends Dungeon {
  static readonly idBossLevel = Dungeon.BOSS_LEVEL_ID;

  createFight(enemy: any, _first: boolean): IFight {
    return new BossFight(this.game.getJinn(), as3as(enemy, Boss));
  }
  createEnemy(_name: string, level: number): Boss {
    return CharacterFactory.getInstance().getBoss(level);
  }
}
bindMethods(BossDungeon);
