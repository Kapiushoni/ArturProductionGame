import { bindMethods } from '@/flash/as3';
import { main } from '@/game/main';
import type { Item } from '@/game/main_game/items/Item';
import type { SlotView } from '@/game/view/screens/main_game/slot/SlotView';

export class ItemView {
  item: any = null;
  mc: any = null;
  constructor(item: Item) {
    this.item = item;
  }
  getMC() {
    var cls = null;
    if (this.mc == null) {
      cls = main.swfLoader.getClass('assets.' + this.item.getMcName());
      this.mc = new cls();
    }
    return this.mc;
  }
  putIn(displayObjectContainer: any) {
    var mc = this.getMC();
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
