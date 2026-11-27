import { Dictionary, bindMethods } from '@/flash/as3';
import { TutorialView } from '@/game/tutorial/view/TutorialView';
import { ButtonGroup } from '@/game/cb/data/ButtonGroup';
import { Buttons } from '@/game/util/Buttons';

/** A tutorial window closed with its OK button. */
export class TutorialViewWithOk extends TutorialView {
  getButtonInfo(): any {
    const buttons: any = new Dictionary();
    buttons.set('ok', ButtonGroup.get('gui').createButton(this.endStep, 'mouseOver', 'mouseOut'));
    return buttons;
  }
  endStep(_event: any) {
    this.leave();
  }
  enter(callback: Function = null) {
    Buttons.setButtons(this.bg, ['ok'], true);
    super.enter(callback);
  }
  leave(callback: Function = null) {
    Buttons.setButtons(this.bg, ['ok'], false);
    super.leave(callback);
  }
}
bindMethods(TutorialViewWithOk);
