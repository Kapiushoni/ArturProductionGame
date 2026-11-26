// @ts-nocheck
import { Dictionary, as3values, bindMethods, int } from '@/flash/as3';
import { TextLoader } from '@/game/cb/data/TextLoader';
import { SwfLoader } from '@/game/cb/display/SwfLoader';
import { Signal } from '@/game/cb/signals/Signal';
import { Rule } from '@/game/cb/utils/Rule';

export class SwfBulkLoader {
  declare textLoader: any;
  declare loaded: any;
  declare progress: any;
  declare rule: any;
  declare swfs: any;
  declare load: any;
  constructor(value) {
         
         if((typeof value === "string"))
         {
            this.load = this.loadFile;
            this.textLoader = new TextLoader(value);
         }
         else
         {
            if(!(Array.isArray(value)))
            {
               throw new Error(value,"type unsupported");
            }
            this.textLoader = new TextLoader("");
            this.textLoader.data = value;
            this.load = this.loadArray;
         }
         this.progress = new Signal();
         this.loaded = new Signal();
      }
  loadArray() {
         this.fileLoaded(null);
      }
  loadFile() {
         this.textLoader.loaded.add(this.fileLoaded);
         this.textLoader.load();
      }
  getClass(text) {
         var loc4_Item = null;
         var num = int(0);
         var value = this.swfs;
         for (loc4_Item of as3values(value))
         {
            return loc4_Item.getClass(text);
         }
         return null;
      }
  getObject(text) {
         var loc4_Item = null;
         var num = int(0);
         var value = this.swfs;
         for (loc4_Item of as3values(value))
         {
            return loc4_Item.getObject(text);
         }
         return null;
      }
  bulkCompleted() {
         this.loaded.emit(this);
      }
  fileLoaded(textLoader) {
         var dataItem = null;
         this.textLoader.loaded.clear();
         this.rule = new Rule();
         this.swfs = new Dictionary();
         this.rule.completed.add(this.bulkCompleted);
         for (dataItem of as3values(this.textLoader.data))
         {
            if(dataItem != "")
            {
               this.rule.set(dataItem);
               this.swfs.set(dataItem, new SwfLoader(dataItem));
               this.swfs.get(dataItem).loaded.add(this.swfLoaded);
               this.swfs.get(dataItem).progress.add(this.progress.emit);
               this.swfs.get(dataItem).load();
            }
         }
      }
  swfLoaded(swfLoader) {
         swfLoader.loaded.clear();
         swfLoader.progress.clear();
         this.rule.check(swfLoader.getUrl());
      }
}
SwfBulkLoader.prototype.textLoader = null;
SwfBulkLoader.prototype.loaded = null;
SwfBulkLoader.prototype.progress = null;
SwfBulkLoader.prototype.rule = null;
SwfBulkLoader.prototype.swfs = null;
SwfBulkLoader.prototype.load = null;
bindMethods(SwfBulkLoader);
