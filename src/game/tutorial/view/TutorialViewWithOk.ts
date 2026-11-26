// @ts-nocheck
import { Dictionary, bindMethods } from '@/flash/as3';
import { TutorialView } from '@/game/tutorial/view/TutorialView';
import { ButtonGroup } from '@/game/cb/data/ButtonGroup';
import { Buttons } from '@/game/util/Buttons';

export class TutorialViewWithOk extends TutorialView {
  constructor(cls) {
          super(cls);
      }
  getButtonInfo() {
         var dict = new Dictionary();
         dict.set("ok", ButtonGroup.get("gui").createButton(this.endStep,"mouseOver","mouseOut"));
         return dict;
      }
  endStep(event) {
         this.leave();
      }
  enter(callback = null) {
         Buttons.setButtons(this.bg,["ok"],true);
         super.enter(callback);
      }
  leave(callback = null) {
         Buttons.setButtons(this.bg,["ok"],false);
         super.leave(callback);
      }
}
bindMethods(TutorialViewWithOk);
