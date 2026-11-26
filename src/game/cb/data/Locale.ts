// @ts-nocheck
import { Dictionary, URLRequest, as3values, bindMethods, int } from '@/flash/as3';
import { TextLoader } from '@/game/cb/data/TextLoader';

export class Locale extends TextLoader {
  declare locale: any;
  constructor(text) {
          super(text);
      }
  load(packedResources = null) { const __self = this;
         var cls = null;
         if(packedResources)
         {
            cls = packedResources.get(__self.uri);
            __self.removeListeners();
            __self.loader = null;
            this.createLocale(new cls());
            __self.loaded.emit(this);
            return;
         }
         var urlRequest = new URLRequest(__self.uri);
         __self.loader.load(urlRequest);
      }
  createLocale(text) { const __self = this;
         var text2 = null;
         var dataItem = null;
         var list = null;
         this.locale = new Dictionary();
         __self.data = String(text).split("\n");
         for (dataItem of as3values(__self.data))
         {
            list = dataItem.split(":");
            text2 = list.shift();
            this.locale.set(text2, list.join(":"));
            this.locale.set(text2, this.locale.get(text2).replace(/^([\s|\t|\n]+)?(.*)([\s|\t|\n]+)?$/gm,"$2"));
         }
      }
  loaderCompleteHandler(event) { const __self = this;
         this.createLocale(__self.loader.data);
         __self.loaded.emit(this);
      }
  get(text, list = null) {
         var s = null;
         var re = null;
         var ix = int(0);
         var key = text;
         var params = list;
         if(this.locale.get(key) == undefined)
         {
            return "missing key [" + key + "]";
         }
         if(params == null)
         {
            return this.locale.get(key);
         }
         s = this.locale.get(key);
         re = /\$+\d+/g;
         s = s.replace(re,function()
         {
            if(arguments[0].substr(0,2) == "$$")
            {
               return arguments[0].substr(1);
            }
            return params[int(arguments[0].substr(1)) - 1];
         });
         return s;
      }
}
Locale.prototype.locale = null;
bindMethods(Locale);
