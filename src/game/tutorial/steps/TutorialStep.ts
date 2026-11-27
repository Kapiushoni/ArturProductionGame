import { bindMethods, uint } from '@/flash/as3';
import { BasicState } from '@/game/aplication/BasicState';
import { main } from '@/game/main';
import { TutorialView } from '@/game/tutorial/view/TutorialView';
import type { Tutorial } from '@/game/tutorial/Tutorial';

/**
 * A tutorial step (a state of the Tutorial FSM, named by its number). By default entering shows its
 * window; subclasses wait for the right moment instead. When the window closes the tutorial moves on,
 * and leaving saves the step as completed. The shmabledum is quiet while a step window is shown.
 */
export class TutorialStep extends BasicState {
  private step: number;
  protected tut: Tutorial;
  protected theView: TutorialView;

  /** viewClass: library class of the step window ("assets.Tutorial<N>") */
  constructor(name: string, tut: Tutorial, step: number, viewClass: string) {
    super(name);
    this.step = uint(step);
    this.tut = tut;
    this.theView = this.createView(viewClass);
    this.theView.onEnd.add(this.endStep);
  }
  enter() {
    this.showView();
    super.enter();
  }
  createView(viewClass: string): TutorialView {
    return new TutorialView(main.swfLoader.getClass(viewClass));
  }
  showView() {
    main.game.getShmabledum().getLocker().lock();
    main.tutorialHolder.addChild(this.theView);
    this.theView.enter();
    this.setText(this.theView.bg);
  }
  /** fills the texts of the window clip */
  setText(_clip: any) {}
  endStep() {
    this.tut.next();
  }
  leave() {
    main.game.getShmabledum().getLocker().unlock();
    main.saveSystem.onTutorialComplete(this.step);
  }
  clear() {
    super.clear();
    this.theView.clear();
    this.tut = null;
    this.theView = null;
  }
}
bindMethods(TutorialStep);
