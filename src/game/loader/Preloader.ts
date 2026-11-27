import { Event, MovieClip, as3as, bindMethods, int } from '@/flash/as3';
import { Log } from '@/game/cb/logger/Log';
import { ClassLoader } from '@/game/bonus/ClassLoader';
import { FileLoader } from '@/game/bonus/FileLoader';
import { Functor } from '@/game/cb/actions/Functor';
import { AnimationFrameAt } from '@/game/cb/conditions/AnimationFrameAt';
import { CsvLoader } from '@/game/cb/data/CsvLoader';
import { SmartMC } from '@/game/cb/display/SmartMC';
import { SwfBulkLoader } from '@/game/cb/display/SwfBulkLoader';
import { SoundLoader } from '@/game/cb/media/SoundLoader';
import { Signal } from '@/game/cb/signals/Signal';
import { LoadingObject } from '@/game/cb/utils/LoadingObject';
import { Rule } from '@/game/cb/utils/Rule';
import { main } from '@/game/main';
import { Experience } from '@/game/main_game/character/stats/Experience';
import { DungeonFactory } from '@/game/main_game/dungeon/DungeonFactory';
import { MixStrategy } from '@/game/main_game/mixer/MixStrategy';

/**
 * Loads everything the game needs at start: first the preloader screen and the texts, then (showing the
 * progress bar) the asset libraries, the data tables, config.di, dailyBonus.di and the sounds.
 * Each result goes out through its signal (onConfigLoaded, onItemsLoaded, ...); onFinishLoading at the end.
 */
export class Preloader {
  static log = Log.getLogger('Preloader');
  /** bytes expected, for the progress bar */
  static TO_LOAD = 14680858;
  onLocaleLoaded: Signal;
  onSwfLoaded: Signal;
  onSoundLoaded: Signal;
  onConfigLoaded: Signal;
  onCharactersLoaded: Signal;
  onDungeonsLoaded: Signal;
  onItemsLoaded: Signal;
  onFinishLoading: Signal;
  private loadedSoFar = 0;
  private rule: Rule = null;
  private preloadingObject: LoadingObject = null;
  /** the preloader screen clip */
  private preloader: any = null;
  private bg: any;

