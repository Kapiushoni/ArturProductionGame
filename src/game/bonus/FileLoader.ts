// @ts-nocheck
import { Event, EventDispatcher, IOErrorEvent, URLLoader, URLRequest, bindMethods } from '@/flash/as3';

export class FileLoader extends EventDispatcher {
  declare loader: any;
  declare uri: any;
  declare data: any;
  declare name: any;
  constructor(text) {
          super();
         this.uri = text;
         this.name = text;
         this.loader = new URLLoader();
         this.loader.addEventListener(IOErrorEvent.IO_ERROR,this.errorHandler);
         this.loader.addEventListener(Event.COMPLETE,this.loaderCompleteHandler);
      }
  load(packedResources = null) { const __self = this;
         var cls = null;
         if(packedResources)
         {
            cls = packedResources.get(this.uri);
            this.data = new cls();
            this.removeListeners();
            this.loader = null;
            __self.dispatchEvent(new Event(Event.COMPLETE));
            return;
         }
         var urlRequest = new URLRequest(this.uri);
         this.loader.load(urlRequest);
      }
  removeListeners() {
         this.loader.removeEventListener(IOErrorEvent.IO_ERROR,this.errorHandler);
         this.loader.removeEventListener(Event.COMPLETE,this.loaderCompleteHandler);
      }
  loaderCompleteHandler(event) { const __self = this;
         this.data = this.loader.data;
         __self.dispatchEvent(event);
         this.removeListeners();
      }
  errorHandler(event) {
         throw new Error(event);
      }
}
FileLoader.prototype.loader = null;
FileLoader.prototype.uri = null;
FileLoader.prototype.data = null;
FileLoader.prototype.name = null;
bindMethods(FileLoader);
