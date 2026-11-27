import { bindMethods } from '@/flash/as3';
import { TransitionWindow } from '@/game/view/screens/main_game/TransitionWindow';
import { main } from '@/game/main';

export class TransitionWindowJakeLess extends TransitionWindow {
  constructor(list: any[], callback: Function, callback2: Function = null) {
    super(list, callback, callback2);
  }
  get assetClass() {
    return main.swfLoader.getClass('assets.loadingJacky');
  }
}
bindMethods(TransitionWindowJakeLess);
