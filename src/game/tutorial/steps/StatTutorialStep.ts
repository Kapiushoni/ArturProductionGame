import { bindMethods } from '@/flash/as3';
import { TutorialStep } from '@/game/tutorial/steps/TutorialStep';
import { app } from '@/game/app';
import { TutorialViewWithOk } from '@/game/tutorial/view/TutorialViewWithOk';
import type { Tutorial } from '@/game/tutorial/Tutorial';
import type { MovieClip } from '@/flash/as3';

/** Step 2: explains the stats (closed with OK); afterwards the shmabledum says "click me for advice". */
export class StatTutorialStep extends TutorialStep {
  constructor(step: number, tutorial: Tutorial) {
    super(step.toString(), tutorial, step, 'assets.Tutorial' + step.toString());
  }
  createView(viewClass: string): TutorialViewWithOk {
    return new TutorialViewWithOk(app.swfLoader.getClass(viewClass));
  }
  setText(clip: MovieClip) {
    clip.title.title.text = app.locale.get('tutorialStats');
    clip.text1.text.text = app.locale.get('tutorialStatsHealth');
    clip.text2.text.text = app.locale.get('tutorialStatsAttack');
    clip.text3.text.text = app.locale.get('tutorialStatsDefense');
    clip.text4.text.text = app.locale.get('tutorialStatsLuck');
  }
  leave() {
    super.leave();
    app.game.getShmabledum().selfAdvertise();
  }
}
bindMethods(StatTutorialStep, ['leave']);
