// @ts-nocheck
import { __DEFER, bindMethods } from '@/flash/as3';
import { FighterAnimation } from '@/game/view/figthers/animations/FighterAnimation';
import { main } from '@/game/main';
import { GameSounds } from '@/game/sound/GameSounds';

export class JoyAnimation extends FighterAnimation {
  constructor() {super(__DEFER); 
          this.__init_FighterAnimation("win");
      }
  make(fighterView) {
         main.soundManager.playFx(GameSounds.DUNGEON_COMPLETED);
         super.make(fighterView);
      }
}
bindMethods(JoyAnimation);
