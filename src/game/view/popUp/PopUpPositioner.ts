import { Point, bindMethods } from '@/flash/as3';
import { app } from '@/game/app';

export class PopUpPositioner {
  src: any = null;
  dst: any = null;
  constructor(src: any, dst: any = null) {
    this.src = src;
    if (dst == null) {
      dst = app.popUpHolder;
    }
    this.dst = dst;
  }
  addMc(sprite: any) {
    this.dst.addChild(sprite);
  }
  refreshPos(sprite: any) {
    let point = this.src.localToGlobal(new Point(0, 0));
    point = this.dst.globalToLocal(point);
    sprite.x = point.x;
    sprite.y = point.y;
  }
}
bindMethods(PopUpPositioner);
