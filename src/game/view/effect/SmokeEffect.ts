// @ts-nocheck
import { MovieClip, as3as, bindMethods } from '@/flash/as3';
import { Effect } from '@/game/view/effect/Effect';
import { Random } from '@/game/cb/utils/Random';
import { main } from '@/game/main';
import { GameSounds } from '@/game/sound/GameSounds';

export class SmokeEffect extends Effect {
  constructor() {
         var clip = as3as(main.swfLoader.getObject("assets.Smoke"), MovieClip);
         clip.rotation = Random.nextInt(360);
          super(clip);
      }
  playOn(displayObjectContainer, displayObjectContainer2 = null) {
         super.playOn(displayObjectContainer,displayObjectContainer2);
         main.soundManager.playFx(GameSounds.SMOKE);
      }
}
bindMethods(SmokeEffect);
