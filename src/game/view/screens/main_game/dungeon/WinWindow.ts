// @ts-nocheck
import { Dictionary, __DEFER, bindMethods, int, uint } from '@/flash/as3';
import { AnimatedScreen } from '@/game/view/screens/AnimatedScreen';
import { ButtonGroup } from '@/game/cb/data/ButtonGroup';
import { Signal } from '@/game/cb/signals/Signal';
import { Tween } from '@/game/cb/utils/Tween';
import { main } from '@/game/main';
import { GameSounds } from '@/game/sound/GameSounds';
import { Buttons } from '@/game/util/Buttons';
import { Util } from '@/game/util/Util';
import { LevelUp } from '@/game/view/popUp/LevelUp';
import { LootView } from '@/game/view/screens/main_game/dungeon/LootView';

export class WinWindow extends AnimatedScreen {
  static onShow = null;
  static readonly COMBAT = int(0);
  static readonly CRITICAL = int(1);
  static readonly MIX = int(2);
  static readonly TOTAL = int(3);
  static readonly COMBAT_BONUS = "combat_experience";
  static readonly MIX_BONUS = "mix_bonus";
  static readonly CRITICAL_BONUS = "hit_bonus";
  static readonly TOTAL_BONUS = "total";
  declare onReplay: any;
  declare onBackToMap: any;
  declare onNext: any;
  declare loot: any;
  declare values: any;
  declare stats: any;
  constructor(loot, stats, onNext = null) {super(__DEFER); const __self = this; 
          this.__init_AnimatedScreen(main.swfLoader.getClass("assets.LevelWin"),this.getButtonInfo());
         this.stats = stats;
         this.loot = new LootView(loot,__self.bg);
         this.onReplay = new Signal();
         this.onBackToMap = new Signal();
         this.onNext = onNext;
         this.values = new Array(0,0,0,0);
         this.initialize();
      }
  pause() {
         this.loot.pause();
      }
  resume() {
         this.loot.resume();
      }
  get lootMcButton() {
         return this.bg.loot;
      }
  getOnReplay() {
         return this.onReplay;
      }
  getOnBackToMap() {
         return this.onBackToMap;
      }
  putIn(displayObjectContainer) {
         displayObjectContainer["window"] = this;
         displayObjectContainer.addChild(this);
      }
  get infoMc() { const __self = this;
         return __self.bg.info;
      }
  initialize() {
         this.infoMc[WinWindow.COMBAT_BONUS + "_xp"].gotoAndStop(1);
         this.infoMc[WinWindow.MIX_BONUS + "_xp"].gotoAndStop(1);
         this.infoMc[WinWindow.CRITICAL_BONUS + "_xp"].gotoAndStop(1);
         this.infoMc[WinWindow.TOTAL_BONUS + "_xp"].gotoAndStop(1);
         this.combatXp = 0;
         this.criticalXp = 0;
         this.mixXp = 0;
         this.totalXp = 0;
         this.infoMc[WinWindow.COMBAT_BONUS].title.text = main.locale.get("win_combat");
         this.infoMc[WinWindow.CRITICAL_BONUS].title.text = main.locale.get("win_critical_bonus");
         this.infoMc[WinWindow.MIX_BONUS].title.text = main.locale.get("win_mix_bonus");
         this.infoMc[WinWindow.TOTAL_BONUS].title.text = main.locale.get("win_total",[this.stats.level.getName()]);
      }
  set combatXp(value) { value = int(value);
         this.values[WinWindow.COMBAT] = value;
         this.infoMc[WinWindow.COMBAT_BONUS + "_xp"].numbers.title.text = main.locale.get("win_xp_amount",[value]);
      }
  get combatXp() {
         return int(this.values[WinWindow.COMBAT]);
      }
  set criticalXp(value) { value = int(value);
         this.values[WinWindow.CRITICAL] = value;
         this.infoMc[WinWindow.CRITICAL_BONUS + "_xp"].numbers.title.text = main.locale.get("win_xp_amount",[value]);
      }
  get criticalXp() {
         return int(this.values[WinWindow.CRITICAL]);
      }
  set mixXp(value) { value = int(value);
         this.values[WinWindow.MIX] = value;
         this.infoMc[WinWindow.MIX_BONUS + "_xp"].numbers.title.text = main.locale.get("win_xp_amount",[value]);
      }
  get mixXp() {
         return int(this.values[WinWindow.MIX]);
      }
  set totalXp(value) { value = int(value);
         this.values[WinWindow.TOTAL] = value;
         this.infoMc[WinWindow.TOTAL_BONUS + "_xp"].numbers.title.text = main.locale.get("win_xp_amount",[this.values[WinWindow.TOTAL]]);
      }
  get totalXp() {
         return int(this.values[WinWindow.TOTAL]);
      }
  enter(callback = null) { const __self = this;
         super.enter(Util.l(this.showStats,callback));
         Buttons.setButtons(__self.bg,["replay","level_select","loot","next"],true);
         if(this.onNext == null)
         {
            __self.bg.removeChild(__self.bg["next"]);
         }
         main.soundManager.playMusic(GameSounds.WIN_MUSIC);
      }
  leave(callback = null) {
         this.loot.pause();
         main.soundManager.stopFx(GameSounds.DUNGEON_COMPLETED);
         main.soundManager.stopMusic(GameSounds.WIN_MUSIC);
         super.leave(Util.concatenate(this.loot.clear,callback));
      }
  showStats(callback = null) {
         if(callback != null)
         {
            callback();
         }
         this.loot.showLoot();
         this.updateProperty("combatXp",this.stats.getCombatExperience(),WinWindow.COMBAT_BONUS,Util.l(this.updateProperty,"criticalXp",this.stats.getCriticalExperience(),WinWindow.CRITICAL_BONUS,Util.l(this.updateProperty,"mixXp",this.stats.getMixExperience(),WinWindow.MIX_BONUS,Util.l(this.updateProperty,"totalXp",this.stats.getDungeonExperience(),WinWindow.TOTAL_BONUS,this.giveXp))));
         if(WinWindow.onShow != null)
         {
            WinWindow.onShow();
         }
      }
  giveXp() {
         var stats = main.game.getJinn().stats;
         var level = uint(stats.getLevel());
         stats.addXP(this.stats.getDungeonExperience());
         if(level < stats.getLevel())
         {
            new LevelUp();
         }
      }
  updateProperty(text, num, text2, callback) { num = int(num);
         var obj = null;
         if(num == this[text])
         {
            callback();
         }
         else
         {
            obj = new Object();
            obj[text] = num;
            Tween.to(this,700,obj,Util.l(this.makeFinalCountAnimation,this.infoMc[text2 + "_xp"],callback));
         }
      }
  makeFinalCountAnimation(clip, callback) {
         clip.gotoAndPlay(1);
         callback();
      }
  getButtonInfo() {
         var dict = new Dictionary();
         var buttonGroup = ButtonGroup.get("gui");
         dict.set("replay", buttonGroup.createButton(this.replay,"mouseOver","mouseOut"));
         dict.set("level_select", buttonGroup.createButton(this.toMap,"mouseOver","mouseOut"));
         dict.set("next", buttonGroup.createButton(this.next,"mouseOver","mouseOut"));
         dict.set("loot", buttonGroup.createButton(this.takeAllLoot,"mouseOver","mouseOut"));
         return dict;
      }
  takeAllLoot(event) { const __self = this;
         this.loot.takeAll();
         Buttons.setButtons(__self.bg,["loot"],!this.loot.isEmpty());
      }
  replay(event) { const __self = this;
         var me = event;
         this.stopTweens();
         Buttons.setButtons(__self.bg,["replay","level_select","loot"],false);
         if(this.onNext != null)
         {
            Buttons.setButtons(__self.bg,["next"],false);
         }
         this.onReplay.emit();
         this.leave(function()
         {
            __self.exit();
         });
      }
  toMap(event) { const __self = this;
         var me = event;
         this.stopTweens();
         Buttons.setButtons(__self.bg,["replay","level_select","loot"],false);
         if(this.onNext != null)
         {
            Buttons.setButtons(__self.bg,["next"],false);
         }
         this.onBackToMap.emit();
         this.leave(function()
         {
            __self.exit();
         });
      }
  next(event) { const __self = this;
         var me = event;
         this.stopTweens();
         Buttons.setButtons(__self.bg,["replay","level_select","loot"],false);
         if(this.onNext != null)
         {
            Buttons.setButtons(__self.bg,["next"],false);
            this.onNext();
         }
         this.leave(function()
         {
            __self.exit();
         });
      }
  stopTweens() {
         if(Tween.isTweening(this))
         {
            Tween.killTweensOf(this);
            this.giveXp();
         }
      }
  exit() { const __self = this;
         this.loot = null;
         this.stats = null;
         this.onBackToMap.clear();
         this.onReplay.clear();
         this.onNext = null;
         __self.removeEvents();
         __self.pop();
      }
}
WinWindow.prototype.onReplay = null;
WinWindow.prototype.onBackToMap = null;
WinWindow.prototype.onNext = null;
WinWindow.prototype.loot = null;
WinWindow.prototype.values = null;
WinWindow.prototype.stats = null;
bindMethods(WinWindow);
