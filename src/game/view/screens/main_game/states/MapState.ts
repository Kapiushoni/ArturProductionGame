// @ts-nocheck
import { __DEFER, bindMethods } from '@/flash/as3';
import { BasicPausableState } from '@/game/view/screens/main_game/states/BasicPausableState';
import { main } from '@/game/main';
import { GameSounds } from '@/game/sound/GameSounds';
import { MapView } from '@/game/view/screens/main_game/map/MapView';

export class MapState extends BasicPausableState {
  declare principal: any;
  declare mapView: any;
  declare map: any;
  constructor(text, principal, callback = null, callback2 = null) {super(__DEFER); 
         this.principal = principal;
          this.__init_BasicPausableState(text,callback,callback2);
      }
  enter() {
         this.map = main.game.getMap();
         this.mapView = new MapView(this);
         this.mapView.onToMainMenu.add(this.toMainMenu);
         this.mapView.onToDungeon.add(this.toLevel);
         this.principal.gameHolder["map"] = this.mapView;
         this.principal.gameHolder.addChild(this.mapView);
         var cbArray = this.map.unlockUnlocked();
         this.mapView.refreshUnlocked(cbArray);
         main.game.getJinn().stats.refillHealth();
         super.enter();
         main.soundManager.playMusic(GameSounds.MAP_MUSIC);
      }
  leave() {
         this.mapView.close();
         this.map = null;
         super.leave();
      }
  toMainMenu() {
         this.principal.toMainMenu();
      }
  toLevel(level) {
         this.principal.toLevelWaiting(level);
      }
  getMap() {
         return this.map;
      }
}
MapState.prototype.principal = null;
MapState.prototype.mapView = null;
MapState.prototype.map = null;
bindMethods(MapState);
