// @ts-nocheck
import { Event, MouseEvent, Sprite, __DEFER, as3keys, bindMethods, uint } from '@/flash/as3';

export class Screen extends Sprite {
  declare bg: any;
  declare btnInfo: any;
  declare container: any;
  declare bgClass: any;
  constructor(...__a) { super(); if (__a[0] !== __DEFER) this.__init_Screen(...__a); }
  __init_Screen(bgClass, btnInfo) {
          const __self = this;
         this.bgClass = bgClass;
         this.btnInfo = btnInfo;
         this.bg = new bgClass();
         this.bg.addEventListener(Event.ADDED_TO_STAGE,this.added);
         __self.addChild(this.bg);
      }
  added(event) {
         var key = null;
         var buttonInfo = null;
         this.bg.removeEventListener(Event.ADDED_TO_STAGE,this.added);
         for (key of as3keys(this.btnInfo))
         {
            buttonInfo = this.btnInfo.get(key);
            this.configureButton(this.getFather(),key,buttonInfo);
         }
      }
  getFather() {
         if(this.container)
         {
            return this.bg[this.container];
         }
         return this.bg;
      }
  getHitBox(value, buttonInfo) {
         if(buttonInfo.getHitBox())
         {
            return value[buttonInfo.getHitBox()];
         }
         return value;
      }
  setNew(bgClass, btnInfo) { const __self = this;
         this.bgClass = bgClass;
         this.btnInfo = btnInfo;
         this.bg = new bgClass();
         this.bg.addEventListener(Event.ADDED_TO_STAGE,this.added);
         __self.addChild(this.bg);
      }
  configureButton(value, text, buttonInfo) {
         var hitBox = this.getHitBox(this.getMc(value,text),buttonInfo);
         hitBox.addEventListener(MouseEvent.CLICK,buttonInfo.click,false,0,true);
         if(buttonInfo.over != null)
         {
            hitBox.addEventListener(MouseEvent.MOUSE_OVER,buttonInfo.over,false,0,true);
         }
         if(buttonInfo.out != null)
         {
            hitBox.addEventListener(MouseEvent.MOUSE_OUT,buttonInfo.out,false,0,true);
         }
         hitBox.mouseChildren = false;
      }
  getMc(value, text) {
         if(text == "")
         {
            return value;
         }
         var list = text.split(".");
         var i = uint(0);
         while(i < list.length)
         {
            value = value[list[i]];
            i++;
         }
         return value;
      }
  addButton(text, buttonInfo) {
         this.btnInfo.set(text, buttonInfo);
         this.configureButton(this.getFather(),text,buttonInfo);
      }
  removeButton(text) {
         if(this.btnInfo.get(text))
         {
            this.removeEvent(this.getFather(),text);
         }
      }
  removeEvent(value, text) {
         var buttonInfo = this.btnInfo.get(text);
         var hitBox = this.getHitBox(this.getMc(value,text),buttonInfo);
         hitBox.removeEventListener(MouseEvent.CLICK,buttonInfo.click);
         if(buttonInfo.over != null)
         {
            hitBox.removeEventListener(MouseEvent.MOUSE_OVER,buttonInfo.over);
         }
         if(buttonInfo.out != null)
         {
            hitBox.removeEventListener(MouseEvent.MOUSE_OUT,buttonInfo.out);
         }
      }
  clear() { const __self = this;
         this.removeEvents();
         __self.removeChild(this.bg);
         this.bg = null;
      }
  restore(displayObject = null) { const __self = this;
         this.bg = new this.bgClass();
         this.added(null);
         if(displayObject)
         {
            __self.addChildAt(this.bg,__self.getChildIndex(displayObject));
         }
         else
         {
            __self.addChild(this.bg);
         }
      }
  removeEvents() {
         var key = null;
         var obj = this.bg;
         if(this.container)
         {
            obj = this.bg[this.container];
         }
         for (key of as3keys(this.btnInfo))
         {
            this.removeEvent(obj,key);
         }
      }
  restoreEvents() {
         this.added(null);
      }
  pop() { const __self = this;
         if (this.parent) __self.parent.removeChild(this);
         this.clear();
      }
  getBg() {
         return this.bg;
      }
}
Screen.prototype.bg = null;
Screen.prototype.btnInfo = null;
Screen.prototype.container = null;
Screen.prototype.bgClass = null;
bindMethods(Screen);
