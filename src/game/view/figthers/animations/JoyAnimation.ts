import { bindMethods } from '@/flash/as3';
import { FighterAnimation } from '@/game/view/figthers/animations/FighterAnimation';
import { app } from '@/game/app';
import { GameSounds } from '@/game/sound/GameSounds';
import type { FighterView } from '@/game/view/figthers/FighterView';

/** Celebrating a cleared dungeon. */
export class JoyAnimation extends FighterAnimation {
  constructor() {
    super('win');
  }
  make(fighterView: FighterView) {
    app.soundManager.playFx(GameSounds.DUNGEON_COMPLETED);
    super.make(fighterView);
  }
}
bindMethods(JoyAnimation);
