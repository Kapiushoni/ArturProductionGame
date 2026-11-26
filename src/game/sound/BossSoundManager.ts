// @ts-nocheck
import { __DEFER, bindMethods } from '@/flash/as3';
import { FighterSoundManager } from '@/game/sound/FighterSoundManager';
import { GameSounds } from '@/game/sound/GameSounds';

export class BossSoundManager extends FighterSoundManager {
  declare boss: any;
  constructor(boss) {super(__DEFER); 
         this.boss = boss;
          this.__init_FighterSoundManager("",GameSounds.BOSS_ATTACK,GameSounds.BOSS_LOSE,"",GameSounds.SHIELD_BLOCK);
      }
  playHurt() { const __self = this;
         __self.hurt = GameSounds.BOSS_HURT;
         super.playHurt();
      }
}
BossSoundManager.prototype.boss = null;
bindMethods(BossSoundManager);
