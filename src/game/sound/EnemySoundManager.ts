// @ts-nocheck
import { __DEFER, bindMethods } from '@/flash/as3';
import { FighterSoundManager } from '@/game/sound/FighterSoundManager';
import { GameSounds } from '@/game/sound/GameSounds';

export class EnemySoundManager extends FighterSoundManager {
  declare hurtFunction: any;
  declare dieFunction: any;
  constructor(enemy2) {super(__DEFER); 
         var hurt = null;
         var attack = null;
         var die = null;
         var critical = null;
         var block = null;
         var evade = null;
         var enemy = enemy2;
         var type = enemy.getType();
         var element = enemy.getElement();
         if(type == "1")
         {
            this.hurtFunction = function()
            {
               return GameSounds.ENEMY1_HURT;
            };
            this.dieFunction = function()
            {
               return GameSounds.ENEMY1_LOSE;
            };
            if(element.isOfFire)
            {
               attack = GameSounds.FIRE_ATTACK;
               evade = GameSounds.SHIELD_BLOCK_FIRE;
            }
            else if(element.isOfIce)
            {
               attack = GameSounds.ICE_ATTACK;
               evade = GameSounds.SHIELD_BLOCK_ICE;
            }
            else
            {
               attack = GameSounds.SWORD_ATTACK;
               evade = GameSounds.SHIELD_BLOCK;
            }
         }
         else if(type == "2")
         {
            this.hurtFunction = function()
            {
               return GameSounds.ENEMY2_HURT;
            };
            this.dieFunction = function()
            {
               return GameSounds.ENEMY2_LOSE;
            };
            if(element.isOfFire)
            {
               attack = GameSounds.ENEMY2_ATTACK_FIRE;
               evade = GameSounds.SHIELD_BLOCK_FIRE;
            }
            else if(element.isOfIce)
            {
               attack = GameSounds.ENEMY2_ATTACK_ICE;
               evade = GameSounds.SHIELD_BLOCK_ICE;
            }
            else
            {
               attack = GameSounds.ENEMY2_ATTACK;
               evade = GameSounds.SHIELD_BLOCK;
            }
         }
          this.__init_FighterSoundManager("",attack,"","",evade);
      }
  playHurt() { const __self = this;
         __self.hurt = this.hurtFunction();
         super.playHurt();
      }
  playDie() { const __self = this;
         __self.die = this.dieFunction();
         super.playDie();
      }
}
EnemySoundManager.prototype.hurtFunction = null;
EnemySoundManager.prototype.dieFunction = null;
bindMethods(EnemySoundManager);
