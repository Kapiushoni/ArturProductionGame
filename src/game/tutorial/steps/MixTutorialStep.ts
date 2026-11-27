import { bindMethods } from '@/flash/as3';
import { TutorialStep } from '@/game/tutorial/steps/TutorialStep';
import { app } from '@/game/app';
import { TutorialViewWithOk } from '@/game/tutorial/view/TutorialViewWithOk';
import type { Tutorial } from '@/game/tutorial/Tutorial';

/** Step 6: "mix two items" (closes when a mix starts, or with OK). */
export class MixTutorialStep extends TutorialStep {
  constructor(step: number, tutorial: Tutorial) {
    super(step.toString(), tutorial, step, 'assets.Tutorial' + step.toString());
  }
  createView(viewClass: string): TutorialViewWithOk {
    return new TutorialViewWithOk(app.swfLoader.getClass(viewClass));
  }
  setText(clip: any) {
    clip.title.title.text = app.locale.get('tutorialMixTitle');
    clip.text.text.text = app.locale.get('tutorialMix');
  }
  enter() {
    super.enter();
    this.theView.bg.removeChild(this.theView.bg.glow);
    app.game.getMixer().onMixStart.add(this.theView.leave);
  }
  leave() {
    app.game.getMixer().onMixStart.remove(this.theView.leave);
    super.leave();
  }
  clear() {
    app.game.getMixer().onMixStart.remove(this.theView.leave);
  }
}
bindMethods(MixTutorialStep);
