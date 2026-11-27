import { Mouse, MouseCursor, MouseEvent, Point, bindMethods, int } from '@/flash/as3';
import { assert } from '@/game/assert';
import { Signal } from '@/game/cb/signals/Signal';
import { Tween } from '@/game/cb/utils/Tween';
import { main } from '@/game/main';
import { ItemViews } from '@/game/view/items/ItemViews';
import { GameSounds } from '@/game/sound/GameSounds';
import type { IDragContainer } from '@/game/drag_and_drop/IDragContainer';

/**
 * Drag and drop of items (main.drag). beginDrag(from, item): a copy of the item's view follows the mouse;
 * stopDrag(target): moves the item if target accepts it, otherwise the copy slides back.
 * Over a container that accepts the item, the copy snaps onto it.
 */
export class DragDispatcher {
  /** ms per pixel of the slide back */
  static ROLLBACK_VELOCITY = 0.6;
  beginDrag: Signal;
  stopDrag: Signal;
  private stage: any;
  private content: any = null;
  private firstContainer: IDragContainer = null;
  private dragging = false;
  /** the dragged copy */
  private tmp_view: any = null;
  private initial_x = 0;
  private initial_y = 0;
  snapped = false;

  constructor(stage: any) {
    this.stage = stage;
    this.beginDrag = new Signal();
    this.stopDrag = new Signal();
    this.beginDrag.add(this.start);
    this.stopDrag.add(this.end);
  }
  start(from: IDragContainer, item: any) {
    if (this.tmp_view != null) {
      this.killTween();
    }
    assert(!this.dragging, 'No se termino el ultimo drag'); // "the last drag did not end"
    this.content = item;
    this.firstContainer = from;
    this.dragging = true;
    this.tmp_view = ItemViews.create(this.content).getMC();
    this.initial_x = int(this.stage.mouseX);
    this.initial_y = int(this.stage.mouseY);
    this.stage.addChild(this.tmp_view);
    this.tmp_view.x = this.initial_x;
    this.tmp_view.y = this.initial_y;
    this.tmp_view.mouseEnabled = false;
    this.tmp_view.mouseChildren = false;
    this.stage.addEventListener(MouseEvent.MOUSE_UP, this.mouseUpStage, false, 0, true);
    Mouse.hide();
    this.stage.addEventListener(MouseEvent.MOUSE_MOVE, this.move, false, 0, false);
    main.soundManager.playFx(GameSounds.ITEM_CLICK);
  }
  move(_event: any) {
    assert(this.dragging, 'No se está dragueando'); // "not dragging"
    if (!this.snapped) {
      this.tmp_view.x = this.stage.mouseX;
      this.tmp_view.y = this.stage.mouseY;
    }
  }
  /** released outside every container */
  mouseUpStage(_event: any) {
    if (this.dragging) {
      this.stopDrag.emit(null);
    }
    this.stage.removeEventListener(MouseEvent.MOUSE_UP, this.mouseUpStage);
  }
  end(target: IDragContainer | null) {
    assert(this.dragging, 'No se está dragueando');
    this.stage.removeEventListener(MouseEvent.MOUSE_MOVE, this.move);
    if (target != null && target.canMoveFrom(this.content, this.firstContainer)) {
      this.removeTempView();
      target.moveFrom(this.content, this.firstContainer);
      main.soundManager.playFx(GameSounds.ITEM_DROP_OK);
    } else {
      const distance = Math.abs(this.stage.mouseX - this.initial_x) + Math.abs(this.stage.mouseY - this.initial_y);
      Tween.to(
        this.tmp_view,
        DragDispatcher.ROLLBACK_VELOCITY * distance,
        { x: this.initial_x, y: this.initial_y },
        this.removeTempView,
      );
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
    if (this.dragging) {
      this.stage.removeEventListener(MouseEvent.MOUSE_MOVE, this.move);
      this.dragging = false;
    }
    if (this.tmp_view != null) {
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
    if (this.tmp_view != null) {
      this.stage.removeChild(this.tmp_view);
    }
    this.tmp_view = null;
  }
  onMouseOver(container: IDragContainer, clip: any) {
    if (this.tmp_view != null && container.canMoveFrom(this.content, this.firstContainer)) {
      this.snapTo(clip);
    }
  }
  onMouseOut(_container: IDragContainer, clip: any) {
    this.unSnapFrom(clip);
  }
  snapTo(clip: any) {
    this.snapped = true;
    const point = this.tmp_view.parent.globalToLocal(clip.localToGlobal(new Point(0, 0)));
    this.tmp_view.x = point.x;
    this.tmp_view.y = point.y;
  }
  unSnapFrom(_clip: any) {
    this.snapped = false;
  }
}
bindMethods(DragDispatcher);
