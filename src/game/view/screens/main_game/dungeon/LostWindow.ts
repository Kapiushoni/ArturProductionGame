// @ts-nocheck
import { Dictionary, __DEFER, bindMethods, int, uint } from '@/flash/as3';
import { AnimatedScreen } from '@/game/view/screens/AnimatedScreen';
import { ButtonGroup } from '@/game/cb/data/ButtonGroup';
import { Signal } from '@/game/cb/signals/Signal';
import { Tween } from '@/game/cb/utils/Tween';
import { main } from '@/game/main';
import { Buttons } from '@/game/util/Buttons';
import { Util } from '@/game/util/Util';
import { LevelUp } from '@/game/view/popUp/LevelUp';

export class LostWindow extends AnimatedScreen {
  declare onReplay: any;
  declare onBackToMap: any;
  declare experience: any;
  declare stats: any;
  constructor(stats) {super(__DEFER); 
          this.__init_AnimatedScreen(main.swfLoader.getClass("assets.LevelLose"),this.getButtonInfo());
         this.stats = stats;
         this.onReplay = new Signal();
         this.onBackToMap = new Signal();
         this.initialize();
      }
  getOnReplay() {
         return this.onReplay;
      }
  getOnBackToMap() {
         return this.onBackToMap;
      }
  putIn(displayObjectContainer) {
         displayObjectContainer.addChild(this);
      }
  pause() {
      }
  resume() {
      }
  initialize() { const __self = this;
         __self.bg.total.total_xp.numbers.gotoAndStop(1);
         __self.bg.total.total.title.text = main.locale.get("lose_combat",[this.stats.level.getName()]);
         this.xp = 0;
      }
  get xp() {
         return int(this.experience);
      }
  set xp(value) { value = int(value); const __self = this;
         this.experience = int(value);
         __self.bg.total.total_xp.numbers.title.text = main.locale.get("lose_xp_amount",[this.experience]);
      }
  enter(callback = null) { const __self = this;
         super.enter(Util.l(this.showStats,callback));
         Buttons.setButtons(__self.bg,["replay","level_select"],true);
      }
  showStats(callback = null) { const __self = this;
         var end = callback;
         if(end != null)
         {
            end();
         }
         Tween.to(this,1000,{"xp":this.stats.getCombatExperience()},function()
         {
            __self.bg.total.total_xp.numbers.gotoAndPlay(1);
            __self.giveXp();
         });
      }
  giveXp() {
         var stats = main.game.getJinn().stats;
         var level = uint(stats.getLevel());
         stats.addXP(this.stats.getCombatExperience());
         if(level < stats.getLevel())
         {
            new LevelUp();
         }
      }
  getButtonInfo() {
         var dict = new Dictionary();
         var buttonGroup = ButtonGroup.get("gui");
         dict.set("replay", buttonGroup.createButton(this.replay,"mouseOver","mouseOut"));
         dict.set("level_select", buttonGroup.createButton(this.back,"mouseOver","mouseOut"));
         return dict;
      }
  replay(event) {
         this.emitAndLeave(this.onReplay);
      }
  back(event) {
         this.emitAndLeave(this.onBackToMap);
      }
  emitAndLeave(signal2) { const __self = this;
         var signal = signal2;
         this.killTweens();
         Buttons.setButtons(__self.bg,["replay","level_select"],false);
         signal.emit();
         __self.leave(function()
         {
            __self.exit();
         });
      }
  killTweens() {
         if(Tween.isTweening(this))
         {
            Tween.killTweensOf(this);
            this.giveXp();
         }
      }
  exit() { const __self = this;
         this.onBackToMap.clear();
         this.onReplay.clear();
         this.stats = null;
         __self.removeEvents();
         __self.pop();
      }
}
LostWindow.prototype.onReplay = null;
LostWindow.prototype.onBackToMap = null;
LostWindow.prototype.experience = 0;
LostWindow.prototype.stats = null;
bindMethods(LostWindow);
