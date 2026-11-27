import { bindMethods } from '@/flash/as3';
import { FighterSoundManager } from '@/game/sound/FighterSoundManager';
import { GameSounds } from '@/game/sound/GameSounds';
import type { Enemy } from '@/game/main_game/character/Enemy';

/** Enemy sounds by kind (1 / 2) and element; hurt and die sounds are picked at random each time. */
export class EnemySoundManager extends FighterSoundManager {
  private hurtFunction: () => string = null;
  private dieFunction: () => string = null;

  constructor(enemy: Enemy) {
    const type = enemy.getType();
    const element = enemy.getElement();
    let attack: string = null;
    let block: string = null;
    if (type == '1') {
      if (element.isOfFire) {
        attack = GameSounds.FIRE_ATTACK;
        block = GameSounds.SHIELD_BLOCK_FIRE;
      } else if (element.isOfIce) {
        attack = GameSounds.ICE_ATTACK;
        block = GameSounds.SHIELD_BLOCK_ICE;
      } else {
        attack = GameSounds.SWORD_ATTACK;
        block = GameSounds.SHIELD_BLOCK;
      }
    } else if (type == '2') {
      if (element.isOfFire) {
        attack = GameSounds.ENEMY2_ATTACK_FIRE;
        block = GameSounds.SHIELD_BLOCK_FIRE;
      } else if (element.isOfIce) {
        attack = GameSounds.ENEMY2_ATTACK_ICE;
        block = GameSounds.SHIELD_BLOCK_ICE;
      } else {
        attack = GameSounds.ENEMY2_ATTACK;
        block = GameSounds.SHIELD_BLOCK;
      }
    }
    super('', attack, '', '', block);
    if (type == '1') {
      this.hurtFunction = () => GameSounds.ENEMY1_HURT;
      this.dieFunction = () => GameSounds.ENEMY1_LOSE;
    } else if (type == '2') {
      this.hurtFunction = () => GameSounds.ENEMY2_HURT;
      this.dieFunction = () => GameSounds.ENEMY2_LOSE;
    }
  }
  playHurt() {
    this.hurt = this.hurtFunction();
    super.playHurt();
  }
  playDie() {
    this.die = this.dieFunction();
    super.playDie();
  }
}
bindMethods(EnemySoundManager);
