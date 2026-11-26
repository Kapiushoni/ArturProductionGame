// @ts-nocheck
import { bindMethods, int, uint } from '@/flash/as3';

export class ProbabilisticSet {
  declare items: any;
  declare probs: any;
  declare totalProb: any;
  constructor() {
         
         this.items = new Array();
         this.probs = new Array();
         this.totalProb = Number(0);
      }
  get length() {
         return uint(this.items.length);
      }
  pop() {
         var one = int(this.getOne());
         return this.remove(one);
      }
  getElement() {
         var one = int(this.getOne());
         return this.items[one];
      }
  remove(num) { num = int(num);
         var num2 = Number(Number(this.probs[num]));
         var obj = this.items[num];
         this.probs.splice(num,1);
         this.items.splice(num,1);
         this.totalProb = Number(this.totalProb - (num2));
         return obj;
      }
  getOne() {
         var num = Number(Math.random() * this.totalProb);
         var num2 = Number(0);
         var i = int(0);
         while(i < this.items.length)
         {
            num2 = Number(Number(this.probs[i]));
            if(num <= num2)
            {
               return int(i);
            }
            num = Number(num - (num2));
            i++;
         }
         return int(this.items.length);
      }
  contains(obj) {
         return this.getIndexOf(obj) >= 0;
      }
  getIndexOf(obj) {
         var i = int(0);
         var num = int(this.items.indexOf(obj));
         if(num < 0 && obj.hasOwnProperty("equals"))
         {
            i = int(0);
            while(i < this.items.length)
            {
               if(obj.equals(this.items[i]))
               {
                  return int(i);
               }
               i++;
            }
         }
         return int(num);
      }
  add(obj, num = 1) { num = Number(num);
         this.items.push(obj);
         this.probs.push(num);
         this.totalProb = Number(this.totalProb + (num));
      }
}
ProbabilisticSet.prototype.items = null;
ProbabilisticSet.prototype.probs = null;
ProbabilisticSet.prototype.totalProb = NaN;
bindMethods(ProbabilisticSet);
