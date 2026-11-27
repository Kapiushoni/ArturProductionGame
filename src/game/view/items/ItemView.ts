import { bindMethods } from '@/flash/as3';
import { app } from '@/game/app';
import type { Item } from '@/game/main_game/items/Item';
import type { SlotView } from '@/game/view/screens/main_game/slot/SlotView';

export class ItemView {
  item: any = null;
  mc: any = null;
  constructor(item: Item) {
    this.item = item;
  }
  getMC() {
    let cls = null;
    if (this.mc == null) {
      cls = app.swfLoader.getClass('assets.' + this.item.getMcName());
      this.mc = new cls();
    }
    return this.mc;
  }
  putIn(displayObjectContainer: any) {
    const mc = this.getMC();
    displayObjectContainer.addChild(mc);
  }
  clear() {
    if (this.mc.parent != null) {
      this.mc.parent.removeChild(this.mc);
    }
    this.item = null;
    this.mc = null;
  }
  getStateForSlot(slotView: SlotView) {
    return '';
  }
}
bindMethods(ItemView);
