// @ts-nocheck
import { bindMethods, uint } from '@/flash/as3';
import { TutorialStep } from '@/game/tutorial/steps/TutorialStep';
import { main } from '@/game/main';
import { TutorialViewWithOk } from '@/game/tutorial/view/TutorialViewWithOk';

export class StatTutorialStep extends TutorialStep {
  constructor(num, tutorial) {
          super(num.toString(),tutorial,num,"assets.Tutorial" + num.toString()); num = uint(num);
      }
  enter() {
         super.enter();
      }
  createView(text) {
         return new TutorialViewWithOk(main.swfLoader.getClass(text));
      }
  setText(clip) {
         clip.title.title.text = main.locale.get("tutorialStats");
         clip.text1.text.text = main.locale.get("tutorialStatsHealth");
         clip.text2.text.text = main.locale.get("tutorialStatsAttack");
         clip.text3.text.text = main.locale.get("tutorialStatsDefense");
         clip.text4.text.text = main.locale.get("tutorialStatsLuck");
      }
  leave() {
         super.leave();
         main.game.getShmabledum().selfAdvertise();
      }
}
bindMethods(StatTutorialStep);
