// @ts-nocheck
import { Event, IOErrorEvent, URLLoader, URLRequest, bindMethods, int } from '@/flash/as3';
import { Signal } from '@/game/cb/signals/Signal';

export class TextLoader {
  declare loader: any;
  declare uri: any;
  declare data: any;
  declare loaded: any;
  declare ioFailed: any;
  constructor(uri) {
         
         this.loaded = new Signal();
         this.ioFailed = new Signal();
         this.uri = uri;
         this.loader = new URLLoader();
         this.loader.addEventListener(IOErrorEvent.IO_ERROR,this.errorHandler);
         this.loader.addEventListener(Event.COMPLETE,this.loaderCompleteHandler);
      }
  load(packedResources = null) {
         var cls = null;
         if(packedResources)
         {
            cls = packedResources.get(this.uri);
            this.data = String(new cls()).split("\n");
            this.removeListeners();
            this.loader = null;
            this.loaded.emit(this);
            return;
         }
         var urlRequest = new URLRequest(this.uri);
         this.loader.load(urlRequest);
      }
  removeListeners() {
         this.loader.removeEventListener(IOErrorEvent.IO_ERROR,this.errorHandler);
         this.loader.removeEventListener(Event.COMPLETE,this.loaderCompleteHandler);
      }
  loaderCompleteHandler(event) {
         this.removeListeners();
         this.data = String(this.loader.data).split("\n");
         var i = int(0);
         while(i < this.data.length)
         {
            this.data[i] = this.data[i].replace(/^([\s|\t|\n]+)?(.*)([\s|\t|\n]+)?$/gm,"$2");
            i++;
         }
         this.loaded.emit(this);
      }
  errorHandler(event) {
         this.loader.removeEventListener(IOErrorEvent.IO_ERROR,this.errorHandler);
         this.ioFailed.emit(this);
      }
  get url() {
         return this.uri;
      }
}
TextLoader.prototype.loader = null;
TextLoader.prototype.uri = null;
TextLoader.prototype.data = null;
TextLoader.prototype.loaded = null;
TextLoader.prototype.ioFailed = null;
bindMethods(TextLoader);
