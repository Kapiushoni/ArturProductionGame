import { Dictionary, MovieClip, as3as, bindMethods } from '@/flash/as3';
import { Screen } from '@/game/cb/display/Screen';
import { FSM } from '@/game/aplication/FSM';
import { ButtonGroup } from '@/game/cb/data/ButtonGroup';
import { Signal } from '@/game/cb/signals/Signal';
import { main } from '@/game/main';
import { BossDungeon } from '@/game/main_game/boss_dungeon/BossDungeon';
import { GameSounds } from '@/game/sound/GameSounds';
import { Buttons } from '@/game/util/Buttons';
import { Sepializer } from '@/game/util/Sepializer';
import { Util } from '@/game/util/Util';
import { BossDungeonState } from '@/game/view/screens/main_game/boss_dungeon/BossDungeonState';
import { CookBook } from '@/game/view/screens/main_game/cookBook/CookBook';
import { InventoryView } from '@/game/view/screens/main_game/inventory/InventoryView';
import { MixerView } from '@/game/view/screens/main_game/inventory/MixerView';
import { StatsView } from '@/game/view/screens/main_game/inventory/StatsView';
import { ShmabledumView } from '@/game/view/screens/main_game/shmabledum/ShmabledumView';
import { BasicPausableState } from '@/game/view/screens/main_game/states/BasicPausableState';
import { DungeonState } from '@/game/view/screens/main_game/states/DungeonState';
import { MapState } from '@/game/view/screens/main_game/states/MapState';
import type { Level } from '@/game/main_game/map/Level';

