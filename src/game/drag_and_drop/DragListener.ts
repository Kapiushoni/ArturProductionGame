import { MouseEvent, bindMethods, int } from '@/flash/as3';
import { Signal } from '@/game/cb/signals/Signal';
import { main } from '@/game/main';
import type { IDragContainer } from '@/game/drag_and_drop/IDragContainer';

/**
 * Connects a clip (a slot view) to its container for drag and drop: mouse down starts dragging its item,
 * mouse up drops onto it. During a drag every listener knows its role (see dragState) to highlight itself.
 */
export class DragListener {
  static readonly NO_DRAG = 1;
  /** can't take the dragged item */
  static readonly PASIVE_DRAG = 2;
  /** could take that kind of item, but not now */
  static readonly ON_DRAG = 3;
  /** can take it */
  static readonly ACTIVE_DRAG = 4;
  /** the item comes from here */
  static readonly DRAGGER = 5;
  /** the item was dropped here */
  static readonly RECEIVER = 6;
  onStart: Signal;
  onEnd: Signal;
  private mc: any;
  private container: any;
  private dragState: number;

  constructor(mc: any, container: IDragContainer) {
    this.mc = mc;
    this.container = container;
    this.dragState = DragListener.NO_DRAG;
    this.onEnd = new Signal();
    this.onStart = new Signal();
    this.addEvents();
  }
  isInState(state: number): boolean {
    return this.dragState == int(state);
  }
  addEvents() {
    main.drag.beginDrag.add(this.beginDrag);
    main.drag.stopDrag.add(this.stopDrag);
    this.mc.addEventListener(MouseEvent.MOUSE_DOWN, this.mouseDown);
  }
  removeEvents() {
    main.drag.beginDrag.remove(this.beginDrag);
    main.drag.stopDrag.remove(this.stopDrag);
    this.mc.removeEventListener(MouseEvent.MOUSE_DOWN, this.mouseDown);
  }
  addDragEvents() {
    this.mc.addEventListener(MouseEvent.MOUSE_UP, this.mouseUp);
  }
  removeDragEvents() {
    this.mc.removeEventListener(MouseEvent.MOUSE_UP, this.mouseUp);
  }
  mouseOver(_event: any) {
    main.drag.onMouseOver(this.container, this.mc);
  }
  mouseOut(_event: any) {
    main.drag.onMouseOut(this.container, this.mc);
  }
  mouseDown(_event: any) {
    const item = this.container.getContainToDrag();
    if (item != null) {
      this.dragState = DragListener.DRAGGER;
      main.drag.beginDrag.emit(this.container, item);
    }
  }
  mouseUp(_event: any) {
    this.dragState = DragListener.RECEIVER;
    main.drag.stopDrag.emit(this.container);
  }
  /** a drag started somewhere: what is this container's role? */
  beginDrag(from: IDragContainer, item: any) {
    if (!this.isInState(DragListener.DRAGGER)) {
      if (this.container.itsCompatible(item, from)) {
        this.dragState = this.container.canMoveFrom(item, from) ? DragListener.ACTIVE_DRAG : DragListener.ON_DRAG;
        this.addDragEvents();
      } else {
        this.dragState = DragListener.PASIVE_DRAG;
      }
    }
    this.onStart.emit(this);
  }
  stopDrag(_target: IDragContainer) {
    this.removeDragEvents();
    this.onEnd.emit(this);
    this.dragState = DragListener.NO_DRAG;
  }
  clear() {
    if (this.isInState(DragListener.ACTIVE_DRAG) || this.isInState(DragListener.ON_DRAG)) {
      this.removeDragEvents();
    }
    this.removeEvents();
    this.onEnd.clear();
    this.onStart.clear();
    this.onEnd = null;
    this.onStart = null;
    this.mc = null;
    this.container = null;
  }
}
bindMethods(DragListener);
