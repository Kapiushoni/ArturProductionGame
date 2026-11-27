import { bindMethods } from '@/flash/as3';
import { BasicPausableState } from '@/game/view/screens/main_game/states/BasicPausableState';
import { main } from '@/game/main';
import { GameSounds } from '@/game/sound/GameSounds';
import { MapView } from '@/game/view/screens/main_game/map/MapView';

/** The game screen on the map: shows the MapView (with the newly unlocked levels), heals the jinn, map music. */
export class MapState extends BasicPausableState {
  /** the GameView */
  private principal: any;
  private mapView: MapView = null;
  private map: any = null;

  constructor(name: string, principal: any, onEnter: Function = null, onLeave: Function = null) {
    super(name, onEnter, onLeave);
    this.principal = principal;
  }
  enter() {
    this.map = main.game.getMap();
    this.mapView = new MapView(this);
    this.mapView.onToMainMenu.add(this.toMainMenu);
    this.mapView.onToDungeon.add(this.toLevel);
    this.principal.gameHolder['map'] = this.mapView;
    this.principal.gameHolder.addChild(this.mapView);
    this.mapView.refreshUnlocked(this.map.unlockUnlocked());
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
  toLevel(level: any) {
    this.principal.toLevelWaiting(level);
  }
  getMap(): any {
    return this.map;
  }
}
bindMethods(MapState);
