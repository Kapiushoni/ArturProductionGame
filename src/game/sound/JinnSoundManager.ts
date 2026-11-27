import { bindMethods } from '@/flash/as3';
import { FighterSoundManager } from '@/game/sound/FighterSoundManager';
import { main } from '@/game/main';
import { GameSounds } from '@/game/sound/GameSounds';
import type { Jinn } from '@/game/main_game/character/Jinn';

/** The jinn's sounds depend on the equipped weapon and shield. */
export class JinnSoundManager extends FighterSoundManager {
  constructor(jinn: Jinn) {
    const weapon = jinn.gear.weapon.getContent();
    let attack: string;
    if (weapon == null) {
      attack = GameSounds.FIST_ATTACK;
    } else if (weapon.getElement().isOfFire) {
      attack = GameSounds.FIRE_ATTACK;
    } else if (weapon.getElement().isOfIce) {
      attack = GameSounds.ICE_ATTACK;
    } else if (weapon.id == 'LegendarySword') {
      attack = GameSounds.SORCERER_ATTACK;
    } else if (weapon.id == 'MarcelineBass') {
      attack = GameSounds.AX_ATTACK;
    } else {
      attack = GameSounds.SWORD_ATTACK;
    }
    const shield = jinn.gear.shield.getContent();
    let block: string;
    let critical = GameSounds.CRITICAL_SHIELD;
    if (shield == null) {
      block = GameSounds.FIST_BLOCK;
      critical = GameSounds.CRITICAL;
    } else if (shield.getElement().isOfFire) {
      block = GameSounds.SHIELD_BLOCK_FIRE;
    } else if (shield.getElement().isOfIce) {
      block = GameSounds.SHIELD_BLOCK_ICE;
    } else {
      block = GameSounds.SHIELD_BLOCK;
    }
    super('', attack, GameSounds.FINN_LOSE, critical, block);
  }
  /** a random hurt sound each time */
  playHurt() {
    this.hurt = GameSounds.FINN_HURT;
    super.playHurt();
  }
  playDie() {
    main.soundManager.stopMusic();
    super.playDie();
  }
}
bindMethods(JinnSoundManager);
