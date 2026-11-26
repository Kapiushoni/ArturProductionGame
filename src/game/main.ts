// @ts-nocheck
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

export class main extends Sprite {
  static locale = null;
  static swfLoader = null;
  static soundManager = null;
  static config = null;
  static levels = null;
  static game = null;
  static drag = null;
  static saveSystem = null;
  static activeBonus = null;
  static theTutorial = null;
  static achievementDispatcher = null;
  static gameHolder = null;
  static popUpHolder = null;
  static tutorialHolder = null;
  static transitionHolder = null;
  static postLoader = null;
  declare fsmAplication: any;
  constructor() {
          super(); const __self = this;
         Log.getLogger("debug").addAppender(new JSConsoleAppender());
         Log.getLogger("debug").addAppender(new Appender());
         if(__self.stage)
         {
            this.init();
         }
         else
         {
            __self.addEventListener(Event.ADDED_TO_STAGE,this.init);
         }
      }
  static get theLoader() {
         return main.postLoader;
      }
  static setDailyBonus(classLoader) {
         DailyBonus.config = classLoader;
         main.activeBonus = DailyBonus.getBonusOfDate(new Date());
      }
  static waitForResourcesJakeLess(list, callback, callback2 = null) {
         var transitionWindowJakeLess = new TransitionWindowJakeLess(list,callback,callback2);
         transitionWindowJakeLess.start(main.transitionHolder);
      }
  static waitForResources(list, callback, callback2 = null) {
         var transitionWindow = new TransitionWindow(list,callback,callback2);
         transitionWindow.start(main.transitionHolder);
      }
  init(event = null) { const __self = this;
         var preloader = null;
         var e = event;
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
         __self.removeEventListener(Event.ADDED_TO_STAGE,this.init);
         main.drag = new DragDispatcher(__self.stage);
         main.soundManager = new SoundManager();
         main.saveSystem = new SaveSystem(__self.stage);
         preloader = new Preloader(main.gameHolder);
         preloader.onLocaleLoaded.add(function(locale)
         {
            main.locale = locale;
         });
         preloader.onConfigLoaded.add(function(classLoader)
         {
            main.config = classLoader;
         });
         preloader.onCharactersLoaded.add(function(dict)
         {
            CharacterFactory.setConfig(dict);
         });
         preloader.onItemsLoaded.add(function(dict2)
         {
            ItemFactory.setConfig(dict2);
         });
         preloader.onDungeonsLoaded.add(function(dict3)
         {
            DungeonFactory.setConfig(dict3);
         });
         preloader.onLevelsLoaded.add(function(classLoader2)
         {
            main.levels = classLoader2;
         });
         preloader.onSwfLoaded.add(function(swfBulkLoader)
         {
            main.swfLoader = swfBulkLoader;
         });
         preloader.onSoundLoaded.add(function(soundLoader)
         {
            main.soundManager.start(soundLoader);
         });
         preloader.onFinishLoading.add(this.preloadingComplete);
         main.achievementDispatcher = new AchievementDispatcher();
         this.fsmAplication = new FSM(new BasicState("preloading",preloader.start,main.achievementDispatcher.gameLoaded));
         this.fsmAplication.addState(new BasicState("mainMenu",this.showMainMenu,this.removeMainMenu));
         this.fsmAplication.addState(new BasicState("intro",this.showIntro,this.removeIntro));
         this.fsmAplication.addState(new BasicState("game",this.loadGame,this.leaveGame));
         this.fsmAplication.addState(new BasicState("outro",this.showOutro,this.removeOutro));
         this.fsmAplication.addTransition("preloading","mainMenu","loaded");
         this.fsmAplication.addTransition("mainMenu","intro","newGame");
         this.fsmAplication.addTransition("mainMenu","game","continueGame");
         this.fsmAplication.addTransition("intro","game","next");
         this.fsmAplication.addTransition("intro","mainMenu","back");
         this.fsmAplication.addTransition("game","mainMenu","toMainMenu");
         this.fsmAplication.addTransition("game","outro","endGame");
         this.fsmAplication.addTransition("outro","game","next");
         this.fsmAplication.start();
      }
  disableKeyboard() {
         main.gameHolder.tabEnabled = false;
         main.gameHolder.tabChildren = false;
         main.tutorialHolder.tabEnabled = false;
         main.tutorialHolder.tabChildren = false;
      }
  preloadingComplete(preloader) {
         assert(main.swfLoader != null,"swfLoader is missing!");
         assert(main.locale != null,"Locale is missing!");
         assert(main.soundManager.ready(),"soundMixer is missing!");
         assert(main.config != null,"config is missing!");
         assert(DailyBonus.config != null,"dailybonus is missing!");
         main.postLoader = new PostLoader(GameSounds.soundsToLoad,new SoundResourceLoader(main.soundManager));
         main.postLoader.start();
         preloader.pop();
         this.fsmAplication.takeTransition("loaded");
      }
  showMainMenu() { const __self = this;
         var mm = new MainMenu();
         (as3as(this.fsmAplication.getActualState(), BasicState)).persistency = mm;
         main.gameHolder.addChild(mm);
         mm.onNewGame.add(Util.l(main.waitForResourcesJakeLess,[],function()
         {
            __self.fsmAplication.takeTransition("newGame");
         }));
         mm.onContinueGame.add(Util.l(main.waitForResources,GameSounds.mapSounds,function()
         {
            __self.fsmAplication.takeTransition("continueGame");
         }));
         mm.enter();
      }
  removeMainMenu() {
         var mainMenu = as3as((as3as(this.fsmAplication.getActualState(), BasicState)).persistency, MainMenu);
         mainMenu.exit();
      }
  showIntro() { const __self = this;
         var intro = null;
         main.saveSystem.reset();
         intro = new Intro();
         (as3as(this.fsmAplication.getActualState(), BasicState)).persistency = intro;
         main.gameHolder.addChild(intro);
         intro.onNext.add(Util.l(main.waitForResources,GameSounds.mapSounds,function()
         {
            main.saveSystem.onFirstPlay();
            __self.fsmAplication.takeTransition("next");
         }));
         intro.onBack.add(Util.l(main.waitForResourcesJakeLess,[],function()
         {
            __self.fsmAplication.takeTransition("back");
         }));
         intro.enter();
      }
  removeIntro() {
         var intro = as3as((as3as(this.fsmAplication.getActualState(), BasicState)).persistency, Intro);
         intro.exit();
      }
  showOutro() { const __self = this;
         var outro = null;
         main.achievementDispatcher.gameWon();
         outro = new Outro();
         (as3as(this.fsmAplication.getActualState(), BasicState)).persistency = outro;
         main.gameHolder.addChild(outro);
         outro.onNext.add(Util.l(main.waitForResourcesJakeLess,[],function()
         {
            main.saveSystem.onFirstPlay();
            __self.fsmAplication.takeTransition("next");
         }));
         outro.onBack.add(Util.l(main.waitForResources,[],function()
         {
            __self.fsmAplication.takeTransition("next");
         }));
         outro.enter();
      }
  removeOutro() {
         var outro = as3as((as3as(this.fsmAplication.getActualState(), BasicState)).persistency, Outro);
         outro.exit();
      }
  loadGame() { const __self = this;
         var gameView = null;
         main.theTutorial = new Tutorial();
         main.game = new Game();
         main.game.enter();
         if(main.activeBonus != null)
         {
            main.activeBonus.activate();
         }
         gameView = new GameView();
         main.gameHolder["gameView"] = gameView;
         main.gameHolder.addChild(gameView);
         gameView.onExit.add(Util.l(main.waitForResources,[],function()
         {
            __self.fsmAplication.takeTransition("toMainMenu");
         }));
         gameView.onEnd.add(Util.l(main.waitForResources,[],function()
         {
            __self.fsmAplication.takeTransition("endGame");
         }));
         gameView.start();
         main.theTutorial.next();
         main.achievementDispatcher.gamePlayed();
      }
  leaveGame() {
         var gameView = main.gameHolder["gameView"];
         gameView.exit();
         main.drag.clear();
         main.game.exit();
      }
}
main.prototype.fsmAplication = null;
bindMethods(main);
