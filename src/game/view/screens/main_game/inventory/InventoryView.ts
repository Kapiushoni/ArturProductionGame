import { as3values, bindMethods, uint } from '@/flash/as3';
import { Lambda } from '@/game/actions/Lambda';
import { EndAnimation } from '@/game/cb/conditions/EndAnimation';
import { SmartMC } from '@/game/cb/display/SmartMC';
import { main } from '@/game/main';
import { Inventory } from '@/game/main_game/inventory/Inventory';
import { SlotView } from '@/game/view/screens/main_game/slot/SlotView';
import { TrashView } from '@/game/view/screens/main_game/slot/TrashView';

export class InventoryView {
  static readonly NEXT_BUTTON = 'arrow_next';
  static readonly PREV_BUTTON = 'arrow_prev';
  bg: any = null;
  slots: any = null;
  trash: any = null;
  actual_page = 0;
  constructor() {
    this.actual_page = 1;
    this.trash = new TrashView();
    this.slots = new Array(Inventory.SLOTS);
  }
  initialize(bg: any) {
    this.bg = bg;
    this.trash.initialize(bg.trash);
    var inventory = main.game.getInventory();
    var i = 1;
    while (i <= Inventory.SLOTS) {
      this.slots[i - 1] = new SlotView(inventory.getSlot(i - 1));
      this.slots[i - 1].initialize(bg.page_1['slot_' + i]);
      i++;
    }
  }
  updatePage(value, actual_page: number) {
    actual_page = uint(actual_page);
    this.actual_page = uint(actual_page);
  }
  nextPage(event: any) {
    this.goToPage(this.actual_page + 1);
  }
  previousPage(event: any) {
    this.goToPage(this.actual_page - 1);
  }
  goToPage(num: number) {
    num = uint(num);
    if (this.actual_page == num) {
      this.updatePage(null, num);
      return;
    }
    var text = 'page_' + this.actual_page + '_' + num;
    this.bg.gotoAndPlay(text);
    var smartMC = new SmartMC(this.bg.page_1);
    smartMC.trigger(new EndAnimation(), new Lambda(this.updatePage, num));
  }
  clear() {
    var slot = null;
    for (slot of as3values(this.slots)) {
      slot.clear();
    }
    this.slots = null;
    this.trash.clear();
    this.trash = null;
  }
}
bindMethods(InventoryView);
