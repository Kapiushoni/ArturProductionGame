import { MovieClip, as3as, bindMethods } from '@/flash/as3';
import { Effect } from '@/game/view/effect/Effect';
import { Random } from '@/game/cb/utils/Random';
import { app } from '@/game/app';
import { GameSounds } from '@/game/sound/GameSounds';

export class SmokeEffect extends Effect {
  constructor() {
    const clip = as3as(app.swfLoader.getObject('assets.Smoke'), MovieClip);
    clip.rotation = Random.nextInt(360);
    super(clip);
  }
  playOn(displayObjectContainer: any, displayObjectContainer2: any = null) {
    super.playOn(displayObjectContainer, displayObjectContainer2);
    app.soundManager.playFx(GameSounds.SMOKE);
  }
}
bindMethods(SmokeEffect);
