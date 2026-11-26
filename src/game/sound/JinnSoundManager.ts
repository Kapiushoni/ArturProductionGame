// @ts-nocheck
import { __DEFER, bindMethods } from '@/flash/as3';
import { FighterSoundManager } from '@/game/sound/FighterSoundManager';
import { main } from '@/game/main';
import { GameSounds } from '@/game/sound/GameSounds';

export class JinnSoundManager extends FighterSoundManager {
  constructor(jinn) {super(__DEFER); 
         var text = null;
         var text2 = null;
         var gear = jinn.gear;
         var content = gear.weapon.getContent();
         if(content == null)
         {
            text = GameSounds.FIST_ATTACK;
         }
         else if(content.getElement().isOfFire)
         {
            text = GameSounds.FIRE_ATTACK;
         }
         else if(content.getElement().isOfIce)
         {
            text = GameSounds.ICE_ATTACK;
         }
         else if(content.getID() == "LegendarySword")
         {
            text = GameSounds.SORCERER_ATTACK;
         }
         else if(content.getID() == "MarcelineBass")
         {
            text = GameSounds.AX_ATTACK;
         }
         else
         {
            text = GameSounds.SWORD_ATTACK;
         }
         var content2 = gear.shield.getContent();
         var CRITICAL = GameSounds.CRITICAL_SHIELD;
         if(content2 == null)
         {
            text2 = GameSounds.FIST_BLOCK;
            CRITICAL = GameSounds.CRITICAL;
         }
         else if(content2.getElement().isOfFire)
         {
            text2 = GameSounds.SHIELD_BLOCK_FIRE;
         }
         else if(content2.getElement().isOfIce)
         {
            text2 = GameSounds.SHIELD_BLOCK_ICE;
         }
         else
         {
            text2 = GameSounds.SHIELD_BLOCK;
         }
          this.__init_FighterSoundManager("",text,GameSounds.FINN_LOSE,CRITICAL,text2);
      }
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
