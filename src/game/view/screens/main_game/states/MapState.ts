import { bindMethods } from '@/flash/as3';
import { BasicPausableState } from '@/game/view/screens/main_game/states/BasicPausableState';
import { app } from '@/game/app';
import { GameSounds } from '@/game/sound/GameSounds';
import { MapView } from '@/game/view/screens/main_game/map/MapView';
import type { GameView } from '@/game/view/screens/main_game/GameView';
import type { Level } from '@/game/main_game/map/Level';
import type { Map } from '@/game/main_game/map/Map';

/** The game screen on the map: shows the MapView (with the newly unlocked levels), heals the jinn, map music. */
export class MapState extends BasicPausableState {
  /** the GameView */
  private principal: GameView;
  private mapView: MapView = null;
  map: Map = null;

  constructor(name: string, principal: GameView, onEnter: Function = null, onLeave: Function = null) {
    super(name, onEnter, onLeave);
    this.principal = principal;
  }
  enter() {
    this.map = app.game.map;
    this.mapView = new MapView(this);
    this.mapView.onToMainMenu.add(this.toMainMenu);
    this.mapView.onToDungeon.add(this.toLevel);
    this.principal.gameHolder['map'] = this.mapView;
    this.principal.gameHolder.addChild(this.mapView);
    this.mapView.refreshUnlocked(this.map.unlockUnlocked());
    app.game.getJinn().stats.refillHealth();
    super.enter();
    app.soundManager.playMusic(GameSounds.MAP_MUSIC);
  }
  leave() {
    this.mapView.close();
    this.map = null;
    super.leave();
  }
  toMainMenu() {
    this.principal.toMainMenu();
  }
  toLevel(level: Level) {
    this.principal.toLevelWaiting(level);
  }
}
bindMethods(MapState, ['enter', 'leave', 'toMainMenu', 'toLevel']);
