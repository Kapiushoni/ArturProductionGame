// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { WinWindow } from '@/game/view/screens/main_game/dungeon/WinWindow';

export class WinBossDungeonWindow extends WinWindow {
  declare _showMapAndReplay: any;
  constructor(loot, dungeonStats, showMapAndReplay, callback = null) {
          super(loot,dungeonStats,callback);
         this._showMapAndReplay = showMapAndReplay;
      }
  enter(callback = null) { const __self = this;
         super.enter(callback);
         if(!this._showMapAndReplay)
         {
            __self.bg.removeChild(__self.bg.replay);
            __self.bg.removeChild(__self.bg.level_select);
         }
      }
}
WinBossDungeonWindow.prototype._showMapAndReplay = false;
bindMethods(WinBossDungeonWindow);
