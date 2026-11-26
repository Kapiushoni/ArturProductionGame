// @ts-nocheck
import { __DEFER, bindMethods } from '@/flash/as3';
import { BasicPausableState } from '@/game/view/screens/main_game/states/BasicPausableState';
import { Signal } from '@/game/cb/signals/Signal';
import { main } from '@/game/main';
import { DungeonFactory } from '@/game/main_game/dungeon/DungeonFactory';

export class DungeonState extends BasicPausableState {
  declare dungeon_view: any;
  declare dungeon: any;
  declare mainView: any;
  declare next_dungeon: any;
  theOnToDungeon = new Signal();
  theOnToMap = new Signal();
  constructor(text, mainView, callback = null, callback2 = null) {super(__DEFER); 
         this.mainView = mainView;
          this.__init_BasicPausableState(text,callback,callback2);
      }
  get onToDungeon() {
         return this.theOnToDungeon;
      }
  get onToMap() {
         return this.theOnToMap;
      }
  get pauseHolder() {
         return this.mainView.pauseHolder;
      }
  enter() {
         main.game.goToDungeon(this.next_dungeon);
         this.dungeon = main.game.getDungeon();
         this.dungeon_view = DungeonFactory.getInstance().getViewFor(this);
         this.mainView.gameHolder["dungeonView"] = this.dungeon_view;
         this.mainView.gameHolder.addChild(this.dungeon_view);
         super.enter();
      }
  pause() {
         this.dungeon_view.pauseFight();
      }
  resume() {
         this.dungeon_view.resumeFight();
      }
  setNextDungeon(next_dungeon) {
         this.next_dungeon = next_dungeon;
      }
  leave() {
         this.dungeon_view.close();
         main.game.getJinn().stats.refillHealth();
         main.game.exitDungeon();
         super.leave();
         this.dungeon = null;
      }
  getDungeon() {
         return this.dungeon;
      }
  clear() {
         this.onToDungeon.clear();
         this.onToMap.clear();
         super.clear();
      }
}
DungeonState.prototype.dungeon_view = null;
DungeonState.prototype.dungeon = null;
DungeonState.prototype.mainView = null;
DungeonState.prototype.next_dungeon = null;
bindMethods(DungeonState);
