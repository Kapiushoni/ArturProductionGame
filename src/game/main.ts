import { Event, MovieClip, Sprite, as3as, bindMethods } from '@/flash/as3';
import { AchievementDispatcher } from '@/game/AchievementDispatcher';
import { BasicState } from '@/game/aplication/BasicState';
import { FSM } from '@/game/aplication/FSM';
import { assert } from '@/game/assert';
import { DailyBonus } from '@/game/bonus/DailyBonus';
import { Appender } from '@/game/cb/logger/Appender';
import { JSConsoleAppender } from '@/game/cb/logger/JSConsoleAppender';
import { Log } from '@/game/cb/logger/Log';
import { DragDispatcher } from '@/game/drag_and_drop/DragDispatcher';
import { PostLoader } from '@/game/loader/PostLoader';
import { Preloader } from '@/game/loader/Preloader';
import { SoundResourceLoader } from '@/game/loader/SoundResourceLoader';
import { CharacterFactory } from '@/game/main_game/character/CharacterFactory';
import { DungeonFactory } from '@/game/main_game/dungeon/DungeonFactory';
import { Game } from '@/game/main_game/Game';
import { ItemFactory } from '@/game/main_game/items/ItemFactory';
import { SaveSystem } from '@/game/persistence/SaveSystem';
import { GameSounds } from '@/game/sound/GameSounds';
import { SoundManager } from '@/game/sound/SoundManager';
import { Tutorial } from '@/game/tutorial/Tutorial';
import { Util } from '@/game/util/Util';
import { Intro } from '@/game/view/screens/Intro';
import { GameView } from '@/game/view/screens/main_game/GameView';
import { TransitionWindow } from '@/game/view/screens/main_game/TransitionWindow';
import { TransitionWindowJakeLess } from '@/game/view/screens/main_game/TransitionWindowJakeLess';
import { MainMenu } from '@/game/view/screens/MainMenu';
import { Outro } from '@/game/view/screens/Outro';
import { services } from '@/game/services';
import type { ClassLoader } from '@/game/bonus/ClassLoader';
import type { IDailyBonus } from '@/game/bonus/IDailyBonus';
import type { Locale } from '@/game/cb/data/Locale';
import type { SwfBulkLoader } from '@/game/cb/display/SwfBulkLoader';

/**
 * The application (the document class of the original game). Its static fields are what the screens use;
 * the services shared with the game logic (texts, config, save, sound, ...) live in services.ts
 * and are reached here through accessors. Screens are an FSM: preloading -> mainMenu -> (intro ->) game (-> outro), see init().
 */
export class main extends Sprite {
  /** texts (locale.txt) */
  static get locale(): Locale {
    return services.texts as Locale;
  }
  static set locale(value: Locale) {
    services.texts = value;
  }
  /** asset libraries */
  static swfLoader: SwfBulkLoader = null;
  static get soundManager(): SoundManager {
    return services.sound as SoundManager;
  }
  static set soundManager(value: SoundManager) {
    services.sound = value;
  }
  /** config.di */
  static get config(): any {
    return services.config;
  }
  static set config(value: any) {
    services.config = value;
  }
  /** the game model, while in the game */
  static game: Game = null;
  static drag: DragDispatcher = null;
  static get saveSystem(): SaveSystem {
    return services.saveSystem;
  }
  static set saveSystem(value: SaveSystem) {
    services.saveSystem = value;
  }
  /** today's bonus, or null */
  static activeBonus: IDailyBonus = null;
  static get theTutorial(): Tutorial {
    return services.tutorial as Tutorial;
  }
  static set theTutorial(value: Tutorial) {
    services.tutorial = value;
  }
  static get achievementDispatcher(): AchievementDispatcher {
    return services.achievements as AchievementDispatcher;
  }
  static set achievementDispatcher(value: AchievementDispatcher) {
    services.achievements = value;
  }
  /** display layers, bottom to top */
  static gameHolder: any = null;
  static tutorialHolder: any = null;
  static popUpHolder: any = null;
  static transitionHolder: any = null;
  /** loads the rest of the sounds in the background */
  static postLoader: PostLoader = null;
  fsmAplication: FSM = null;

