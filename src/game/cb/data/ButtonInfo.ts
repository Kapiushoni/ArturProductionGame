// @ts-nocheck
import { bindMethods } from '@/flash/as3';

export class ButtonInfo {
  declare _click: any;
  declare _over: any;
  declare _out: any;
  declare hitBox: any;
  constructor(click, over = null, out = null, flag = true, hitBox = null) {
         
         this._click = click;
         if((typeof over === "string"))
         {
            this._over = ButtonInfo.defaultGoto(over,flag,hitBox);
         }
         else
         {
            this._over = over;
         }
         if((typeof out === "string"))
         {
            this._out = ButtonInfo.defaultGoto(out,flag,hitBox);
         }
         else
         {
            this._out = out;
         }
         this.hitBox = hitBox;
      }
  static defaultGoto(text, flag = false, text2 = null) {
         var label = text;
         var playAsDefault = flag;
         var hitBox = text2;
         return function(event)
         {
            event.stopPropagation();
            var parent = event.currentTarget;
            if(hitBox)
            {
               parent = event.currentTarget.parent;
            }
            if(playAsDefault)
            {
               parent.gotoAndPlay(label);
            }
            else
            {
               parent.gotoAndStop(label);
            }
         };
      }
  getHitBox() {
         return this.hitBox;
      }
  get click() {
         return this._click;
      }
  get over() {
         return this._over;
      }
  get out() {
         return this._out;
      }
}
ButtonInfo.prototype._click = null;
ButtonInfo.prototype._over = null;
ButtonInfo.prototype._out = null;
ButtonInfo.prototype.hitBox = null;
bindMethods(ButtonInfo);
