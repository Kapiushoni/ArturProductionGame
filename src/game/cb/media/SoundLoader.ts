// @ts-nocheck
import { Dictionary, Event, IOErrorEvent, URLRequest, as3values, bindMethods, int } from '@/flash/as3';
import { TextLoader } from '@/game/cb/data/TextLoader';
import { cbSound } from '@/game/cb/media/cbSound';
import { Signal } from '@/game/cb/signals/Signal';

export class SoundLoader {
  declare s: any;
  declare bulk: any;
  declare total: any;
  declare data: any;
  declare textLoader: any;
  declare totalBytesLoaded: any;
  declare textToLoad: any;
  declare resource: any;
  declare mediaUrl: any;
  declare loaded: any;
  declare progress: any;
  declare loadedSoFar: any;
  constructor(textToLoad, mediaUrl = null) {
         
         this.bulk = int(0);
         this.data = new Dictionary();
         this.loaded = new Signal();
         this.progress = new Signal();
         this.textToLoad = textToLoad;
         if(mediaUrl == null)
         {
            this.mediaUrl = "";
         }
         else
         {
            this.mediaUrl = mediaUrl;
         }
      }
  load(resource = null) {
         this.resource = resource;
         this.textLoader = new TextLoader(this.mediaUrl + this.textToLoad);
         this.textLoader.loaded.add(this.textLoaded);
         this.textLoader.load(resource);
      }
  textLoaded(textLoader) {
         var dataItem = null;
         this.textLoader.loaded.clear();
         for (dataItem of as3values(textLoader.data))
         {
            if(dataItem != "")
            {
               ++this.total;
            }
         }
         for (dataItem of as3values(textLoader.data))
         {
            if(dataItem != "")
            {
               this.loadSound(this.mediaUrl + dataItem);
            }
         }
      }
  loadSound(text, list = null) {
         var cls = null;
         var text2 = text.slice(text.lastIndexOf("/") + 1,text.indexOf(".",text.lastIndexOf("/")));
         var list2 = text.split(",");
         if(this.resource)
         {
            cls = this.resource.get(list2[0]);
            this.data.set(text2, new cbSound(text2));
            this.data.get(text2).setSound(new cls());
         }
         else
         {
            this.data.set(text2, new cbSound(text2,new URLRequest(list2[0])));
            this.data.get(text2).progress.add(this.progress.emit);
         }
         var completeOneHandler = this.completeHandler;
         if(list)
         {
            list2 = list;
            completeOneHandler = this.completeOneHandler;
         }
         this.data.get(text2).volume = list2[1] ? list2[1] : 1;
         this.data.get(text2).originalVolume = list2[1] ? list2[1] : 1;
         this.data.get(text2).startMilliseconds = list2[2] ? list2[2] : 0;
         this.data.get(text2).endMilliseconds = list2[3] ? list2[3] : 0;
         this.data.get(text2).addEventListener(IOErrorEvent.IO_ERROR,this.ioError);
         this.data.get(text2).addEventListener(Event.COMPLETE,completeOneHandler);
         if(this.resource)
         {
            completeOneHandler();
         }
      }
  ioError(event) {
         throw new Error("error loading file: " + event.text);
      }
  completeOneHandler(event = null) {
         event.currentTarget.removeEventListener(IOErrorEvent.IO_ERROR,this.ioError);
         event.currentTarget.removeEventListener(Event.COMPLETE,this.completeOneHandler);
         this.loaded.emit(this);
      }
  completeHandler(event = null) {
         event.currentTarget.removeEventListener(IOErrorEvent.IO_ERROR,this.ioError);
         event.currentTarget.removeEventListener(Event.COMPLETE,this.completeHandler);
         ++this.bulk;
         if(this.bulk == this.total)
         {
            this.loaded.emit(this);
         }
      }
  loadOne(text, num, num2, num3) { num = Number(num); num2 = Number(num2); num3 = Number(num3);
         this.loadSound(text,[0,num,num2,num3]);
      }
}
SoundLoader.prototype.s = null;
SoundLoader.prototype.bulk = 0;
SoundLoader.prototype.total = 0;
SoundLoader.prototype.data = null;
SoundLoader.prototype.textLoader = null;
SoundLoader.prototype.totalBytesLoaded = 0;
SoundLoader.prototype.textToLoad = null;
SoundLoader.prototype.resource = null;
SoundLoader.prototype.mediaUrl = null;
SoundLoader.prototype.loaded = null;
SoundLoader.prototype.progress = null;
SoundLoader.prototype.loadedSoFar = 0;
bindMethods(SoundLoader);
