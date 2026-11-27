import { bindMethods, int } from '@/flash/as3';
import { BasicState } from '@/game/aplication/BasicState';
import { FSM } from '@/game/aplication/FSM';
import { app } from '@/game/app';
import { ConsumePotionStep } from '@/game/tutorial/steps/ConsumePotionStep';
import { FirstTutorialStep } from '@/game/tutorial/steps/FirstTutorialStep';
import { MixInformationStep } from '@/game/tutorial/steps/MixInformationStep';
import { MixTutorialStep } from '@/game/tutorial/steps/MixTutorialStep';
import { StatTutorialStep } from '@/game/tutorial/steps/StatTutorialStep';
import { TakeAllStep } from '@/game/tutorial/steps/TakeAllStep';
import type { MixerView } from '@/game/view/screens/main_game/inventory/MixerView';

/**
 * The tutorial (app.theTutorial): steps 1-6 in order, then "7" = done. It resumes after the last completed
 * step (saved). Until the right step: potions locked (< 3), mixer disabled (< 5), trash locked (< 6).
 */
export class Tutorial {
  static readonly NEXT = 'next';
  private fsm: FSM;
  private mixKnown = false;

  constructor() {
    this.initializeFSM();
    this.fsm.addTransition('init', (app.saveSystem.tutorialStepCompleted() + 1).toString(), Tutorial.NEXT);
    this.fsm.start();
  }
  initializeFSM() {
    this.fsm = new FSM(new BasicState('init', null, this.startTutorial));
    this.fsm.addState(new FirstTutorialStep(1, this));
    this.fsm.addState(new StatTutorialStep(2, this));
    this.fsm.addState(new ConsumePotionStep(3, this));
    this.fsm.addState(new TakeAllStep(4, this));
    this.fsm.addState(new MixInformationStep(5, this));
    this.fsm.addState(new MixTutorialStep(6, this));
    this.fsm.addState(new BasicState('7', this.endTutorial));
    for (let step = 1; step <= 6; step++) {
      this.fsm.addTransition(String(step), String(step + 1), Tutorial.NEXT);
    }
  }
  /** leaving "init": locks what the player has not learned yet */
  startTutorial() {
    this.mixKnown = false;
    const completed = int(app.saveSystem.tutorialStepCompleted());
    if (completed < 3) {
      this.lockPotions();
    }
    if (completed < 5) {
      this.disableMix();
    }
    if (completed < 6) {
      this.lockTrash();
    }
  }
  isMixKnown(): boolean {
    return this.mixKnown;
  }
  lockTrash() {
    app.game.getInventory().getTrash().lock();
  }
  unlockTrash() {
    app.game.getInventory().getTrash().unlock();
  }
  get mixerView(): MixerView {
    return app.gameHolder.gameView.mixing;
  }
  enableMix() {
    this.mixKnown = true;
    this.mixerView.enable();
  }
  disableMix() {
    this.mixerView.disable();
  }
  /** keeps the potion slot locked even when a dungeon unlocks it */
  lockPotions() {
    app.game.getJinn().liver.onLock.add(this.lockLiver);
    this.lockLiver();
  }
  lockLiver(locked = false) {
    if (!locked) {
      app.game.getJinn().liver.lock();
    }
  }
  unlockPotions() {
    app.game.getJinn().liver.onLock.remove(this.lockLiver);
    app.game.getJinn().liver.unlock();
  }
  next() {
    this.fsm.takeTransition(Tutorial.NEXT);
  }
  endTutorial() {
    this.unlockTrash();
    this.enableMix();
    app.game.getShmabledum().getLocker().unlock();
  }
  clear() {
    this.fsm.clear();
  }
}
bindMethods(Tutorial, ['startTutorial', 'isMixKnown', 'lockLiver', 'next', 'endTutorial', 'clear']);
