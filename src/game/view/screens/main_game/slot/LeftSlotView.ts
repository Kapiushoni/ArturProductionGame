import { bindMethods } from '@/flash/as3';
import { AutoSelectSlotView } from '@/game/view/screens/main_game/slot/AutoSelectSlotView';
import { ItemPopUp } from '@/game/view/popUp/ItemPopUp';

export class LeftSlotView extends AutoSelectSlotView {
  declare selectionBloked: any;
  constructor(slot) {
    super(slot);
    this.selectionBloked = false;
  }
  createPopUp() {
    this.popUp = new ItemPopUp(ItemPopUp.RIGHT);
  }
  blockSelection() {
    this.deselect();
    this.selectionBloked = true;
  }
  unblockSelection() {
    this.selectionBloked = false;
  }
  select() {
    if (!this.selectionBloked) {
      super.select();
    }
  }
}
// Defaults on the prototype, not field initializers: the AutoSelectSlotView constructor calls overridden methods that may set it,
// and an initializer (run after the base constructor) would overwrite them.
LeftSlotView.prototype.selectionBloked = false;
bindMethods(LeftSlotView);
