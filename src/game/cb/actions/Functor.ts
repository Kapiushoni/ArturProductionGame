// @ts-nocheck
import { bindMethods } from '@/flash/as3';

export class Functor {
  declare f: any;
  declare params: any;
  constructor(f, ... rest) {
         
         this.f = f;
         this.params = rest;
      }
  static wrap(callback) {
         var funcToWrap = callback;
         return new Functor(function(clip)
         {
            funcToWrap();
         });
      }
  execute(clip) {
         if(this.params.length == 0)
         {
            this.f(clip);
         }
         else
         {
            this.f(clip,this.params);
         }
      }
}
Functor.prototype.f = null;
Functor.prototype.params = null;
bindMethods(Functor);
