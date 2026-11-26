// @ts-nocheck
import { bindMethods, uint } from '@/flash/as3';
import { TutorialStep } from '@/game/tutorial/steps/TutorialStep';
import { main } from '@/game/main';
import { TutorialViewWithOk } from '@/game/tutorial/view/TutorialViewWithOk';

export class MixTutorialStep extends TutorialStep {
  constructor(num, tutorial) {
          super(num.toString(),tutorial,num,"assets.Tutorial" + num.toString()); num = uint(num);
      }
  createView(text) {
         return new TutorialViewWithOk(main.swfLoader.getClass(text));
      }
  setText(clip) {
         clip.title.title.text = main.locale.get("tutorialMixTitle");
         clip.text.text.text = main.locale.get("tutorialMix");
      }
  enter() { const __self = this;
         super.enter();
         __self.theView.getBg().removeChild(__self.theView.getBg().glow);
         main.game.getMixer().onMixStart.add(__self.theView.leave);
      }
  leave() { const __self = this;
         main.game.getMixer().onMixStart.remove(__self.theView.leave);
         super.leave();
      }
  clear() { const __self = this;
         main.game.getMixer().onMixStart.remove(__self.theView.leave);
      }
}
bindMethods(MixTutorialStep);
