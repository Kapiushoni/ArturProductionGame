import { MovieClip, as3as, bindMethods } from '@/flash/as3';
import { RemoveFromParent } from '@/game/cb/actions/RemoveFromParent';
import { EndAnimation } from '@/game/cb/conditions/EndAnimation';
import { SmartMC } from '@/game/cb/display/SmartMC';
import { app } from '@/game/app';
import { GameSounds } from '@/game/sound/GameSounds';

export class LevelUp {
  mc: MovieClip = null;
  constructor() {
    this.mc = as3as(app.swfLoader.getObject('assets.LevelUp'), MovieClip);
    app.tutorialHolder.addChild(this.mc);
    this.mc.gotoAndPlay(1);
    app.soundManager.playFx(GameSounds.LEVEL_UP);
    new SmartMC(this.mc).trigger(new EndAnimation(), new RemoveFromParent());
  }
}
bindMethods(LevelUp);
