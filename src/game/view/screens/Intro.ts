// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { ComicWindow } from '@/game/view/screens/ComicWindow';
import { main } from '@/game/main';
import { GameSounds } from '@/game/sound/GameSounds';

export class Intro extends ComicWindow {
  constructor() {
          super(main.swfLoader.getClass("assets.Intro"),4);
      }
  initializeText() { const __self = this;
         __self.bg.box_1.title.title.text = main.locale.get("intro_01");
         __self.bg.box_2.title.title.text = main.locale.get("intro_02");
         __self.bg.box_3.title.title.text = main.locale.get("intro_03");
         __self.bg.box_4.title.title.text = main.locale.get("intro_04");
         __self.bg.box_6.title.title.text = main.locale.get("intro_06");
         __self.bg.box_7.title.title.text = main.locale.get("intro_07");
      }
  get music() {
         return GameSounds.INTRO_MUSIC;
      }
}
bindMethods(Intro);
