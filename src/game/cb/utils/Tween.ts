// @ts-nocheck
import { Dictionary, Sprite, as3as, as3keys, as3values, bindMethods, uint } from '@/flash/as3';
import { GameLoop } from '@/game/cb/gameloop/GameLoop';

export class Tween {
  static tweens = null;
  static loop = null;
  constructor() {
         
      }
  static killTweensOf(obj) {
         var target = obj;
         var tweenKilled = false;
         Tween.forEachTweenOf(target,function(properties)
         {
            tweenKilled = true;
            Tween.tweens.splice(Tween.tweens.indexOf(properties),1);
         });
         return tweenKilled;
      }
  static isTweening(obj) {
         var tweenPlaying = false;
         var target = obj;
         tweenPlaying = false;
         Tween.forEachTweenOf(target,function(properties)
         {
            tweenPlaying = tweenPlaying || properties.target == target;
         });
         return tweenPlaying;
      }
  static to(obj, num, obj2, callback = null, callback2 = null) { num = Number(num);
         var properties = null;
         var key = null;
         if(!obj || !obj2)
         {
            return;
         }
         Tween.initialize();
         properties = new Properties(obj,num,callback,callback2);
         for (key of as3keys(obj2))
         {
            properties.propsMap[key] = new Value(obj[key],obj2[key]);
         }
         Tween.tweens.push(properties);
      }
  static destroy() {
         Tween.loop.stop();
         Tween.loop = null;
         Tween.tweens = null;
      }
  static initialize() {
         if(Tween.loop)
         {
            return;
         }
         Tween.tweens = [];
         Tween.loop = new GameLoop(new Sprite());
         Tween.loop.updated.add(Tween.update);
         Tween.loop.start();
      }
  static update(num) { num = uint(num);
         var num2 = uint(0);
         var num3 = uint(0);
         var loc5_Item = null;
         var loc4_Item = null;
         var list = [];
         var _loc5_ = Tween.tweens.concat();
         for (loc5_Item of as3values(_loc5_))
         {
            if(!Tween.updateTween(loc5_Item,num))
            {
               list.push(loc5_Item);
            }
         }
         for (loc4_Item of as3values(list))
         {
            Tween.tweens.splice(Tween.tweens.indexOf(loc4_Item),1);
         }
         if(!Tween.tweens.length)
         {
            Tween.destroy();
         }
      }
  static updateTween(properties, num) { num = uint(num);
         var key = null;
         var value = null;
         var target = null;
         var flag = false;
         if(!properties || !properties.target)
         {
            return false;
         }
         properties.elapsedTime += num;
         flag = properties.elapsedTime > properties.time;
         for (key of as3keys(properties.propsMap))
         {
            value = as3as(properties.propsMap[key], Value);
            target = properties.target;
            if(flag)
            {
               target[key] = value.to;
            }
            else
            {
               target[key] = Tween.linear(properties.elapsedTime,value.from,value.change,properties.time);
            }
         }
         if(flag)
         {
            properties.callback && properties.callback();
         }
         else
         {
            properties.update && properties.update();
         }
         return !flag;
      }
  static forEachTweenOf(obj, callback) {
         var properties = null;
         var i = uint(0);
         var length = uint(0);
         var _loc6_ = null;
         if(!Tween.tweens)
         {
            return;
         }
         _loc6_ = [].concat(Tween.tweens);
         i = uint(0);
         length = uint(_loc6_.length);
         while(i < length)
         {
            properties = _loc6_[i];
            if(Boolean(properties) && properties.target == obj)
            {
               callback && callback(properties);
            }
            i++;
         }
      }
  static linear(num, num2, num3, num4) { num = Number(num); num2 = Number(num2); num3 = Number(num3); num4 = Number(num4);
         return Number(num3 * num / num4 + num2);
      }
}
bindMethods(Tween);

class Properties {
  declare target: any;
  declare time: any;
  declare callback: any;
  declare update: any;
  declare propsMap: any;
  declare elapsedTime: any;
  constructor(target, time, callback = null, update = null) { time = uint(time);
      
      this.target = target;
      this.time = uint(time);
      this.callback = callback;
      this.update = update;
      this.propsMap = new Dictionary();
      this.elapsedTime = uint(0);
   }
}
Properties.prototype.target = null;
Properties.prototype.time = 0;
Properties.prototype.callback = null;
Properties.prototype.update = null;
Properties.prototype.propsMap = null;
Properties.prototype.elapsedTime = 0;
bindMethods(Properties);

class Value {
  declare from: any;
  declare to: any;
  declare change: any;
  constructor(from, to) { from = Number(from); to = Number(to);
      
      this.from = Number(from);
      this.to = Number(to);
      this.change = Number(to - from);
   }
}
Value.prototype.from = NaN;
Value.prototype.to = NaN;
Value.prototype.change = NaN;
bindMethods(Value);
