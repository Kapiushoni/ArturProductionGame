import { Event, MovieClip, Sprite, as3as, bindMethods } from '@/flash/as3';
import { AchievementDispatcher } from '@/game/AchievementDispatcher';
import { BasicState } from '@/game/aplication/BasicState';
import { FSM } from '@/game/aplication/FSM';
import { assert } from '@/game/assert';
import { DailyBonus } from '@/game/bonus/DailyBonus';
import { DragDispatcher } from '@/game/drag_and_drop/DragDispatcher';
import { PostLoader } from '@/game/loader/PostLoader';
import { Preloader } from '@/game/loader/Preloader';
import { SoundLoader } from '@/game/cb/media/SoundLoader';
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
import { app } from '@/game/app';
import { Roguelite } from '@/game/roguelite/Roguelite';
import type { DiFile } from '@/game/bonus/DiFile';
import type { Locale } from '@/game/cb/data/Locale';
import type { SwfLibrary } from '@/game/cb/display/SwfLibrary';

/**
 * The application (the document class of the original game): builds the display layers and the shared objects
 * (see app.ts), loads everything, then runs the screens as an FSM: preloading -> mainMenu -> (intro ->) game (-> outro),
 * see init().
 */
export class main extends Sprite {
  fsmAplication: FSM = null;
  /** the next loadGame starts a new roguelite run (the last one was lost) */
  private newRun = false;

