// @ts-nocheck
import { __DEFER, bindMethods } from '@/flash/as3';
import { main } from '@/game/main';

export class FighterSoundManager {
  declare hurt: any;
  declare attack: any;
  declare critical: any;
  declare die: any;
  declare block: any;
  declare lastSound: any;
  constructor(...__a) { if (__a[0] !== __DEFER) this.__init_FighterSoundManager(...__a); }
  __init_FighterSoundManager(hurt, attack, die, critical, block) {
         
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
         if(this.lastSound != null)
         {
            if(main.soundManager.isPlaying(this.lastSound))
            {
               main.soundManager.pauseSound(this.lastSound);
            }
            else
            {
               this.lastSound = null;
            }
         }
      }
  resume() {
         if(this.lastSound != null)
         {
            main.soundManager.resumeSound(this.lastSound);
         }
      }
}
FighterSoundManager.prototype.hurt = null;
FighterSoundManager.prototype.attack = null;
FighterSoundManager.prototype.critical = null;
FighterSoundManager.prototype.die = null;
FighterSoundManager.prototype.block = null;
FighterSoundManager.prototype.lastSound = null;
bindMethods(FighterSoundManager);
