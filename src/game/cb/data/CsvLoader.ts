// @ts-nocheck
import { Dictionary, as3values, bindMethods, int } from '@/flash/as3';
import { TextLoader } from '@/game/cb/data/TextLoader';
import { cbArray } from '@/game/cb/utils/cbArray';

export class CsvLoader extends TextLoader {
  constructor(text) {
          super(text); const __self = this;
         __self.loaded.addAtFirst(this.verifyData);
      }
  verifyData(textLoader) { const __self = this;
         var dataItem = null;
         __self.loaded.remove(this.verifyData);
         var list = [];
         for (dataItem of as3values(__self.data))
         {
            if(dataItem != "")
            {
               list.push(dataItem.split(","));
            }
         }
         __self.data = cbArray.createFromArray(list);
      }
  getLines() { const __self = this;
         return int(__self.data.length);
      }
  get(num, num2 = -1) { num = int(num); num2 = int(num2); const __self = this;
         if(num2 == -1)
         {
            return __self.data[num - 1];
         }
         return __self.data[num - 1][num2 - 1];
      }
  getColumns() { const __self = this;
         return int(__self.data[0].length);
      }
  convertToObjects() { const __self = this;
         var text = null;
         var i = int(0);
         var obj = null;
         var text2 = null;
         var list = null;
         var list2 = [];
         var dict = new Dictionary();
         var j = int(0);
         while(j < __self.data.length)
         {
            text = "";
            i = int(0);
            while(i < __self.data[j].length)
            {
               if(j == 0)
               {
                  list2[i] = __self.data[j][i];
               }
               else if(i == 0)
               {
                  text = __self.data[j][i];
                  dict.set(text, new Object());
               }
               else
               {
                  obj = dict.get(text);
                  text2 = list2[i];
                  list = text2.split(".");
                  if(list.length > 1)
                  {
                     if(obj[list[0]] == null)
                     {
                        obj[list[0]] = new Object();
                     }
                     obj = obj[list[0]];
                     text2 = list[1];
                  }
                  if(__self.data[j][i] == "null")
                  {
                     obj[text2] = null;
                  }
                  else if(isNaN(__self.data[j][i]))
                  {
                     obj[text2] = __self.data[j][i];
                  }
                  else
                  {
                     obj[text2] = Number(__self.data[j][i]);
                  }
               }
               i++;
            }
            j++;
         }
         return dict;
      }
}
bindMethods(CsvLoader);
