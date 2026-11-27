import { bindMethods } from '@/flash/as3';
import { FighterAnimation } from '@/game/view/figthers/animations/FighterAnimation';
import { app } from '@/game/app';
import { GameSounds } from '@/game/sound/GameSounds';

/** Celebrating a cleared dungeon. */
export class JoyAnimation extends FighterAnimation {
  constructor() {
    super('win');
  }
  make(fighterView: any) {
    app.soundManager.playFx(GameSounds.DUNGEON_COMPLETED);
    super.make(fighterView);
  }
}
bindMethods(JoyAnimation);
