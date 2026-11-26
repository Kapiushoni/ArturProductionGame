// @ts-nocheck
import { Mouse, MouseCursor, MouseEvent, Point, bindMethods, int } from '@/flash/as3';
import { assert } from '@/game/assert';
import { Signal } from '@/game/cb/signals/Signal';
import { Tween } from '@/game/cb/utils/Tween';
import { main } from '@/game/main';
import { ItemFactory } from '@/game/main_game/items/ItemFactory';
import { GameSounds } from '@/game/sound/GameSounds';

export class DragDispatcher {
  static ROLLBACK_VELOCITY = Number(0.6);
  declare beginDrag: any;
  declare stopDrag: any;
  declare stage: any;
  declare content: any;
  declare firstContainer: any;
  declare dragging: any;
  declare tmp_view: any;
  declare initial_x: any;
  declare initial_y: any;
  snapped = false;
  constructor(stage) {
         
         this.stage = stage;
         this.dragging = false;
         this.beginDrag = new Signal();
         this.stopDrag = new Signal();
         this.beginDrag.add(this.start);
         this.stopDrag.add(this.end);
      }
  start(firstContainer, content) {
         if(this.tmp_view != null)
         {
            this.killTween();
         }
         assert(!this.dragging,"No se termino el ultimo drag");
         this.content = content;
         this.firstContainer = firstContainer;
         this.dragging = true;
         var view = ItemFactory.getInstance().getView(this.content);
         this.tmp_view = view.getMC();
         this.initial_x = int(this.stage.mouseX);
         this.initial_y = int(this.stage.mouseY);
         this.stage.addChild(this.tmp_view);
         this.tmp_view.x = this.initial_x;
         this.tmp_view.y = this.initial_y;
         this.tmp_view.mouseEnabled = false;
         this.tmp_view.mouseChildren = false;
         this.stage.addEventListener(MouseEvent.MOUSE_UP,this.mouseUpStage,false,0,true);
         Mouse.hide();
         this.stage.addEventListener(MouseEvent.MOUSE_MOVE,this.move,false,0,false);
         main.soundManager.playFx(GameSounds.ITEM_CLICK);
      }
  move(event) {
         assert(this.dragging,"No se está dragueando");
         if(!this.snapped)
         {
            this.tmp_view.x = this.stage.mouseX;
            this.tmp_view.y = this.stage.mouseY;
         }
      }
  mouseUpStage(event) {
         if(this.dragging)
         {
            this.stopDrag.emit(null);
         }
         this.stage.removeEventListener(MouseEvent.MOUSE_UP,this.mouseUpStage);
      }
  end(dragContainer) {
         var num = Number(NaN);
         assert(this.dragging,"No se está dragueando");
         this.stage.removeEventListener(MouseEvent.MOUSE_MOVE,this.move);
         if(dragContainer != null && dragContainer.canMoveFrom(this.content,this.firstContainer))
         {
            this.removeTempView();
            dragContainer.moveFrom(this.content,this.firstContainer);
            main.soundManager.playFx(GameSounds.ITEM_DROP_OK);
         }
         else
         {
            num = Number(DragDispatcher.ROLLBACK_VELOCITY * (Math.abs(this.stage.mouseX - this.initial_x) + Math.abs(this.stage.mouseY - this.initial_y)));
            Tween.to(this.tmp_view,num,{
               "x":this.initial_x,
               "y":this.initial_y
            },this.removeTempView);
            main.soundManager.playFx(GameSounds.ITEM_DROP_FAIL);
         }
         Mouse.cursor = MouseCursor.AUTO;
         Mouse.show();
         this.dragging = false;
         this.content = null;
         this.firstContainer = null;
      }
  clear() {
         this.beginDrag.clear();
         this.stopDrag.clear();
         this.beginDrag.add(this.start);
         this.stopDrag.add(this.end);
         if(this.dragging)
         {
            this.stage.removeEventListener(MouseEvent.MOUSE_MOVE,this.move);
            this.dragging = false;
         }
         if(this.tmp_view != null)
         {
            this.killTween();
         }
         this.content = null;
         this.firstContainer = null;
      }
  killTween() {
         Tween.killTweensOf(this.tmp_view);
         this.removeTempView();
      }
  removeTempView() {
         if(this.tmp_view != null)
         {
            this.stage.removeChild(this.tmp_view);
         }
         this.tmp_view = null;
      }
  onMouseOver(dragContainer, clip) {
         if(this.tmp_view != null && dragContainer.canMoveFrom(this.content,this.firstContainer))
         {
            this.snapTo(clip);
         }
      }
  onMouseOut(dragContainer, clip) {
         this.unSnapFrom(clip);
      }
  snapTo(clip) {
         this.snapped = true;
         var point = clip.localToGlobal(new Point(0,0));
         point = this.tmp_view.parent.globalToLocal(point);
         this.tmp_view.x = point.x;
         this.tmp_view.y = point.y;
      }
  unSnapFrom(clip) {
         this.snapped = false;
      }
}
DragDispatcher.prototype.beginDrag = null;
DragDispatcher.prototype.stopDrag = null;
DragDispatcher.prototype.stage = null;
DragDispatcher.prototype.content = null;
DragDispatcher.prototype.firstContainer = null;
DragDispatcher.prototype.dragging = false;
DragDispatcher.prototype.tmp_view = null;
DragDispatcher.prototype.initial_x = 0;
DragDispatcher.prototype.initial_y = 0;
bindMethods(DragDispatcher);
