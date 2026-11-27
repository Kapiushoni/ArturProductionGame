import { DungeonState } from '@/game/view/screens/main_game/states/DungeonState';
import { Signal } from '@/game/cb/signals/Signal';
import type { GameView } from '@/game/view/screens/main_game/GameView';

export class BossDungeonState extends DungeonState {
  _onToOutro = new Signal();
  constructor(text: string, gameView: GameView, callback: Function = null, callback2: Function = null) {
    super(text, gameView, callback, callback2);
  }
  get onToOutro() {
    return this._onToOutro;
  }
}
