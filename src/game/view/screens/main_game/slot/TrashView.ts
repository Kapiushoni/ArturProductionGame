import { MouseEvent, bindMethods } from '@/flash/as3';
import { DragListener } from '@/game/drag_and_drop/DragListener';
import { main } from '@/game/main';
import type { Item } from '@/game/main_game/items/Item';

export class TrashView {
  trash: any = null;
  drag_listener: any = null;
  selected = false;
  constructor() {
    main.game.getInventory().getTrash().onThrow.add(this.throwItem);
    this.selected = false;
  }
  initialize(trash: any) {
    this.trash = trash;
    this.drag_listener = new DragListener(trash.hit_box, main.game.getInventory().getTrash());
    this.stop();
    this.addEvents();
  }
  addEvents() {
    this.trash.hit_box.addEventListener(MouseEvent.ROLL_OVER, this.mouseOver, false, 0, true);
    this.trash.hit_box.addEventListener(MouseEvent.ROLL_OUT, this.mouseOut, false, 0, true);
  }
  removeEvents() {
    this.trash.hit_box.removeEventListener(MouseEvent.ROLL_OVER, this.mouseOver);
    this.trash.hit_box.removeEventListener(MouseEvent.ROLL_OUT, this.mouseOut);
  }
  mouseOver(event: any) {
    if (this.drag_listener.dragState == DragListener.ACTIVE_DRAG) {
      this.select();
    }
  }
  mouseOut(event: any) {
    this.deselect();
  }
  select() {
    if (!this.selected) {
      this.selected = true;
      this.trash.gotoAndPlay('mouseOver');
    }
  }
  deselect() {
    if (this.selected) {
      this.selected = false;
      this.trash.gotoAndPlay('mouseOut');
    }
  }
  stop() {
    this.trash.trash.gotoAndStop(1);
  }
  throwItem(item: Item) {
    this.deselect();
    this.trash.trash.gotoAndPlay(1);
  }
  clear() {
    this.removeEvents();
    this.drag_listener.clear();
    this.drag_listener = null;
    this.trash = null;
  }
}
bindMethods(TrashView);
