import { bindMethods } from '@/flash/as3';
import { BasicPausableState } from '@/game/view/screens/main_game/states/BasicPausableState';
import { Signal } from '@/game/cb/signals/Signal';
import { main } from '@/game/main';
import { BossDungeon } from '@/game/main_game/boss_dungeon/BossDungeon';
import { BossDungeonView } from '@/game/view/screens/main_game/boss_dungeon/BossDungeonView';
import { DungeonView } from '@/game/view/screens/main_game/dungeon/DungeonView';
import type { IDungeonState } from '@/game/view/screens/main_game/states/IDungeonState';

/** The game screen inside a dungeon: entering starts the dungeon set with setNextDungeon() and shows its view. */
export class DungeonState extends BasicPausableState implements IDungeonState {
  private dungeon_view: any = null;
  private dungeon: any = null;
  /** the GameView */
  private mainView: any;
  private next_dungeon: any = null;
  theOnToDungeon = new Signal();
  theOnToMap = new Signal();

  constructor(name: string, mainView: any, onEnter: Function = null, onLeave: Function = null) {
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
  get pauseHolder(): any {
    return this.mainView.pauseHolder;
  }
  enter() {
    main.game.goToDungeon(this.next_dungeon);
    this.dungeon = main.game.getDungeon();
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
  setNextDungeon(level: any) {
    this.next_dungeon = level;
  }
  /** leaving: the jinn heals and the dungeon is closed */
  leave() {
    this.dungeon_view.close();
    main.game.getJinn().stats.refillHealth();
    main.game.exitDungeon();
    super.leave();
    this.dungeon = null;
  }
  getDungeon(): any {
    return this.dungeon;
  }
  clear() {
    this.onToDungeon.clear();
    this.onToMap.clear();
    super.clear();
  }
}
bindMethods(DungeonState);
