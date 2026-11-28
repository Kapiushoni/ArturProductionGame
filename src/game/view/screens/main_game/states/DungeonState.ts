import { bindMethods } from '@/flash/as3';
import { BasicPausableState } from '@/game/view/screens/main_game/states/BasicPausableState';
import { Signal } from '@/game/cb/signals/Signal';
import { app } from '@/game/app';
import { BossDungeon } from '@/game/main_game/boss_dungeon/BossDungeon';
import { BossDungeonView } from '@/game/view/screens/main_game/boss_dungeon/BossDungeonView';
import { DungeonView } from '@/game/view/screens/main_game/dungeon/DungeonView';
import { Roguelite } from '@/game/roguelite/Roguelite';
import { RogueliteConfig } from '@/game/roguelite/RogueliteConfig';
import { StatType } from '@/game/main_game/character/stats/StatType';
import type { HealthStat } from '@/game/main_game/character/stats/HealthStat';
import type { IDungeonState } from '@/game/view/screens/main_game/states/IDungeonState';
import type { DisplayObjectContainer } from '@/flash/as3';
import type { Dungeon } from '@/game/main_game/dungeon/Dungeon';
import type { GameView } from '@/game/view/screens/main_game/GameView';
import type { Level } from '@/game/main_game/map/Level';

/** The game screen inside a dungeon: entering starts the dungeon set with setNextDungeon() and shows its view. */
export class DungeonState extends BasicPausableState implements IDungeonState {
  private dungeon_view: DungeonView = null;
  private dungeon: Dungeon = null;
  /** the GameView */
  private mainView: GameView;
  private next_dungeon: Level = null;
  theOnToDungeon = new Signal();
  theOnToMap = new Signal();
  theOnToMainMenu = new Signal();

  constructor(name: string, mainView: GameView, onEnter: Function = null, onLeave: Function = null) {
    super(name, onEnter, onLeave);
    this.mainView = mainView;
  }
  /** onToDungeon(level): play another dungeon */
  get onToDungeon(): Signal {
    return this.theOnToDungeon;
  }
  /** back to the map */
  get onToMap(): Signal {
    return this.theOnToMap;
  }
  get onToMainMenu(): Signal {
    return this.theOnToMainMenu;
  }
  get pauseHolder(): DisplayObjectContainer {
    return this.mainView.pauseHolder;
  }
  enter() {
    if (Roguelite.enabled) {
      Roguelite.enterDungeon(this.reached());
      // the health the run had when it left the last dungeon (also after reloading the game)
      const saved = Roguelite.health;
      if (saved != null) {
        const hp = this.health;
        hp.modifyValue(saved - hp.getValue());
        app.game.getJinn().stats.onChange.emit();
      }
    }
    app.game.goToDungeon(this.next_dungeon);
    this.dungeon = app.game.getDungeon();
    this.dungeon_view =
      this.dungeon.getId() == BossDungeon.idBossLevel ? new BossDungeonView(this) : new DungeonView(this);
    this.mainView.gameHolder['dungeonView'] = this.dungeon_view;
    this.mainView.gameHolder.addChild(this.dungeon_view);
    super.enter();
  }
  pause() {
    this.dungeon_view.pauseFight();
  }
  resume() {
    this.dungeon_view.resumeFight();
  }
  /** how far on the way to the boss (1..25) this dungeon is: side dungeons count as the furthest main one */
  private reached(): number {
    const id = Number(this.next_dungeon.dungeonId);
    return id <= Number(BossDungeon.idBossLevel) ? id : Number(app.game.map.biggestUnlockedLevel().dungeonId);
  }
  setNextDungeon(level: Level) {
    this.next_dungeon = level;
  }
  private get health(): HealthStat {
    return app.game.getJinn().stats.getStat(StatType.HEALTH) as HealthStat;
  }
  /** leaving: the jinn heals (in the roguelite mod only a part) and the dungeon is closed */
  leave() {
    this.dungeon_view.close();
    if (Roguelite.enabled) {
      Roguelite.leaveDungeon();
      if (this.health.getValue() > 0) {
        this.health.fill(RogueliteConfig.healBetween);
        app.game.getJinn().stats.onChange.emit();
        Roguelite.health = this.health.getValue();
      }
    } else {
      app.game.getJinn().stats.refillHealth();
    }
    app.game.exitDungeon();
    super.leave();
    this.dungeon = null;
  }
  getDungeon(): Dungeon {
    return this.dungeon;
  }
  clear() {
    this.onToDungeon.clear();
    this.onToMap.clear();
    this.onToMainMenu.clear();
    super.clear();
  }
}
bindMethods(DungeonState, ['enter', 'pause', 'resume', 'leave', 'clear']);