  constructor() {
    super();
    Log.getLogger('debug').addAppender(new JSConsoleAppender());
    Log.getLogger('debug').addAppender(new Appender());
    if (this.stage) {
      this.init();
    } else {
      this.addEventListener(Event.ADDED_TO_STAGE, this.init);
    }
  }
  static get theLoader(): PostLoader {
    return main.postLoader;
  }
  static setDailyBonus(config: ClassLoader) {
    DailyBonus.config = config;
    main.activeBonus = DailyBonus.getBonusOfDate(new Date());
  }
  /** a transition screen until the resources are loaded, then callback */
  static waitForResourcesJakeLess(resources: string[], callback: Function, callback2: Function = null) {
    new TransitionWindowJakeLess(resources, callback, callback2).start(main.transitionHolder);
  }
  /** the same, with Jake on the transition screen */
  static waitForResources(resources: string[], callback: Function, callback2: Function = null) {
    new TransitionWindow(resources, callback, callback2).start(main.transitionHolder);
  }
  init(_event: any = null) {
    main.popUpHolder = new MovieClip();
    main.tutorialHolder = new MovieClip();
    main.gameHolder = new MovieClip();
    main.transitionHolder = new MovieClip();
    this.addChild(main.gameHolder);
    this.addChild(main.tutorialHolder);
    this.addChild(main.popUpHolder);
    main.popUpHolder.mouseChildren = false;
    main.popUpHolder.mouseEnabled = false;
    this.addChild(main.transitionHolder);
    this.disableKeyboard();
    this.removeEventListener(Event.ADDED_TO_STAGE, this.init);
    main.drag = new DragDispatcher(this.stage);
    main.soundManager = new SoundManager();
    main.saveSystem = new SaveSystem(this.stage);

    const preloader = new Preloader(main.gameHolder);
    preloader.onLocaleLoaded.add((locale: Locale) => (main.locale = locale));
    preloader.onConfigLoaded.add((config: ClassLoader) => (main.config = config));
    preloader.onCharactersLoaded.add((rows: any) => CharacterFactory.setConfig(rows));
    preloader.onItemsLoaded.add((rows: any) => ItemFactory.setConfig(rows));
    preloader.onDungeonsLoaded.add((rows: any) => DungeonFactory.setConfig(rows));
    preloader.onSwfLoaded.add((swfs: SwfBulkLoader) => (main.swfLoader = swfs));
    preloader.onSoundLoaded.add((sounds: any) => main.soundManager.start(sounds));
    preloader.onFinishLoading.add(this.preloadingComplete);
    main.achievementDispatcher = new AchievementDispatcher();

    const fsm = new FSM(new BasicState('preloading', preloader.start, main.achievementDispatcher.gameLoaded));
    this.fsmAplication = fsm;
    fsm.addState(new BasicState('mainMenu', this.showMainMenu, this.removeMainMenu));
    fsm.addState(new BasicState('intro', this.showIntro, this.removeIntro));
    fsm.addState(new BasicState('game', this.loadGame, this.leaveGame));
    fsm.addState(new BasicState('outro', this.showOutro, this.removeOutro));
    fsm.addTransition('preloading', 'mainMenu', 'loaded');
    fsm.addTransition('mainMenu', 'intro', 'newGame');
    fsm.addTransition('mainMenu', 'game', 'continueGame');
    fsm.addTransition('intro', 'game', 'next');
    fsm.addTransition('intro', 'mainMenu', 'back');
    fsm.addTransition('game', 'mainMenu', 'toMainMenu');
    fsm.addTransition('game', 'outro', 'endGame');
    fsm.addTransition('outro', 'game', 'next');
    fsm.start();
  }
  disableKeyboard() {
    main.gameHolder.tabEnabled = false;
    main.gameHolder.tabChildren = false;
    main.tutorialHolder.tabEnabled = false;
    main.tutorialHolder.tabChildren = false;
  }
  preloadingComplete(preloader: Preloader) {
    assert(main.swfLoader != null, 'swfLoader is missing!');
    assert(main.locale != null, 'Locale is missing!');
    assert(main.soundManager.ready(), 'soundMixer is missing!');
    assert(main.config != null, 'config is missing!');
    assert(DailyBonus.config != null, 'dailybonus is missing!');
    main.postLoader = new PostLoader(GameSounds.soundsToLoad, new SoundResourceLoader(main.soundManager));
    main.postLoader.start();
    preloader.pop();
    this.fsmAplication.takeTransition('loaded');
  }
  /** the screen object of the current state */
  private get currentScreen(): any {
    return (as3as(this.fsmAplication.getActualState(), BasicState) as BasicState).persistency;
  }
  private set currentScreen(screen: any) {
    (as3as(this.fsmAplication.getActualState(), BasicState) as BasicState).persistency = screen;
  }
  showMainMenu() {
    const menu = new MainMenu();
    this.currentScreen = menu;
    main.gameHolder.addChild(menu);
    menu.onNewGame.add(Util.l(main.waitForResourcesJakeLess, [], () => this.fsmAplication.takeTransition('newGame')));
    menu.onContinueGame.add(
      Util.l(main.waitForResources, GameSounds.mapSounds, () => this.fsmAplication.takeTransition('continueGame')),
    );
    menu.enter();
  }
  removeMainMenu() {
    as3as(this.currentScreen, MainMenu).exit();
  }
  /** a new game: the save is reset */
  showIntro() {
    main.saveSystem.reset();
    const intro = new Intro();
    this.currentScreen = intro;
    main.gameHolder.addChild(intro);
    intro.onNext.add(
      Util.l(main.waitForResources, GameSounds.mapSounds, () => {
        main.saveSystem.onFirstPlay();
        this.fsmAplication.takeTransition('next');
      }),
    );
    intro.onBack.add(Util.l(main.waitForResourcesJakeLess, [], () => this.fsmAplication.takeTransition('back')));
    intro.enter();
  }
  removeIntro() {
    as3as(this.currentScreen, Intro).exit();
  }
  showOutro() {
    main.achievementDispatcher.gameWon();
    const outro = new Outro();
    this.currentScreen = outro;
    main.gameHolder.addChild(outro);
    outro.onNext.add(
      Util.l(main.waitForResourcesJakeLess, [], () => {
        main.saveSystem.onFirstPlay();
        this.fsmAplication.takeTransition('next');
      }),
    );
    outro.onBack.add(Util.l(main.waitForResources, [], () => this.fsmAplication.takeTransition('next')));
    outro.enter();
  }
  removeOutro() {
    as3as(this.currentScreen, Outro).exit();
  }
  loadGame() {
    main.theTutorial = new Tutorial();
    main.game = new Game();
    main.game.enter();
    if (main.activeBonus != null) {
      main.activeBonus.activate(main.game);
    }
    const gameView = new GameView();
    main.gameHolder['gameView'] = gameView;
    main.gameHolder.addChild(gameView);
    gameView.onExit.add(Util.l(main.waitForResources, [], () => this.fsmAplication.takeTransition('toMainMenu')));
    gameView.onEnd.add(Util.l(main.waitForResources, [], () => this.fsmAplication.takeTransition('endGame')));
    gameView.start();
    main.theTutorial.next();
    main.achievementDispatcher.gamePlayed();
  }
  leaveGame() {
    main.gameHolder['gameView'].exit();
    main.drag.clear();
    main.game.exit();
  }
}
bindMethods(main);