  constructor() {
    super();
    app.waitForResources = (resources, callback, callback2 = null) =>
      new TransitionWindow(resources, callback, callback2).start(app.transitionHolder);
    app.waitForResourcesJakeLess = (resources, callback, callback2 = null) =>
      new TransitionWindowJakeLess(resources, callback, callback2).start(app.transitionHolder);
    if (this.stage) {
      this.init();
    } else {
      this.addEventListener(Event.ADDED_TO_STAGE, this.init);
    }
  }
  init(_event: Event = null) {
    app.popUpHolder = new MovieClip();
    app.tutorialHolder = new MovieClip();
    app.gameHolder = new MovieClip();
    app.transitionHolder = new MovieClip();
    this.addChild(app.gameHolder);
    this.addChild(app.tutorialHolder);
    this.addChild(app.popUpHolder);
    app.popUpHolder.mouseChildren = false;
    app.popUpHolder.mouseEnabled = false;
    this.addChild(app.transitionHolder);
    this.disableKeyboard();
    this.removeEventListener(Event.ADDED_TO_STAGE, this.init);
    app.drag = new DragDispatcher(this.stage);
    app.soundManager = new SoundManager();
    app.saveSystem = new SaveSystem(this.stage);

    const preloader = new Preloader(app.gameHolder);
    preloader.onLocaleLoaded.add((locale: Locale) => (app.locale = locale));
    preloader.onConfigLoaded.add((config: DiFile) => (app.config = config));
    preloader.onCharactersLoaded.add((rows: any) => CharacterFactory.setConfig(rows));
    preloader.onItemsLoaded.add((rows: any) => ItemFactory.setConfig(rows));
    preloader.onDungeonsLoaded.add((rows: any) => DungeonFactory.setConfig(rows));
    preloader.onSwfLoaded.add((swfs: SwfLibrary) => (app.swfLoader = swfs));
    preloader.onSoundLoaded.add((sounds: any) => app.soundManager.start(sounds));
    preloader.onFinishLoading.add(this.preloadingComplete);
    app.achievementDispatcher = new AchievementDispatcher();

    const fsm = new FSM(new BasicState('preloading', preloader.start, app.achievementDispatcher.gameLoaded));
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
    fsm.addTransition('game', 'game', 'newRun');
    fsm.addTransition('outro', 'game', 'next');
    fsm.start();
  }
  disableKeyboard() {
    app.gameHolder.tabEnabled = false;
    app.gameHolder.tabChildren = false;
    app.tutorialHolder.tabEnabled = false;
    app.tutorialHolder.tabChildren = false;
  }
  preloadingComplete(preloader: Preloader) {
    assert(app.swfLoader != null, 'swfLoader is missing!');
    assert(app.locale != null, 'Locale is missing!');
    assert(app.soundManager.ready(), 'soundMixer is missing!');
    assert(app.config != null, 'config is missing!');
    assert(DailyBonus.config != null, 'dailybonus is missing!');
    // the other sound lists load in the background, one after another
    app.postLoader = new PostLoader(
      GameSounds.soundsToLoad,
      (list) =>
        new Promise((done) => {
          const sounds = new SoundLoader(list);
          sounds.loaded.add(() => {
            app.soundManager.addSound(sounds);
            done();
          });
          sounds.load();
        }),
    );
    app.postLoader.start();
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
    app.gameHolder.addChild(menu);
    menu.onNewGame.add(() => {
      const go = () => this.fsmAplication.takeTransition('newGame');
      // no intro (a later roguelite run): this one transition screen also waits for the map's sounds
      if (main.skipIntro) app.waitForResources(GameSounds.mapSounds, go);
      else app.waitForResourcesJakeLess([], go);
    });
    menu.onContinueGame.add(
      Util.l(app.waitForResources, GameSounds.mapSounds, () => this.fsmAplication.takeTransition('continueGame')),
    );
    menu.enter();
  }
  removeMainMenu() {
    as3as(this.currentScreen, MainMenu).exit();
  }
  /** the roguelite mod shows the intro in the first run only */
  static get skipIntro(): boolean {
    return Roguelite.enabled && Roguelite.runs > 0;
  }
  /** a new game: the save is reset */
  showIntro() {
    app.saveSystem.reset();
    const start = () => {
      app.saveSystem.onFirstPlay();
      this.fsmAplication.takeTransition('next');
    };
    if (main.skipIntro) {
      // the menu's transition screen has already loaded what the map needs: straight to the game
      this.currentScreen = null;
      Promise.resolve().then(start);
      return;
    }
    const intro = new Intro();
    this.currentScreen = intro;
    app.gameHolder.addChild(intro);
    intro.onNext.add(Util.l(app.waitForResources, GameSounds.mapSounds, start));
    intro.onBack.add(Util.l(app.waitForResourcesJakeLess, [], () => this.fsmAplication.takeTransition('back')));
    intro.enter();
  }
  removeIntro() {
    (as3as(this.currentScreen, Intro) as Intro)?.exit();
  }
  showOutro() {
    app.achievementDispatcher.gameWon();
    const outro = new Outro();
    this.currentScreen = outro;
    app.gameHolder.addChild(outro);
    outro.onNext.add(
      Util.l(app.waitForResourcesJakeLess, [], () => {
        app.saveSystem.onFirstPlay();
        this.fsmAplication.takeTransition('next');
      }),
    );
    outro.onBack.add(Util.l(app.waitForResources, [], () => this.fsmAplication.takeTransition('next')));
    outro.enter();
  }
  removeOutro() {
    as3as(this.currentScreen, Outro).exit();
  }
  loadGame() {
    if (this.newRun) {
      // the old game has just been left: forget its pending saves, then a fresh run save
      this.newRun = false;
      app.saveSystem.switched();
      app.saveSystem.reset();
      app.saveSystem.onFirstPlay();
    }
    app.theTutorial = new Tutorial();
    app.game = new Game();
    app.game.enter();
    if (app.activeBonus != null) {
      app.activeBonus.activate(app.game);
    }
    const gameView = new GameView();
    app.gameHolder['gameView'] = gameView;
    app.gameHolder.addChild(gameView);
    gameView.onExit.add(Util.l(app.waitForResources, [], () => this.fsmAplication.takeTransition('toMainMenu')));
    gameView.onEnd.add(Util.l(app.waitForResources, [], () => this.fsmAplication.takeTransition('endGame')));
    gameView.onNewRun.add(
      Util.l(app.waitForResources, GameSounds.mapSounds, () => {
        this.newRun = true;
        this.fsmAplication.takeTransition('newRun');
      }),
    );
    gameView.start();
    app.theTutorial.next();
    app.achievementDispatcher.gamePlayed();
  }
  leaveGame() {
    app.gameHolder['gameView'].exit();
    app.drag.clear();
    app.game.exit();
  }
}
bindMethods(main, [
  'init',
  'preloadingComplete',
  'showMainMenu',
  'removeMainMenu',
  'showIntro',
  'removeIntro',
  'showOutro',
  'removeOutro',
  'loadGame',
  'leaveGame',
]);
