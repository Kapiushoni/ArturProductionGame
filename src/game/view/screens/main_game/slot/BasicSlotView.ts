import { Mouse, MouseCursor, MouseEvent, Point, bindMethods } from '@/flash/as3';
import { DragListener } from '@/game/drag_and_drop/DragListener';
import { ItemViews } from '@/game/view/items/ItemViews';
import { ItemPopUp } from '@/game/view/popUp/ItemPopUp';
import type { ISlot } from '@/game/main_game/item_containers/ISlot';
import type { ItemView } from '@/game/view/items/ItemView';
import type { SlotChange } from '@/game/main_game/item_containers/SlotChange';

export class BasicSlotView {
  bg: any = null;
  item_view: any = null;
  slot: any = null;
  popUp: any = null;
  drag_listener: any = null;
  selected = false;
  enabled = true;
  hide = false;
  constructor(slot: ISlot) {
    this.slot = slot;
    this.createPopUp();
    this.selected = false;
    this.slot.onChange.add(this.refresh);
  }
  hideItem() {
    this.hide = true;
    if (this.item_view != null) {
      this.item_view.getMC().visible = false;
      this.updateState(this.item_view);
    }
  }
  unHideItem() {
    this.hide = false;
    if (this.item_view != null) {
      this.item_view.getMC().visible = true;
      this.updateState(this.item_view);
    }
  }
  enable() {
    if (this.selected && !this.enabled) {
      this.enabled = true;
      this.selected = false;
      this.select();
    }
    this.enabled = true;
  }
  disable() {
    if (this.enabled && this.selected) {
      this.deselect();
    }
    this.enabled = false;
  }
  createPopUp() {
    this.popUp = new ItemPopUp();
  }
  initialize(bg: any) {
    this.bg = bg;
    this.bg.gotoAndStop('mouseOver');
    this.drag_listener = new DragListener(this.bg, this.slot);
    this.drag_listener.onEnd.add(this.endDrag);
    this.drag_listener.onStart.add(this.startDrag);
    this.refresh();
  }
  refresh(slotChange: SlotChange = null) {
    var point = null;
    this.removeEvents();
    if (this.item_view != null) {
      this.item_view.clear();
      this.item_view = null;
    }
    var content = this.slot.getContent();
    this.popUp.refreshItem(content);
    if (content) {
      this.item_view = ItemViews.create(content);
      this.item_view.putIn(this.bg);
      this.popUp.addIn(this.bg);
      point = this.bg.localToGlobal(new Point(this.bg.mouseX, this.bg.mouseY));
      if (this.bg.hitTestPoint(point.x, point.y, true)) {
        this.mouseOver(null);
      }
    } else {
      this.popUp.clear();
    }
    this.updateState(this.item_view);
    this.addEvents();
  }
  updateState(itemView: ItemView) {}
  addEvents() {
    this.bg.addEventListener(MouseEvent.ROLL_OVER, this.mouseOver, false, 0, true);
    this.bg.addEventListener(MouseEvent.ROLL_OUT, this.mouseOut, false, 0, true);
  }
  removeEvents() {
    this.bg.removeEventListener(MouseEvent.ROLL_OVER, this.mouseOver);
    this.bg.removeEventListener(MouseEvent.ROLL_OUT, this.mouseOut);
  }
  startDrag(dragListener: DragListener) {
    this.popUp.hide();
    if (dragListener.isInState(DragListener.DRAGGER)) {
      this.item_view.getMC().alpha = 0.3;
      this.select();
    }
  }
  endDrag(dragListener: DragListener) {
    if (dragListener.isInState(DragListener.DRAGGER)) {
      if (this.item_view) {
        this.item_view.getMC().alpha = 1;
      }
    }
    if (!dragListener.isInState(DragListener.RECEIVER)) {
      this.deselect();
    }
  }
  mouseOver(event: any) {
    if (this.hide) {
      return;
    }
    Mouse.cursor = MouseCursor.AUTO;
    switch (this.drag_listener.dragState) {
      case DragListener.ACTIVE_DRAG:
        this.select();
        break;
      case DragListener.NO_DRAG:
        if (!this.slot.isEmpty()) {
          this.select();
          Mouse.cursor = MouseCursor.HAND;
        }
        this.popUp.show();
        break;
      case DragListener.RECEIVER:
        if (!this.slot.isEmpty()) {
          this.select();
          Mouse.cursor = MouseCursor.HAND;
        }
        this.popUp.show();
    }
  }
  mouseOut(event: any) {
    if (this.hide) {
      return;
    }
    Mouse.cursor = MouseCursor.AUTO;
    switch (this.drag_listener.dragState) {
      case DragListener.ACTIVE_DRAG:
        this.deselect();
        break;
      case DragListener.NO_DRAG:
        this.deselect();
        this.popUp.hide();
    }
  }
  select() {
    if (!this.selected && this.enabled) {
      this.selected = true;
      this.bg.gotoAndPlay('mouseOver');
    }
  }
  deselect() {
    if (this.selected) {
      this.selected = false;
      this.bg.gotoAndPlay('mouseOut');
    }
  }
  clear() {
    this.removeEvents();
    this.drag_listener.clear();
    this.bg = null;
    this.popUp.clear();
    this.popUp = null;
    if (this.item_view != null) {
      this.item_view.clear();
    }
    this.item_view = null;
  }
}
bindMethods(BasicSlotView);
