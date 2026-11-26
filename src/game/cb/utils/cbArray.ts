// @ts-nocheck
import { as3values, bindMethods, int, uint } from '@/flash/as3';

export class cbArray extends Array {
  constructor(... rest) {
         var num = Number(NaN);
         var num2 = uint(0);
         var i = int(0);
          super(); const __self = this;
         var num3 = uint(uint(rest.length));
         if(num3 == 1 && (typeof rest[0] === "number"))
         {
            num = Number(Number(rest[0]));
            num2 = uint(num);
            if(num2 != num)
            {
               throw new RangeError("Array index is not a 32-bit unsigned integer (" + num + ")");
            }
            __self.length = num2;
         }
         else
         {
            __self.length = num3;
            i = int(0);
            while(i < num3)
            {
               this[i] = rest[i];
               i++;
            }
         }
      }
  static createFromArray(list) {
         var param1Item = undefined;
         var cbArray2 = new cbArray();
         for (param1Item of as3values(list))
         {
            cbArray2.push(param1Item);
         }
         return cbArray2;
      }
  shuffle() {
         var cbArray2 = this.clone();
         var cbArray3 = new cbArray();
         while(cbArray2.length > 0)
         {
            cbArray3.push(cbArray2.splice(Math.round(Math.random() * (cbArray2.length - 1)),1)[0]);
         }
         return cbArray3;
      }
  pushIfNotPresent(value) { const __self = this;
         if(__self.indexOf(value) < 0)
         {
            __self.push(value);
         }
      }
  remove(value, value2 = null) { const __self = this;
         var num = int(0);
         if(value2 == null)
         {
            num = int(__self.indexOf(value));
         }
         else
         {
            num = int(this.indexOfField(value,value2));
         }
         if(num < 0)
         {
            return;
         }
         __self.splice(num,1);
      }
  indexOfField(value, value2) { const __self = this;
         var i = int(0);
         while(i < __self.length)
         {
            if(value === this[i][value2])
            {
               return int(i);
            }
            i++;
         }
         return int(-1);
      }
  indexOfMethodValue(value, text) { const __self = this;
         var i = int(0);
         while(i < __self.length)
         {
            if(value === this[i][text]())
            {
               return int(i);
            }
            i++;
         }
         return int(-1);
      }
  findFirstOfField(value, value2) { const __self = this;
         var i = int(0);
         while(i < __self.length)
         {
            if(value === this[i][value2])
            {
               return this[i];
            }
            i++;
         }
         return null;
      }
  findFirstFromMethodValue(value, text) { const __self = this;
         var i = int(0);
         while(i < __self.length)
         {
            if(value === this[i][text]())
            {
               return this[i];
            }
            i++;
         }
         return null;
      }
  clone() { const __self = this;
         var cbArray2 = new cbArray();
         var i = int(0);
         while(i < __self.length)
         {
            cbArray2.push(this[i]);
            i++;
         }
         return cbArray2;
      }
  subtract(list) {
         var num = int(0);
         var cbArray2 = this.clone();
         var i = int(0);
         while(i < list.length)
         {
            num = int(cbArray2.indexOf(list[i]));
            if(num >= 0)
            {
               cbArray2.splice(num,1);
            }
            i++;
         }
         return cbArray2;
      }
}
bindMethods(cbArray);
