// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { DungeonState } from '@/game/view/screens/main_game/states/DungeonState';
import { Signal } from '@/game/cb/signals/Signal';

export class BossDungeonState extends DungeonState {
  _onToOutro = new Signal();
  constructor(text, gameView, callback = null, callback2 = null) {
          super(text,gameView,callback,callback2);
      }
  get onToOutro() {
         return this._onToOutro;
      }
}
bindMethods(BossDungeonState);
