import { TransitionWindow } from '@/game/view/screens/main_game/TransitionWindow';
import { app } from '@/game/app';

export class TransitionWindowJakeLess extends TransitionWindow {
  constructor(list: any[], callback: Function, callback2: Function = null) {
    super(list, callback, callback2);
  }
  get assetClass() {
    return app.swfLoader.getClass('assets.loadingJacky');
  }
}
