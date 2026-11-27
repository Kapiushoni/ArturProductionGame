import { bindMethods } from '@/flash/as3';
import { main } from '@/game/main';

/** The sounds of a fighter (names of sounds, '' for none). */
export class FighterSoundManager {
  protected hurt: string;
  protected attack: string;
  protected critical: string;
  protected die: string;
  protected block: string;
  private lastSound: string = null;

  constructor(hurt: string, attack: string, die: string, critical: string, block: string) {
    this.hurt = hurt;
    this.attack = attack;
    this.die = die;
    this.critical = critical;
    this.block = block;
  }
  playHurt() {
    main.soundManager.playFx(this.hurt);
  }
  playBlock() {
    main.soundManager.playFx(this.block);
  }
  playDie() {
    main.soundManager.playFx(this.die);
  }
  playAttack() {
    main.soundManager.playFx(this.attack);
  }
  playCritical() {
    main.soundManager.playFx(this.critical);
  }
  pause() {
    if (this.lastSound != null) {
      if (main.soundManager.isPlaying(this.lastSound)) {
        main.soundManager.pauseSound(this.lastSound);
      } else {
        this.lastSound = null;
      }
    }
  }
  resume() {
    if (this.lastSound != null) {
      main.soundManager.resumeSound(this.lastSound);
    }
  }
}
bindMethods(FighterSoundManager);
