import { MovieClip, as3as, bindMethods } from '@/flash/as3';
import { RemoveFromParent } from '@/game/cb/actions/RemoveFromParent';
import { EndAnimation } from '@/game/cb/conditions/EndAnimation';
import { SmartMC } from '@/game/cb/display/SmartMC';
import { main } from '@/game/main';
import { GameSounds } from '@/game/sound/GameSounds';

export class LevelUp {
  mc: any = null;
  constructor() {
    this.mc = as3as(main.swfLoader.getObject('assets.LevelUp'), MovieClip);
    main.tutorialHolder.addChild(this.mc);
    this.mc.gotoAndPlay(1);
    main.soundManager.playFx(GameSounds.LEVEL_UP);
    new SmartMC(this.mc).trigger(new EndAnimation(), new RemoveFromParent());
  }
}
bindMethods(LevelUp);
