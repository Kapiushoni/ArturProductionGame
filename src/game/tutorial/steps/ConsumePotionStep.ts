import { Timer, TimerEvent, as3as, bindMethods } from '@/flash/as3';
import { TutorialStep } from '@/game/tutorial/steps/TutorialStep';
import { app } from '@/game/app';
import { StatType } from '@/game/main_game/character/stats/StatType';
import { DungeonView } from '@/game/view/screens/main_game/dungeon/DungeonView';
import { GameView } from '@/game/view/screens/main_game/GameView';
import type { Tutorial } from '@/game/tutorial/Tutorial';

/**
 * Step 3: half a second after the jinn first loses health, the fight is paused, the potions unlocked and
 * "drink a potion" shown; the window closes (and the fight resumes) when the health goes up.
 */
export class ConsumePotionStep extends TutorialStep {
  private initialHealth = NaN;
  private timer: Timer = null;
  private started = false;

  constructor(step: number, tutorial: Tutorial) {
    super(step.toString(), tutorial, step, 'assets.Tutorial' + step.toString());
  }
  private get health(): number {
    return Number(app.game.getJinn().stats.getStat(StatType.HEALTH).getValue());
  }
  /** waits for the first hit (the window is shown later, by triggerTutorial) */
  enter() {
    app.game.getJinn().stats.onChange.add(this.statsChange);
    this.initialHealth = this.health;
  }
  statsChange() {
    const health = this.health;
    if (this.initialHealth > health && health > 0 && this.timer == null) {
      this.started = true;
      this.timer = new Timer(500, 1);
      this.timer.addEventListener(TimerEvent.TIMER_COMPLETE, this.triggerTutorial);
      this.timer.start();
    } else if (this.started && this.initialHealth < health) {
      this.removeTimer();
      this.theView.leave();
    }
  }
  triggerTutorial(_event: any) {
    this.tut.unlockPotions();
    this.removeTimer();
    this.initialHealth = this.health;
    this.stopFight();
    super.enter();
  }
  removeTimer() {
    if (this.timer == null) {
      return;
    }
    this.timer.stop();
    this.timer.removeEventListener(TimerEvent.TIMER_COMPLETE, this.triggerTutorial);
    this.timer = null;
  }
  setText(clip: any) {
    clip.title.title.text = app.locale.get('tutorialConsumablesTitle');
    clip.text.text.text = app.locale.get('tutorialConsumables');
  }
  /** the fight scene clip of the dungeon view */
  get arena(): any {
    return as3as(as3as(app.gameHolder.gameView, GameView).up_holder.game.dungeonView, DungeonView).background.arena;
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
    app.game.getJinn().stats.onChange.remove(this.statsChange);
    this.resumeFight();
    this.removeTimer();
    super.leave();
  }
  clear() {
    super.clear();
    this.removeTimer();
    app.game.getJinn().stats.onChange.remove(this.statsChange);
  }
}
bindMethods(ConsumePotionStep);
