import { bindMethods } from '@/flash/as3';
import { TutorialStep } from '@/game/tutorial/steps/TutorialStep';
import { main } from '@/game/main';
import { TutorialViewWithOk } from '@/game/tutorial/view/TutorialViewWithOk';
import type { Tutorial } from '@/game/tutorial/Tutorial';

/** Step 2: explains the stats (closed with OK); afterwards the shmabledum says "click me for advice". */
export class StatTutorialStep extends TutorialStep {
  constructor(step: number, tutorial: Tutorial) {
    super(step.toString(), tutorial, step, 'assets.Tutorial' + step.toString());
  }
  createView(viewClass: string): TutorialViewWithOk {
    return new TutorialViewWithOk(main.swfLoader.getClass(viewClass));
  }
  setText(clip: any) {
    clip.title.title.text = main.locale.get('tutorialStats');
    clip.text1.text.text = main.locale.get('tutorialStatsHealth');
    clip.text2.text.text = main.locale.get('tutorialStatsAttack');
    clip.text3.text.text = main.locale.get('tutorialStatsDefense');
    clip.text4.text.text = main.locale.get('tutorialStatsLuck');
  }
  leave() {
    super.leave();
    main.game.getShmabledum().selfAdvertise();
  }
}
bindMethods(StatTutorialStep);
