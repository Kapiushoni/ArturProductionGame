// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { TransitionWindow } from '@/game/view/screens/main_game/TransitionWindow';
import { main } from '@/game/main';

export class TransitionWindowJakeLess extends TransitionWindow {
  constructor(list, callback, callback2 = null) {
          super(list,callback,callback2);
      }
  get assetClass() {
         return main.swfLoader.getClass("assets.loadingJacky");
      }
}
bindMethods(TransitionWindowJakeLess);
