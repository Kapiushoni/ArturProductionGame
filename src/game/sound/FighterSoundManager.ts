import { bindMethods } from '@/flash/as3';
import { app } from '@/game/app';

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
    app.soundManager.playFx(this.hurt);
  }
  playBlock() {
    app.soundManager.playFx(this.block);
  }
  playDie() {
    app.soundManager.playFx(this.die);
  }
  playAttack() {
    app.soundManager.playFx(this.attack);
  }
  playCritical() {
    app.soundManager.playFx(this.critical);
  }
  pause() {
    if (this.lastSound != null) {
      if (app.soundManager.isPlaying(this.lastSound)) {
        app.soundManager.pauseSound(this.lastSound);
      } else {
        this.lastSound = null;
      }
    }
  }
  resume() {
    if (this.lastSound != null) {
      app.soundManager.resumeSound(this.lastSound);
    }
  }
}
bindMethods(FighterSoundManager);
