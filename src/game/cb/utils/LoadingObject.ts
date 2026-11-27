import { as3keys, as3values, bindMethods } from '@/flash/as3';
import { Locale } from '@/game/cb/data/Locale';
import { SwfBulkLoader } from '@/game/cb/display/SwfBulkLoader';
import { Signal } from '@/game/cb/signals/Signal';
import { Rule } from '@/game/cb/utils/Rule';

/** Loads a set of { swfs, locale } and emits loaded(this) when all of them are ready. */
export class LoadingObject {
  loaded: Signal;
  private rule: Rule;
  private toLoad: any[];
  private locale: Locale = null;
  private swfBulkLoader: SwfBulkLoader = null;

  constructor(resources: any) {
    this.rule = new Rule();
    this.toLoad = [];
    this.loaded = new Signal();
    this.rule.completed.add(this.ruleCompleted);
    for (const key of as3keys(resources)) {
      this.rule.set(key);
    }
    if (resources.swfs) {
      this.swfBulkLoader = new SwfBulkLoader(resources.swfs);
      this.swfBulkLoader.loaded.add(this.swfLoaded);
      this.toLoad.push(this.swfBulkLoader);
    } else {
      this.rule.check('swfs');
    }
    if (resources.locale) {
      this.locale = new Locale(resources.locale);
      this.locale.loaded.add(this.localeLoaded);
      this.locale.load();
      this.toLoad.push(this.locale);
    } else {
      this.rule.check('locale');
    }
  }
  ruleCompleted() {
    this.loaded.emit(this);
  }
  localeLoaded(_locale: Locale) {
    this.rule.check('locale');
  }
  swfLoaded(loader: SwfBulkLoader) {
    loader.loaded.clear();
    this.rule.check('swfs');
  }
  getLocale(): Locale {
    return this.locale;
  }
  getSwfLoader(): SwfBulkLoader {
    return this.swfBulkLoader;
  }
  load() {
    for (const loader of as3values(this.toLoad)) {
      loader.load();
    }
  }
}
bindMethods(LoadingObject);
