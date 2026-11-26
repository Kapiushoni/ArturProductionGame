// @ts-nocheck
import { ApplicationDomain, Event, Loader, LoaderContext, ProgressEvent, URLRequest, bindMethods, int } from '@/flash/as3';
import { Signal } from '@/game/cb/signals/Signal';

export class SwfLoader {
  declare loaded: any;
  declare progress: any;
  declare loader: any;
  declare url: any;
  declare loadedSoFar: any;
  constructor(url) {
         
         this.loaded = new Signal();
         this.progress = new Signal();
         this.loader = new Loader();
         this.url = url;
      }
  load() {
         var loaderContext = new LoaderContext();
         loaderContext.applicationDomain = ApplicationDomain.currentDomain;
         this.loader.contentLoaderInfo.addEventListener(Event.COMPLETE,this.loadSwfComplete);
         this.loader.contentLoaderInfo.addEventListener(ProgressEvent.PROGRESS,this.progressListener);
         this.loader.load(new URLRequest(this.url),loaderContext);
      }
  progressListener(event) {
         this.progress.emit(event.bytesLoaded - this.loadedSoFar);
         this.loadedSoFar = int(event.bytesLoaded);
      }
  loadSwfComplete(event) {
         event.currentTarget.removeEventListener(Event.COMPLETE,this.loadSwfComplete);
         this.loaded.emit(this);
      }
  unload() {
         this.loader.unload();
         this.loaded.clear();
         this.loaded = null;
         this.progress.clear();
         this.progress = null;
      }
  getClass(text) {
         return ApplicationDomain.currentDomain.getDefinition(text);
      }
  getObject(text) {
         return new (this.getClass(text))();
      }
  getUrl() {
         return this.url;
      }
}
SwfLoader.prototype.loaded = null;
SwfLoader.prototype.progress = null;
SwfLoader.prototype.loader = null;
SwfLoader.prototype.url = null;
SwfLoader.prototype.loadedSoFar = 0;
bindMethods(SwfLoader);