  constructor(bg: any) {
    this.bg = bg;
    this.initSignals();
  }
  start() {
    this.preloadingObject = new LoadingObject({ swfs: ['PreloaderAP.swf'], locale: 'locale.txt' });
    this.preloadingObject.loaded.add(this.preloadComplete);
    this.preloadingObject.load();
    Preloader.log.log('load');
  }
  initSignals() {
    this.onLocaleLoaded = new Signal();
    this.onSwfLoaded = new Signal();
    this.onSoundLoaded = new Signal();
    this.onConfigLoaded = new Signal();
    this.onCharactersLoaded = new Signal();
    this.onDungeonsLoaded = new Signal();
    this.onItemsLoaded = new Signal();
    this.onFinishLoading = new Signal();
  }
  /** the preloader screen and the texts are ready: show it and load the rest */
  preloadComplete(loadingObject: LoadingObject) {
    Preloader.log.log('preloadingComplete');
    this.preloader = as3as(loadingObject.getSwfLoader().getObject('assets.PreloaderAP'), MovieClip);
    this.preloader.width = 700;
    this.preloader.height = 500;
    this.preloader.stop();
    this.bg.addChild(this.preloader);
    this.onLocaleLoaded.emit(loadingObject.getLocale());
    this.onLocaleLoaded.clear();
    this.preloadingObject.loaded.clear();
    this.preloadingObject = null;
    this.loadedSoFar = 0;
    this.rule = new Rule(
      'swf',
      'characters',
      'items',
      'config',
      'dungeons',
      'mix',
      'jinn_level',
      'sounds',
      'bonus',
      'firstLoot',
    );
    this.rule.completed.add(this.endPreloader);

    const swfs = new SwfBulkLoader('swfs.txt');
    swfs.progress.add(this.loadingProgress);
    swfs.loaded.add(this.loadComplete);
    swfs.load();
    const csv = (file: string, onLoaded: Function) => {
      const loader = new CsvLoader(file);
      loader.loaded.add(onLoaded);
      loader.load();
    };
    csv('characters.csv', this.charactersComplete);
    csv('jinnXP.csv', this.levelingComplete);
    csv('mix.csv', this.mixComplete);
    csv('items.csv', this.itemsComplete);
    const di = (file: string, onLoaded: (event: any) => void) => {
      const loader = new FileLoader(file);
      loader.addEventListener(Event.COMPLETE, onLoaded);
      loader.load();
    };
    di('config.di', this.configComplete);
    di('dailyBonus.di', this.bonusComplete);
    csv('dungeons.csv', this.dungeonsComplete);
    csv('firstLoot.csv', this.lootComplete);
    const sounds = new SoundLoader('sounds.snd');
    sounds.progress.add(this.loadingProgress);
    sounds.loaded.add(this.soundLoadingCompleted);
    sounds.load();
  }
  soundLoadingCompleted(loader: SoundLoader) {
    Preloader.log.log('Sounds Loaded');
    loader.loaded.clear();
    this.onSoundLoaded.emit(loader);
    this.onSoundLoaded.clear();
    this.rule.check('sounds');
  }
  configComplete(event: any) {
    Preloader.log.log('config Loaded');
    event.currentTarget.removeEventListener(Event.COMPLETE, this.configComplete);
    this.onConfigLoaded.emit(new ClassLoader(as3as(event.target, FileLoader)));
    this.onConfigLoaded.clear();
    this.rule.check('config');
  }
  bonusComplete(event: any) {
    Preloader.log.log('bonus Loaded');
    event.currentTarget.removeEventListener(Event.COMPLETE, this.bonusComplete);
    main.setDailyBonus(new ClassLoader(as3as(event.target, FileLoader)));
    this.rule.check('bonus');
  }
  dungeonsComplete(loader: CsvLoader) {
    Preloader.log.log('dungeons Loaded');
    this.onDungeonsLoaded.emit(loader.convertToObjects());
    this.onDungeonsLoaded.clear();
    this.rule.check('dungeons');
  }
  lootComplete(loader: CsvLoader) {
    Preloader.log.log('First loot Complete');
    DungeonFactory.firstLoot = loader.convertToObjects();
    this.rule.check('firstLoot');
  }
  charactersComplete(loader: CsvLoader) {
    Preloader.log.log('characters Loaded');
    this.onCharactersLoaded.emit(loader.convertToObjects());
    this.onCharactersLoaded.clear();
    this.rule.check('characters');
  }
  levelingComplete(loader: CsvLoader) {
    Preloader.log.log('leveling Loaded');
    Experience.configuration = loader.convertToObjects();
    this.rule.check('jinn_level');
  }
  mixComplete(loader: CsvLoader) {
    Preloader.log.log('mix Loaded');
    MixStrategy.config = loader.convertToObjects();
    this.rule.check('mix');
  }
  itemsComplete(loader: CsvLoader) {
    Preloader.log.log('items Loaded');
    this.onItemsLoaded.emit(loader.convertToObjects());
    this.onItemsLoaded.clear();
    this.rule.check('items');
  }
  loadComplete(loader: SwfBulkLoader) {
    Preloader.log.log('Swf Loaded');
    loader.loaded.clear();
    this.onSwfLoaded.emit(loader);
    this.onSwfLoaded.clear();
    this.rule.check('swf');
  }
  loadingProgress(bytes: number) {
    this.loadedSoFar = int(this.loadedSoFar + int(bytes));
    Preloader.log.log('loadingProgress ', this.loadedSoFar);
    const percent = Math.min(100, int((this.loadedSoFar * 100) / Preloader.TO_LOAD));
    this.preloader.done_mc.gotoAndStop(percent);
  }
  pop() {
    this.bg.removeChild(this.preloader);
    this.clear();
  }
  clear() {
    this.bg = null;
    this.preloader = null;
    this.preloadingObject = null;
    this.onCharactersLoaded.clear();
    this.onConfigLoaded.clear();
    this.onDungeonsLoaded.clear();
    this.onFinishLoading.clear();
    this.onItemsLoaded.clear();
    this.onLocaleLoaded.clear();
    this.onSoundLoaded.clear();
    this.onSwfLoaded.clear();
  }
  /** everything loaded: full bar, play the end of the preloader animation, then onFinishLoading */
  endPreloader() {
    this.preloader.done_mc.gotoAndStop(100);
    this.preloader.gotoAndPlay(3);
    new SmartMC(this.preloader).trigger(new AnimationFrameAt(43), Functor.wrap(this.emitFinish));
  }
  emitFinish() {
    this.onFinishLoading.emit(this);
  }
}
bindMethods(Preloader);
