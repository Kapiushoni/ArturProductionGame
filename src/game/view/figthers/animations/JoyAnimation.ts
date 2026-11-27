import { bindMethods } from '@/flash/as3';
import { FighterAnimation } from '@/game/view/figthers/animations/FighterAnimation';
import { main } from '@/game/main';
import { GameSounds } from '@/game/sound/GameSounds';

/** Celebrating a cleared dungeon. */
export class JoyAnimation extends FighterAnimation {
  constructor() {
    super('win');
  }
  make(fighterView: any) {
    main.soundManager.playFx(GameSounds.DUNGEON_COMPLETED);
    super.make(fighterView);
  }
}
bindMethods(JoyAnimation);
