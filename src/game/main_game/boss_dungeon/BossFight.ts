import { bindMethods } from '@/flash/as3';
import { Fight } from '@/game/main_game/dungeon/Fight';
import type { Boss } from '@/game/main_game/boss_dungeon/Boss';
import type { Jinn } from '@/game/main_game/character/Jinn';

/** The fight against the boss: always the first fight of its dungeon. */
export class BossFight extends Fight {
  constructor(jinn: Jinn, boss: Boss) {
    super(jinn, boss, true);
  }
}
bindMethods(BossFight);
