// @ts-nocheck
import { bindMethods } from '@/flash/as3';

export class Lambda {
  declare f: any;
  declare params: any;
  constructor(f, ... rest) {
         
         this.f = f;
         this.params = rest;
      }
  static wrap(callback, ... rest) {
         var funcToWrap = callback;
         var args = rest;
         return new Lambda(function(clip)
         {
            if(args.length == 0)
            {
               funcToWrap();
            }
            else
            {
               funcToWrap.apply(null,args);
            }
         });
      }
  execute(clip) {
         if(this.params.length == 0)
         {
            this.f.apply(null,[clip]);
         }
         else
         {
            this.params.splice(0,0,clip);
            this.f.apply(null,this.params);
         }
      }
}
Lambda.prototype.f = null;
Lambda.prototype.params = null;
bindMethods(Lambda);
