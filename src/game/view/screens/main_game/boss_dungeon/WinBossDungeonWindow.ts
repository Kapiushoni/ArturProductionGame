import { bindMethods } from '@/flash/as3';
import { WinWindow } from '@/game/view/screens/main_game/dungeon/WinWindow';

export class WinBossDungeonWindow extends WinWindow {
  declare _showMapAndReplay: any;
  constructor(loot, dungeonStats, showMapAndReplay, callback = null) {
    super(loot, dungeonStats, callback);
    this._showMapAndReplay = showMapAndReplay;
  }
  enter(callback = null) {
    super.enter(callback);
    if (!this._showMapAndReplay) {
      this.bg.removeChild(this.bg.replay);
      this.bg.removeChild(this.bg.level_select);
    }
  }
}
// Defaults on the prototype, not field initializers: the WinWindow constructor calls overridden methods that may set it,
// and an initializer (run after the base constructor) would overwrite them.
WinBossDungeonWindow.prototype._showMapAndReplay = false;
bindMethods(WinBossDungeonWindow);
