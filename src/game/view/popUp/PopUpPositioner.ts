import { Point, bindMethods } from '@/flash/as3';
import { app } from '@/game/app';
import type { DisplayObjectContainer } from '@/flash/as3';
import type { Sprite } from '@/flash/as3';

export class PopUpPositioner {
  src: DisplayObjectContainer = null;
  dst: DisplayObjectContainer = null;
  constructor(src: DisplayObjectContainer, dst: DisplayObjectContainer = null) {
    this.src = src;
    if (dst == null) {
      dst = app.popUpHolder;
    }
    this.dst = dst;
  }
  addMc(sprite: Sprite) {
    this.dst.addChild(sprite);
  }
  refreshPos(sprite: Sprite) {
    let point = this.src.localToGlobal(new Point(0, 0));
    point = this.dst.globalToLocal(point);
    sprite.x = point.x;
    sprite.y = point.y;
  }
}
bindMethods(PopUpPositioner);
