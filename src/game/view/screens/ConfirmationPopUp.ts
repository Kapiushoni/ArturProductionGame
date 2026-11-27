import { Dictionary, bindMethods } from '@/flash/as3';
import { AnimatedScreen } from '@/game/view/screens/AnimatedScreen';
import { ButtonGroup } from '@/game/cb/data/ButtonGroup';
import { main } from '@/game/main';
import { Buttons } from '@/game/util/Buttons';
import { Sepializer } from '@/game/util/Sepializer';
import { Util } from '@/game/util/Util';

export class ConfirmationPopUp extends AnimatedScreen {
  background: any = null;
  onAccept: any = null;
  onCancel: any = null;
  constructor(background: any, onAccept: Function, onCancel: Function, text: string) {
    super();
    this.initAnimatedScreen(main.swfLoader.getClass('assets.NewGamePopup'), this.getButtonInfo());
    this.onAccept = onAccept;
    this.onCancel = onCancel;
    this.background = background;
    this.bg.addEventListener('blackIn', this.sepialize);
    this.bg.addEventListener('blackOut', this.unsepialize);
    Buttons.setButtons(this.bg, ['accept', 'cancel'], true);
    this.bg.container.text.title.text = text;
  }
  getButtonInfo() {
    const dict = new Dictionary();
    const buttonGroup = ButtonGroup.get('gui');
    dict.set('accept', buttonGroup.createButton(this.accept, 'mouseOver', 'mouseOut'));
    dict.set('cancel', buttonGroup.createButton(this.cancel, 'mouseOver', 'mouseOut'));
    return dict;
  }
  sepialize(event: any) {
    Sepializer.getInstance().sepialize(this.background);
  }
  unsepialize(event: any) {
    Sepializer.getInstance().unsepialize(this.background);
  }
  accept(event: any) {
    Buttons.setButtons(this.bg, ['accept', 'cancel'], false);
    this.onAccept();
    this.pop();
  }
  cancel(event: any) {
    Buttons.setButtons(this.bg, ['accept', 'cancel'], false);
    this.leave(Util.concatenate(this.onCancel, this.pop));
  }
  clear() {
    this.bg.removeEventListener('blackIn', this.sepialize);
    this.bg.removeEventListener('blackOut', this.unsepialize);
    this.onAccept = null;
    this.background = null;
  }
}
bindMethods(ConfirmationPopUp);
