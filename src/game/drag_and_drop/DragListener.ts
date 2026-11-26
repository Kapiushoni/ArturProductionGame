// @ts-nocheck
import { MouseEvent, bindMethods, int } from '@/flash/as3';
import { Signal } from '@/game/cb/signals/Signal';
import { main } from '@/game/main';

export class DragListener {
  static readonly NO_DRAG = int(1);
  static readonly PASIVE_DRAG = int(2);
  static readonly ON_DRAG = int(3);
  static readonly ACTIVE_DRAG = int(4);
  static readonly DRAGGER = int(5);
  static readonly RECEIVER = int(6);
  declare onStart: any;
  declare onEnd: any;
  declare mc: any;
  declare container: any;
  declare dragState: any;
  constructor(mc, container) {
         
         this.mc = mc;
         this.container = container;
         this.dragState = int(DragListener.NO_DRAG);
         this.onEnd = new Signal();
         this.onStart = new Signal();
         this.addEvents();
      }
  isInState(num) { num = int(num);
         return this.dragState == num;
      }
  addEvents() {
         main.drag.beginDrag.add(this.beginDrag);
         main.drag.stopDrag.add(this.stopDrag);
         this.mc.addEventListener(MouseEvent.MOUSE_DOWN,this.mouseDown);
      }
  removeEvents() {
         main.drag.beginDrag.remove(this.beginDrag);
         main.drag.stopDrag.remove(this.stopDrag);
         this.mc.removeEventListener(MouseEvent.MOUSE_DOWN,this.mouseDown);
      }
  addDragEvents() {
         this.mc.addEventListener(MouseEvent.MOUSE_UP,this.mouseUp);
      }
  removeDragEvents() {
         this.mc.removeEventListener(MouseEvent.MOUSE_UP,this.mouseUp);
      }
  mouseOver(event) {
         main.drag.onMouseOver(this.container,this.mc);
      }
  mouseOut(event) {
         main.drag.onMouseOut(this.container,this.mc);
      }
  mouseDown(event) {
         var containToDrag = this.container.getContainToDrag();
         if(containToDrag != null)
         {
            this.dragState = int(DragListener.DRAGGER);
            main.drag.beginDrag.emit(this.container,containToDrag);
         }
      }
  mouseUp(event) {
         this.dragState = int(DragListener.RECEIVER);
         main.drag.stopDrag.emit(this.container);
      }
  beginDrag(dragContainer, item) {
         if(!this.isInState(DragListener.DRAGGER))
         {
            if(this.container.itsCompatible(item,dragContainer))
            {
               if(this.container.canMoveFrom(item,dragContainer))
               {
                  this.dragState = int(DragListener.ACTIVE_DRAG);
               }
               else
               {
                  this.dragState = int(DragListener.ON_DRAG);
               }
               this.addDragEvents();
            }
            else
            {
               this.dragState = int(DragListener.PASIVE_DRAG);
            }
         }
         this.onStart.emit(this);
      }
  stopDrag(dragContainer) {
         this.removeDragEvents();
         this.onEnd.emit(this);
         this.dragState = int(DragListener.NO_DRAG);
      }
  clear() {
         if(this.isInState(DragListener.ACTIVE_DRAG) || this.isInState(DragListener.ON_DRAG))
         {
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
DragListener.prototype.onStart = null;
DragListener.prototype.onEnd = null;
DragListener.prototype.mc = null;
DragListener.prototype.container = null;
DragListener.prototype.dragState = 0;
bindMethods(DragListener);
