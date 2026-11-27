import { MovieClip, as3as, bindMethods, int } from '@/flash/as3';
import { Log } from '@/game/cb/logger/Log';
import type { DiFile } from '@/game/bonus/DiFile';
import { Functor } from '@/game/cb/actions/Functor';
import { AnimationFrameAt } from '@/game/cb/conditions/AnimationFrameAt';
import { Locale } from '@/game/cb/data/Locale';
import { SmartMC } from '@/game/cb/display/SmartMC';
import { SwfLibrary } from '@/game/cb/display/SwfLibrary';
import { SoundLoader } from '@/game/cb/media/SoundLoader';
import { Signal } from '@/game/cb/signals/Signal';
import { Rule } from '@/game/cb/utils/Rule';
import { app } from '@/game/app';
import { Experience } from '@/game/main_game/character/stats/Experience';
import { DungeonFactory } from '@/game/main_game/dungeon/DungeonFactory';
import { MixStrategy } from '@/game/main_game/mixer/MixStrategy';
import { loadCsv, loadDi } from '@/game/loader/files';
import type { DisplayObjectContainer } from '@/flash/as3';

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
  /** the preloader screen clip */
  private preloader: MovieClip = null;
  private bg: DisplayObjectContainer;

  constructor(bg: DisplayObjectContainer) {
    this.bg = bg;
    this.initSignals();
  }
  start() {
    Preloader.log.log('load');
    Promise.all([SwfLibrary.load(['PreloaderAP.swf']), Locale.load('locale.txt')]).then(([swfs, locale]) =>
      this.preloadComplete(swfs, locale),
    );
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
  preloadComplete(swfs: SwfLibrary, locale: Locale) {
    Preloader.log.log('preloadingComplete');
    this.preloader = as3as(swfs.getObject('assets.PreloaderAP'), MovieClip);
    this.preloader.width = 700;
    this.preloader.height = 500;
    this.preloader.stop();
    this.bg.addChild(this.preloader);
    this.onLocaleLoaded.emit(locale);
    this.onLocaleLoaded.clear();
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

    SwfLibrary.load('swfs.txt', this.loadingProgress).then(this.loadComplete);
    const csv = (file: string, onLoaded: (rows: any) => void) => loadCsv(file).then(onLoaded);
    csv('characters.csv', this.charactersComplete);
    csv('jinnXP.csv', this.levelingComplete);
    csv('mix.csv', this.mixComplete);
    csv('items.csv', this.itemsComplete);
    const di = (file: string, onLoaded: (di: DiFile) => void) => loadDi(file).then(onLoaded);
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
  configComplete(config: DiFile) {
    Preloader.log.log('config Loaded');
    this.onConfigLoaded.emit(config);
    this.onConfigLoaded.clear();
    this.rule.check('config');
  }
  bonusComplete(bonus: DiFile) {
    Preloader.log.log('bonus Loaded');
    app.setDailyBonus(bonus);
    this.rule.check('bonus');
  }
  dungeonsComplete(rows: any) {
    Preloader.log.log('dungeons Loaded');
    this.onDungeonsLoaded.emit(rows);
    this.onDungeonsLoaded.clear();
    this.rule.check('dungeons');
  }
  lootComplete(rows: any) {
    Preloader.log.log('First loot Complete');
    DungeonFactory.firstLoot = rows;
    this.rule.check('firstLoot');
  }
  charactersComplete(rows: any) {
    Preloader.log.log('characters Loaded');
    this.onCharactersLoaded.emit(rows);
    this.onCharactersLoaded.clear();
    this.rule.check('characters');
  }
  levelingComplete(rows: any) {
    Preloader.log.log('leveling Loaded');
    Experience.configuration = rows;
    this.rule.check('jinn_level');
  }
  mixComplete(rows: any) {
    Preloader.log.log('mix Loaded');
    MixStrategy.config = rows;
    this.rule.check('mix');
  }
  itemsComplete(rows: any) {
    Preloader.log.log('items Loaded');
    this.onItemsLoaded.emit(rows);
    this.onItemsLoaded.clear();
    this.rule.check('items');
  }
  loadComplete(swfs: SwfLibrary) {
    Preloader.log.log('Swf Loaded');
    this.onSwfLoaded.emit(swfs);
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
bindMethods(Preloader, [
  'start',
  'soundLoadingCompleted',
  'configComplete',
  'bonusComplete',
  'dungeonsComplete',
  'lootComplete',
  'charactersComplete',
  'levelingComplete',
  'mixComplete',
  'itemsComplete',
  'loadComplete',
  'loadingProgress',
  'pop',
  'clear',
  'endPreloader',
  'emitFinish',
]);