export class GameView extends Screen {
  inventory = new InventoryView();
  mixing = new MixerView();
  stats = new StatsView();
  princess = new ShmabledumView();
  cookBook: any = null;
  cookBookEnalbed = true;
  fsm: any = null;
  up_holder: any = null;
  onExit: any = null;
  onEnd: any = null;
  constructor() {
    super();
    this.initScreen(main.swfLoader.getClass('assets.Inventory'), this.getButtonInfo());
    this.up_holder = new MovieClip();
    this.addChildAt(this.up_holder, 0);
    this.up_holder.game = new MovieClip();
    this.up_holder.pause = new MovieClip();
    this.up_holder.addChild(this.up_holder.game);
    this.up_holder.addChild(this.up_holder.pause);
    this.initialize();
    this.initializeFSM();
  }
  get pauseHolder() {
    return this.up_holder.pause;
  }
  get gameHolder() {
    return this.up_holder.game;
  }
  getButtonInfo() {
    var dict = new Dictionary();
    dict.set(
      'mix.mix_button',
      ButtonGroup.get('gui_mix').createButton(this.mixing.mix, 'mouseOver', this.mixing.mixButtonOut),
    );
    dict.set('inventory.recipes', ButtonGroup.get('gui').createButton(this.clickOnRecipes, 'mouseOver', 'mouseOut'));
    return dict;
  }
  initialize() {
    this.onExit = new Signal();
    this.onEnd = new Signal();
    this.inventory.initialize(this.bg.inventory);
    this.mixing.initialize(this.bg.mix);
    this.stats.initialize(this.bg.stats);
    this.princess.initialize(this.bg.mix.pb);
    Buttons.setButtons(this.bg.inventory, ['recipes'], true);
    main.game.onPause.add(this.updatePauseState);
  }
  updatePauseState(flag: boolean) {
    if (flag) {
      this.bg.mouseChildren = false;
      this.bg.mouseEnabled = false;
      Sepializer.getInstance().sepialize(this.bg);
    } else {
      this.bg.mouseChildren = true;
      this.bg.mouseEnabled = true;
      Sepializer.getInstance().unsepialize(this.bg);
    }
  }
  initializeFSM() {
    var basicPausableState = new BasicPausableState('init');
    var basicPausableState2 = new BasicPausableState('exit', this.pop);
    var mapState = new MapState('map', this);
    var dungeonState = new DungeonState('dungeon', this);
    dungeonState.onToDungeon.add(this.toLevel);
    dungeonState.onToMap.add(this.showMap);
    var bossDungeonState = new BossDungeonState('boss', this);
    bossDungeonState.setNextDungeon(main.game.map.getLevel(BossDungeon.idBossLevel));
    bossDungeonState.onToDungeon.add(this.toLevel);
    bossDungeonState.onToMap.add(this.showMap);
    bossDungeonState.onToOutro.add(this.toOutro);
    this.fsm = new FSM(basicPausableState);
    this.fsm.addState(mapState);
    this.fsm.addState(dungeonState);
    this.fsm.addState(bossDungeonState);
    this.fsm.addState(basicPausableState2);
    this.fsm.addTransition('init', 'map', 'enterMap');
    this.fsm.addTransition('map', 'map', 'enterMap');
    this.fsm.addTransition('dungeon', 'map', 'enterMap');
    this.fsm.addTransition('boss', 'map', 'enterMap');
    this.fsm.addTransition('map', 'dungeon', 'enterDungeon');
    this.fsm.addTransition('dungeon', 'dungeon', 'enterDungeon');
    this.fsm.addTransition('boss', 'dungeon', 'enterDungeon');
    this.fsm.addTransition('dungeon', 'boss', 'enterBoss');
    this.fsm.addTransition('boss', 'boss', 'enterBoss');
    this.fsm.addTransition('map', 'boss', 'enterBoss');
    this.fsm.addTransition('map', 'exit', 'leave');
    this.fsm.addTransition('boss', 'exit', 'leave');
  }
  get recipesButton() {
    return this.bg.inventory.recipes.book;
  }
  clickOnRecipes(event: any = null) {
    if (!this.cookBookEnalbed) {
      return;
    }
    this.disableCookButton();
    if (this.cookBook == null) {
      this.fsm.getActualState().pause();
      this.recipesButton.gotoAndPlay('clicked');
      this.cookBook = new CookBook(this.clickOnRecipes);
      this.up_holder.addChild(this.cookBook);
      this.cookBook.enter(this.enableCookButton);
    } else {
      this.fsm.getActualState().resume();
      this.recipesButton.gotoAndPlay('unclicked');
      this.cookBook.leave(this.removeCookBook);
    }
  }
  enableCookButton() {
    this.cookBookEnalbed = true;
    Buttons.setButtons(this.bg.inventory, ['recipes'], true);
  }
  disableCookButton() {
    this.cookBookEnalbed = false;
    Buttons.setButtons(this.bg.inventory, ['recipes'], false);
  }
  removeCookBook() {
    this.up_holder.removeChild(this.cookBook);
    this.cookBook.clear();
    this.cookBook = null;
    this.enableCookButton();
  }
  start() {
    this.fsm.takeTransition('enterMap');
  }
  showMap() {
    this.fsm.takeTransition('enterMap');
  }
  toLevel(level: Level) {
    if (!Util.areLoaded(this.resourcesForLevel(level), main.theLoader)) {
      this.toLevelWaiting(level);
    } else {
      this.toLevelWithoutWait(level);
    }
  }
  resourcesForLevel(level: Level) {
    if (level.dungeonId == BossDungeon.idBossLevel) {
      return GameSounds.bossSounds;
    }
    if (level.getArea() <= 1 && !level.isLegendary() && !level.isSpecial()) {
      return GameSounds.combatSoundsBasic;
    }
    return GameSounds.combatSounds;
  }
  toLevelWaiting(level: Level) {
    main.waitForResources(this.resourcesForLevel(level), Util.l(this.toLevelWithoutWait, level));
  }
  toLevelWithoutWait(level: Level) {
    if (level.dungeonId == BossDungeon.idBossLevel) {
      this.fsm.takeTransition('enterBoss');
    } else {
      as3as(this.fsm.getState('dungeon'), DungeonState).setNextDungeon(level);
      this.fsm.takeTransition('enterDungeon');
    }
  }
  toMainMenu() {
    this.onExit.emit();
  }
  toOutro() {
    this.onEnd.emit();
  }
  exit() {
    this.fsm.takeTransition('leave');
  }
  clear() {
    this.inventory.clear();
    this.mixing.clear();
    this.stats.clear();
    this.princess.clear();
    this.fsm.clear();
    super.clear();
  }
}
bindMethods(GameView);
