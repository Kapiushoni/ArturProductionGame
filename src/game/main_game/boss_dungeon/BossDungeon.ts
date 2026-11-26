// @ts-nocheck
import { as3as, bindMethods, uint } from '@/flash/as3';
import { Dungeon } from '@/game/main_game/dungeon/Dungeon';
import { Boss } from '@/game/main_game/boss_dungeon/Boss';
import { BossFight } from '@/game/main_game/boss_dungeon/BossFight';
import { CharacterFactory } from '@/game/main_game/character/CharacterFactory';

export class BossDungeon extends Dungeon {
  static readonly idBossLevel = "25";
  constructor(level, dungeonConfigData, probabilisticSet) {
          super(level,dungeonConfigData,probabilisticSet);
      }
  createFight(enemy, flag) {
         return new BossFight(as3as(enemy, Boss));
      }
  createEnemy(text, num) { num = uint(num);
         return CharacterFactory.getInstance().getBoss(num);
      }
}
bindMethods(BossDungeon);
