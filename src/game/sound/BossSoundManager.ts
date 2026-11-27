import { bindMethods } from '@/flash/as3';
import { FighterSoundManager } from '@/game/sound/FighterSoundManager';
import { GameSounds } from '@/game/sound/GameSounds';
import type { Boss } from '@/game/main_game/boss_dungeon/Boss';

/** The boss's sounds (a random hurt sound each time). */
export class BossSoundManager extends FighterSoundManager {
  private boss: Boss;

  constructor(boss: Boss) {
    super('', GameSounds.BOSS_ATTACK, GameSounds.BOSS_LOSE, '', GameSounds.SHIELD_BLOCK);
    this.boss = boss;
  }
  playHurt() {
    this.hurt = GameSounds.BOSS_HURT;
    super.playHurt();
  }
}
bindMethods(BossSoundManager);
