// @ts-nocheck
import { Timer, TimerEvent, as3as, bindMethods, uint } from '@/flash/as3';
import { TutorialStep } from '@/game/tutorial/steps/TutorialStep';
import { main } from '@/game/main';
import { StatType } from '@/game/main_game/character/stats/StatType';
import { DungeonView } from '@/game/view/screens/main_game/dungeon/DungeonView';
import { GameView } from '@/game/view/screens/main_game/GameView';

export class ConsumePotionStep extends TutorialStep {
  declare initialHealth: any;
  declare timer: any;
  declare started: any;
  constructor(num, tutorial) {
          super(num.toString(),tutorial,num,"assets.Tutorial" + num.toString()); num = uint(num);
         this.started = false;
      }
  enter() {
         main.game.getJinn().stats.onChange.add(this.statsChange);
         this.initialHealth = Number(main.game.getJinn().stats.getStat(StatType.HEALTH).getValue());
      }
  statsChange() { const __self = this;
         var value = Number(main.game.getJinn().stats.getStat(StatType.HEALTH).getValue());
         if(this.initialHealth > value && value > 0 && this.timer == null)
         {
            this.started = true;
            this.timer = new Timer(500,1);
            this.timer.addEventListener(TimerEvent.TIMER_COMPLETE,this.triggerTutorial);
            this.timer.start();
         }
         else if(this.started && this.initialHealth < value)
         {
            this.removeTimer();
            __self.theView.leave();
         }
      }
  triggerTutorial(event) {
         this.tut.unlockPotions();
         this.removeTimer();
         this.initialHealth = Number(main.game.getJinn().stats.getStat(StatType.HEALTH).getValue());
         this.stopFight();
         super.enter();
      }
  removeTimer() {
         if(this.timer == null)
         {
            return;
         }
         this.timer.stop();
         this.timer.removeEventListener(TimerEvent.TIMER_COMPLETE,this.triggerTutorial);
         this.timer = null;
      }
  setText(clip) {
         clip.title.title.text = main.locale.get("tutorialConsumablesTitle");
         clip.text.text.text = main.locale.get("tutorialConsumables");
      }
  get arena() {
         return (as3as((as3as(main.gameHolder.gameView, GameView)).up_holder.game.dungeonView, DungeonView)).background.arena;
      }
  stopFight() {
         this.arena.jinn.stop();
         this.arena.enemy.enemy.stop();
      }
  resumeFight() {
         this.arena.jinn.play();
         this.arena.enemy.enemy.play();
      }
  leave() {
         main.game.getJinn().stats.onChange.remove(this.statsChange);
         this.resumeFight();
         this.removeTimer();
         super.leave();
      }
  clear() {
         super.clear();
         this.removeTimer();
         main.game.getJinn().stats.onChange.remove(this.statsChange);
      }
}
ConsumePotionStep.prototype.initialHealth = NaN;
ConsumePotionStep.prototype.timer = null;
ConsumePotionStep.prototype.started = false;
bindMethods(ConsumePotionStep);
