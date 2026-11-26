// @ts-nocheck
import { as3keys, as3values, bindMethods } from '@/flash/as3';
import { Locale } from '@/game/cb/data/Locale';
import { SwfBulkLoader } from '@/game/cb/display/SwfBulkLoader';
import { Signal } from '@/game/cb/signals/Signal';
import { Rule } from '@/game/cb/utils/Rule';

export class LoadingObject {
  declare loaded: any;
  declare rule: any;
  declare toLoad: any;
  declare locale: any;
  declare swfBulkLoader: any;
  constructor(obj) {
         var key = null;
         
         this.rule = new Rule();
         this.toLoad = [];
         this.loaded = new Signal();
         this.rule.completed.add(this.ruleCompleted);
         for (key of as3keys(obj))
         {
            this.rule.set(key);
         }
         if(obj.swfs)
         {
            this.swfBulkLoader = new SwfBulkLoader(obj.swfs);
            this.swfBulkLoader.loaded.add(this.swfLoaded);
            this.toLoad.push(this.swfBulkLoader);
         }
         else
         {
            this.rule.check("swfs");
         }
         if(obj.locale)
         {
            this.locale = new Locale(obj.locale);
            this.locale.loaded.add(this.localeLoaded);
            this.locale.load();
            this.toLoad.push(this.locale);
         }
         else
         {
            this.rule.check("locale");
         }
      }
  ruleCompleted() {
         this.loaded.emit(this);
      }
  localeLoaded(locale) {
         this.rule.check("locale");
      }
  swfLoaded(swfBulkLoader) {
         swfBulkLoader.loaded.clear();
         this.rule.check("swfs");
      }
  getLocale() {
         return this.locale;
      }
  getSwfLoader() {
         return this.swfBulkLoader;
      }
  load() {
         var toLoadItem = undefined;
         for (toLoadItem of as3values(this.toLoad))
         {
            toLoadItem.load();
         }
      }
}
LoadingObject.prototype.loaded = null;
LoadingObject.prototype.rule = null;
LoadingObject.prototype.toLoad = null;
LoadingObject.prototype.locale = null;
LoadingObject.prototype.swfBulkLoader = null;
bindMethods(LoadingObject);
