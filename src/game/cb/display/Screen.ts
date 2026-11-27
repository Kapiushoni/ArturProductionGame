import { Event, MouseEvent, Sprite, __DEFER, as3keys, bindMethods } from '@/flash/as3';
import type { ButtonInfo } from '@/game/cb/data/ButtonInfo';

/**
 * A screen: a library clip (bg) plus its buttons. btnInfo maps a child path ("a.b", relative to
 * bg[container] when set) to its ButtonInfo; the handlers are attached once bg is on the stage.
 * new Screen(__DEFER) + __init_Screen(...) is used by the screens (view).
 */
export class Screen extends Sprite {
  bg: any = null;
  /** Dictionary: button path -> ButtonInfo */
  protected btnInfo: any = null;
  /** name of the child of bg that holds the buttons, or null for bg itself */
  container: string = null;
  protected bgClass: any = null;

  constructor(...args: any[]) {
    super();
    if (args[0] !== __DEFER) this.__init_Screen(args[0], args[1]);
  }
  __init_Screen(bgClass: any, btnInfo: any) {
    this.setNew(bgClass, btnInfo);
  }
  added(_event: any) {
    this.bg.removeEventListener(Event.ADDED_TO_STAGE, this.added);
    for (const path of as3keys(this.btnInfo)) {
      this.configureButton(this.getFather(), path, this.btnInfo.get(path));
    }
  }
  /** the clip that holds the buttons */
  getFather(): any {
    if (this.container) {
      return this.bg[this.container];
    }
    return this.bg;
  }
  getHitBox(button: any, info: ButtonInfo): any {
    if (info.getHitBox()) {
      return button[info.getHitBox()];
    }
    return button;
  }
  /** replaces the clip and the buttons */
  setNew(bgClass: any, btnInfo: any) {
    this.bgClass = bgClass;
    this.btnInfo = btnInfo;
    this.bg = new bgClass();
    this.bg.addEventListener(Event.ADDED_TO_STAGE, this.added);
    this.addChild(this.bg);
  }
  configureButton(father: any, path: string, info: ButtonInfo) {
    const hitBox = this.getHitBox(this.getMc(father, path), info);
    hitBox.addEventListener(MouseEvent.CLICK, info.click, false, 0, true);
    if (info.over != null) {
      hitBox.addEventListener(MouseEvent.MOUSE_OVER, info.over, false, 0, true);
    }
    if (info.out != null) {
      hitBox.addEventListener(MouseEvent.MOUSE_OUT, info.out, false, 0, true);
    }
    hitBox.mouseChildren = false;
  }
  /** child at a path ("" = the clip itself) */
  getMc(clip: any, path: string): any {
    if (path == '') {
      return clip;
    }
    for (const name of path.split('.')) {
      clip = clip[name];
    }
    return clip;
  }
  addButton(path: string, info: ButtonInfo) {
    this.btnInfo.set(path, info);
    this.configureButton(this.getFather(), path, info);
  }
  removeButton(path: string) {
    if (this.btnInfo.get(path)) {
      this.removeEvent(this.getFather(), path);
    }
  }
  removeEvent(father: any, path: string) {
    const info = this.btnInfo.get(path);
    const hitBox = this.getHitBox(this.getMc(father, path), info);
    hitBox.removeEventListener(MouseEvent.CLICK, info.click);
    if (info.over != null) {
      hitBox.removeEventListener(MouseEvent.MOUSE_OVER, info.over);
    }
    if (info.out != null) {
      hitBox.removeEventListener(MouseEvent.MOUSE_OUT, info.out);
    }
  }
  clear() {
    this.removeEvents();
    this.removeChild(this.bg);
    this.bg = null;
  }
  /** a new copy of the clip (in front of displayObject if given) with the buttons */
  restore(displayObject: any = null) {
    this.bg = new this.bgClass();
    this.added(null);
    if (displayObject) {
      this.addChildAt(this.bg, this.getChildIndex(displayObject));
    } else {
      this.addChild(this.bg);
    }
  }
  removeEvents() {
    const father = this.container ? this.bg[this.container] : this.bg;
    for (const path of as3keys(this.btnInfo)) {
      this.removeEvent(father, path);
    }
  }
  restoreEvents() {
    this.added(null);
  }
  /** removes the screen from its parent and clears it */
  pop() {
    if (this.parent) this.parent.removeChild(this);
    this.clear();
  }
  getBg(): any {
    return this.bg;
  }
}
bindMethods(Screen);
