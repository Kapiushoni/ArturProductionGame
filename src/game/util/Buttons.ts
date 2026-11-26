// @ts-nocheck
import { as3values, bindMethods } from '@/flash/as3';
import { Log } from '@/game/cb/logger/Log';
import { Util } from '@/game/util/Util';

export class Buttons {
  constructor() {
         
      }
  static setButtons(sprite, list, flag) {
         var b = null;
         var doc = null;
         var container = sprite;
         var buttons = list;
         var on = flag;
         for (b of as3values(buttons))
         {
            try
            {
               doc = Util.getSprite(container,b);
               doc.buttonMode = on;
               doc.mouseEnabled = on;
            }
            catch(e)
            {
               Log.getLogger("debug").log(e.getStackTrace());
            }
         }
      }
}
bindMethods(Buttons);
