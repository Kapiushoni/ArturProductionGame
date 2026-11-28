import { bindMethods } from '@/flash/as3';
import { BasicPausableState } from '@/game/view/screens/main_game/states/BasicPausableState';
import { app } from '@/game/app';
import { GameSounds } from '@/game/sound/GameSounds';
import { MapView } from '@/game/view/screens/main_game/map/MapView';
import type { GameView } from '@/game/view/screens/main_game/GameView';
import type { Level } from '@/game/main_game/map/Level';
import type { Map } from '@/game/main_game/map/Map';
import { Roguelite } from '@/game/roguelite/Roguelite';
import { ShopScreen } from '@/game/view/screens/roguelite/ShopScreen';
import { TextButton } from '@/game/view/screens/roguelite/widgets';
import { rlText } from '@/game/view/screens/roguelite/texts';
import { StatType } from '@/game/main_game/character/stats/StatType';

/** The game screen on the map: shows the MapView (with the newly unlocked levels), heals the jinn, map music. */
export class MapState extends BasicPausableState {
  /** roguelite: the shop button at the top of the map */
  private shopButton: TextButton = null;
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
    // the roguelite mod does not heal on the map: the run keeps the health it left the last dungeon with
    const stats = app.game.getJinn().stats;
    const saved = Roguelite.enabled ? Roguelite.health : null;
    if (saved != null) {
      const hp = stats.getStat(StatType.HEALTH);
      hp.modifyValue(saved - hp.getValue());
      stats.onChange.emit();
    } else {
      stats.refillHealth();
    }
    super.enter();
    app.soundManager.playMusic(GameSounds.MAP_MUSIC);
    if (Roguelite.enabled) {
      this.shopButton = new TextButton(rlText('shop'), 110, 32, () => ShopScreen.open(app.tutorialHolder, true), 17);
      this.shopButton.x = 96;
      this.shopButton.y = 26;
      app.tutorialHolder.addChild(this.shopButton);
    }
  }
  leave() {
    this.shopButton?.parent?.removeChild(this.shopButton);
    this.shopButton = null;
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
