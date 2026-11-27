import { Dictionary, bindMethods } from '@/flash/as3';
import { AnimatedScreen } from '@/game/view/screens/AnimatedScreen';
import { ButtonGroup } from '@/game/cb/data/ButtonGroup';
import { app } from '@/game/app';
import { Buttons } from '@/game/util/Buttons';
import { Sepializer } from '@/game/util/Sepializer';
import { Util } from '@/game/util/Util';
import type { Event } from '@/flash/as3';
import type { MouseEvent } from '@/flash/as3';
import type { MovieClip } from '@/flash/as3';

export class ConfirmationPopUp extends AnimatedScreen {
  background: MovieClip = null;
  onAccept: any = null;
  onCancel: any = null;
  constructor(background: MovieClip, onAccept: Function, onCancel: Function, text: string) {
    super();
    this.initAnimatedScreen(app.swfLoader.getClass('assets.NewGamePopup'), this.getButtonInfo());
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
  sepialize(event: Event) {
    Sepializer.getInstance().sepialize(this.background);
  }
  unsepialize(event: Event) {
    Sepializer.getInstance().unsepialize(this.background);
  }
  accept(event: MouseEvent) {
    Buttons.setButtons(this.bg, ['accept', 'cancel'], false);
    this.onAccept();
    this.pop();
  }
  cancel(event: MouseEvent) {
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
