import { FighterSoundManager } from '@/game/sound/FighterSoundManager';
import { GameSounds } from '@/game/sound/GameSounds';

/** The boss's sounds (a random hurt sound each time). */
export class BossSoundManager extends FighterSoundManager {
  constructor() {
    super('', GameSounds.BOSS_ATTACK, GameSounds.BOSS_LOSE, '', GameSounds.SHIELD_BLOCK);
  }
  playHurt() {
    this.hurt = GameSounds.BOSS_HURT;
    super.playHurt();
  }
}
