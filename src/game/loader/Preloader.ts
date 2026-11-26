// @ts-nocheck
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

export class Preloader {
  static log = Log.getLogger("Preloader");
  static TO_LOAD = int(14680858);
  declare onLocaleLoaded: any;
  declare onSwfLoaded: any;
  declare onSoundLoaded: any;
  declare onConfigLoaded: any;
  declare onCharactersLoaded: any;
  declare onDungeonsLoaded: any;
  declare onItemsLoaded: any;
  declare onLevelsLoaded: any;
  declare onFinishLoading: any;
  declare loadedSoFar: any;
  declare rule: any;
  declare preloadingObject: any;
  declare preloader: any;
  declare bg: any;
  constructor(bg) {
         
         this.bg = bg;
         this.initSignals();
      }
  start() {
         this.preloadingObject = new LoadingObject({
            "swfs":["PreloaderAP.swf"],
            "locale":"locale.txt"
         });
         this.preloadingObject.loaded.add(this.preloadComplete);
         this.preloadingObject.load();
         Preloader.log.log("load");
      }
  initSignals() {
         this.onLocaleLoaded = new Signal();
         this.onSwfLoaded = new Signal();
         this.onSoundLoaded = new Signal();
         this.onConfigLoaded = new Signal();
         this.onCharactersLoaded = new Signal();
         this.onDungeonsLoaded = new Signal();
         this.onItemsLoaded = new Signal();
         this.onLevelsLoaded = new Signal();
         this.onFinishLoading = new Signal();
      }
  preloadComplete(loadingObject) {
         Preloader.log.log("preloadingComplete");
         var swfLoader = loadingObject.getSwfLoader();
         this.preloader = as3as(swfLoader.getObject("assets.PreloaderAP"), MovieClip);
         this.preloader.width = 700;
         this.preloader.height = 500;
         this.preloader.stop();
         this.bg.addChild(this.preloader);
         this.onLocaleLoaded.emit(loadingObject.getLocale());
         this.onLocaleLoaded.clear();
         this.preloadingObject.loaded.clear();
         this.preloadingObject = null;
         this.loadedSoFar = int(0);
         this.rule = new Rule("swf","characters","items","config","dungeons","mix","jinn_level","sounds","bonus","firstLoot");
         this.rule.completed.add(this.endPreloader);
         var swfBulkLoader = new SwfBulkLoader("swfs.txt");
         swfBulkLoader.progress.add(this.loadingProgress);
         swfBulkLoader.loaded.add(this.loadComplete);
         swfBulkLoader.load();
         var csvLoader = new CsvLoader("characters.csv");
         csvLoader.loaded.add(this.charactersComplete);
         csvLoader.load();
         var csvLoader2 = new CsvLoader("jinnXP.csv");
         csvLoader2.loaded.add(this.levelingComplete);
         csvLoader2.load();
         var csvLoader3 = new CsvLoader("mix.csv");
         csvLoader3.loaded.add(this.mixComplete);
         csvLoader3.load();
         var csvLoader4 = new CsvLoader("items.csv");
         csvLoader4.loaded.add(this.itemsComplete);
         csvLoader4.load();
         var fileLoader = new FileLoader("config.di");
         fileLoader.addEventListener(Event.COMPLETE,this.configComplete);
         fileLoader.load();
         var fileLoader2 = new FileLoader("dailyBonus.di");
         fileLoader2.addEventListener(Event.COMPLETE,this.bonusComplete);
         fileLoader2.load();
         var csvLoader5 = new CsvLoader("dungeons.csv");
         csvLoader5.loaded.add(this.dungeonsComplete);
         csvLoader5.load();
         var csvLoader6 = new CsvLoader("firstLoot.csv");
         csvLoader6.loaded.add(this.lootComplete);
         csvLoader6.load();
         var soundLoader = new SoundLoader("sounds.snd");
         soundLoader.progress.add(this.loadingProgress);
         soundLoader.loaded.add(this.soundLoadingCompleted);
         soundLoader.load();
      }
  soundLoadingCompleted(soundLoader) {
         Preloader.log.log("Sounds Loaded");
         soundLoader.loaded.clear();
         this.onSoundLoaded.emit(soundLoader);
         this.onSoundLoaded.clear();
         this.rule.check("sounds");
      }
  levelsComplete(event) {
         Preloader.log.log("Levels Loaded");
         event.currentTarget.removeEventListener(Event.COMPLETE,this.levelsComplete);
         this.onLevelsLoaded.emit(new ClassLoader(as3as(event.target, FileLoader)));
         this.onLevelsLoaded.clear();
         this.rule.check("levels");
      }
  configComplete(event) {
         Preloader.log.log("config Loaded");
         event.currentTarget.removeEventListener(Event.COMPLETE,this.configComplete);
         this.onConfigLoaded.emit(new ClassLoader(as3as(event.target, FileLoader)));
         this.onConfigLoaded.clear();
         this.rule.check("config");
      }
  bonusComplete(event) {
         Preloader.log.log("bonus Loaded");
         event.currentTarget.removeEventListener(Event.COMPLETE,this.bonusComplete);
         main.setDailyBonus(new ClassLoader(as3as(event.target, FileLoader)));
         this.rule.check("bonus");
      }
  dungeonsComplete(csvLoader) {
         Preloader.log.log("dungeons Loaded");
         this.onDungeonsLoaded.emit(csvLoader.convertToObjects());
         this.onDungeonsLoaded.clear();
         this.rule.check("dungeons");
      }
  lootComplete(csvLoader) {
         Preloader.log.log("First loot Complete");
         DungeonFactory.firstLoot = csvLoader.convertToObjects();
         this.rule.check("firstLoot");
      }
  charactersComplete(csvLoader) {
         Preloader.log.log("characters Loaded");
         this.onCharactersLoaded.emit(csvLoader.convertToObjects());
         this.onCharactersLoaded.clear();
         this.rule.check("characters");
      }
  levelingComplete(csvLoader) {
         Preloader.log.log("leveling Loaded");
         Experience.configuration = csvLoader.convertToObjects();
         this.rule.check("jinn_level");
      }
  mixComplete(csvLoader) {
         Preloader.log.log("mix Loaded");
         MixStrategy.config = csvLoader.convertToObjects();
         this.rule.check("mix");
      }
  itemsComplete(csvLoader) {
         Preloader.log.log("items Loaded");
         this.onItemsLoaded.emit(csvLoader.convertToObjects());
         this.onItemsLoaded.clear();
         this.rule.check("items");
      }
  loadComplete(swfBulkLoader) {
         Preloader.log.log("Swf Loaded");
         swfBulkLoader.loaded.clear();
         this.onSwfLoaded.emit(swfBulkLoader);
         this.onSwfLoaded.clear();
         this.rule.check("swf");
      }
  loadingProgress(num) { num = int(num);
         this.loadedSoFar = int(this.loadedSoFar + (num));
         Preloader.log.log("loadingProgress ",this.loadedSoFar);
         var num2 = int(this.loadedSoFar * 100 / Preloader.TO_LOAD);
         if(num2 > 100)
         {
            num2 = int(100);
         }
         this.preloader.done_mc.gotoAndStop(num2);
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
         this.onLevelsLoaded.clear();
         this.onLocaleLoaded.clear();
         this.onSoundLoaded.clear();
         this.onSwfLoaded.clear();
      }
  endPreloader() {
         this.preloader.done_mc.gotoAndStop(100);
         this.preloader.gotoAndPlay(3);
         var smartMC = new SmartMC(this.preloader);
         smartMC.trigger(new AnimationFrameAt(43),Functor.wrap(this.emitFinish));
      }
  emitFinish() {
         this.onFinishLoading.emit(this);
      }
}
Preloader.prototype.onLocaleLoaded = null;
Preloader.prototype.onSwfLoaded = null;
Preloader.prototype.onSoundLoaded = null;
Preloader.prototype.onConfigLoaded = null;
Preloader.prototype.onCharactersLoaded = null;
Preloader.prototype.onDungeonsLoaded = null;
Preloader.prototype.onItemsLoaded = null;
Preloader.prototype.onLevelsLoaded = null;
Preloader.prototype.onFinishLoading = null;
Preloader.prototype.loadedSoFar = 0;
Preloader.prototype.rule = null;
Preloader.prototype.preloadingObject = null;
Preloader.prototype.preloader = null;
Preloader.prototype.bg = null;
bindMethods(Preloader);
