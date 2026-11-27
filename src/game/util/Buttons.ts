import { as3values, bindMethods } from '@/flash/as3';
import { Log } from '@/game/cb/logger/Log';
import { Util } from '@/game/util/Util';
import type { Sprite } from '@/flash/as3';

export class Buttons {
  /** enables / disables the buttons at these paths ("a.b.c") of container (missing ones are logged) */
  static setButtons(container: Sprite, paths: string[], on: boolean) {
    for (const path of as3values(paths)) {
      try {
        const button = Util.getSprite(container, path);
        button.buttonMode = on;
        button.mouseEnabled = on;
      } catch (e) {
        Log.getLogger('debug').log(e.getStackTrace());
      }
    }
  }
}
bindMethods(Buttons);
