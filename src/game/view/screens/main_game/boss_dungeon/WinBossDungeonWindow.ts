import { bindMethods } from '@/flash/as3';
import { WinWindow } from '@/game/view/screens/main_game/dungeon/WinWindow';
import type { DungeonStats } from '@/game/main_game/dungeon/DungeonStats';
import type { Loot } from '@/game/main_game/dungeon/Loot';

export class WinBossDungeonWindow extends WinWindow {
  declare _showMapAndReplay: boolean;
  constructor(loot: Loot, dungeonStats: DungeonStats, showMapAndReplay: boolean, callback: Function = null) {
    super(loot, dungeonStats, callback);
    this._showMapAndReplay = showMapAndReplay;
  }
  enter(callback: Function = null) {
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
