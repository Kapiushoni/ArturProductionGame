// @ts-nocheck
import { MouseEvent, MovieClip, as3as, as3values, bindMethods, int, uint } from '@/flash/as3';

export class Util {
  constructor() {
         
      }
  static l(callback, ... rest) {
         var func = callback;
         var params = rest;
         return function(... rest)
         {
            return func.apply(null,rest.concat(params));
         };
      }
  static concatenate(callback, callback2) {
         var func1 = callback;
         var func2 = callback2;
         return function(... rest)
         {
            func1.apply(null,rest);
            func2();
         };
      }
  static removeParams(callback) {
         var func = callback;
         return function(... rest)
         {
            return func();
         };
      }
  static bringToFront(sprite) {
         if(sprite.parent != null)
         {
            sprite.parent.setChildIndex(sprite,sprite.parent.numChildren - 1);
         }
      }
  static parseArray(text, text2 = null) {
         text2 ||= ";";
         return text.split(text2);
      }
  static pass() {
         return function(... rest)
         {
         };
      }
  static areLoaded(list, dynamicLoader) {
         var param1Item = null;
         for (param1Item of as3values(list))
         {
            if(!dynamicLoader.isLoaded(param1Item))
            {
               return false;
            }
         }
         return true;
      }
  static toStringDay(num) { num = uint(num);
         switch(num)
         {
            case 1:
               return "Monday";
            case 2:
               return "Tuesday";
            case 3:
               return "Wednesday";
            case 4:
               return "Thursday";
            case 5:
               return "Friday";
            case 6:
               return "Saturday";
            case 0:
               return "Sunday";
            default:
               throw new Error("The week has only 7 days!");
         }
      }
  static recursiveStop(clip) {
         var mc = clip;
         Util.recursiveApply(mc,function(clip2)
         {
            clip2.stop();
         });
      }
  static recursivePlay(clip) {
         var mc = clip;
         Util.recursiveApply(mc,function(clip2)
         {
            clip2.play();
         });
      }
  static recursiveApply(clip, callback) {
         var clip2 = null;
         var value = int(clip.numChildren - 1);
         while(value >= 0)
         {
            clip2 = as3as(clip.getChildAt(value), MovieClip);
            if(clip2)
            {
               Util.recursiveApply(clip2,callback);
            }
            value--;
         }
         callback(clip);
      }
  static sameDate(date, date2) {
         return date.getUTCFullYear() == date2.getUTCFullYear() && date.getUTCMonth() == date2.getUTCMonth() && date.getUTCDate() == date2.getUTCDate() && (date.getUTCHours() < date2.getUTCHours() || date.getUTCHours() == date2.getUTCHours() && date.getUTCMinutes() <= date2.getUTCMinutes());
      }
  static getSprite(sprite, text) {
         var loc3_Item = null;
         var list = text.split(".");
         var sprite2 = sprite;
         for (loc3_Item of as3values(list))
         {
            sprite2 = sprite2[loc3_Item];
         }
         return sprite2;
      }
  static addMouseEvents(sprite, callback = null, callback2 = null, callback3 = null) {
         if(callback != null)
         {
            sprite.addEventListener(MouseEvent.CLICK,callback);
         }
         if(callback2 != null)
         {
            sprite.addEventListener(MouseEvent.MOUSE_OVER,callback2);
         }
         if(callback3 != null)
         {
            sprite.addEventListener(MouseEvent.MOUSE_OUT,callback3);
         }
      }
  static removeMouseEvents(sprite, callback = null, callback2 = null, callback3 = null) {
         if(callback != null)
         {
            sprite.removeEventListener(MouseEvent.CLICK,callback);
         }
         if(callback2 != null)
         {
            sprite.removeEventListener(MouseEvent.MOUSE_OVER,callback2);
         }
         if(callback3 != null)
         {
            sprite.removeEventListener(MouseEvent.MOUSE_OUT,callback3);
         }
      }
}
bindMethods(Util);
