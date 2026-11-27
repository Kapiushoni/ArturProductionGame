import { Dictionary, as3values, bindMethods } from '@/flash/as3';
import { TextLoader } from '@/game/cb/data/TextLoader';
import { SwfLoader } from '@/game/cb/display/SwfLoader';
import { Signal } from '@/game/cb/signals/Signal';
import { Rule } from '@/game/cb/utils/Rule';

/**
 * Loads several asset libraries: a list of urls, or a text file listing them (one per line).
 * loaded(this) when all are loaded. All libraries share one domain, so getClass() asks the first one.
 */
export class SwfBulkLoader {
  private textLoader: TextLoader;
  loaded: Signal;
  progress: Signal;
  private rule: Rule = null;
  /** Dictionary: url -> SwfLoader */
  private swfs: any = null;
  load: () => void;

  constructor(swfs: string | string[]) {
    if (typeof swfs === 'string') {
      this.load = this.loadFile;
      this.textLoader = new TextLoader(swfs);
    } else {
      if (!Array.isArray(swfs)) {
        throw new Error(swfs);
      }
      this.textLoader = new TextLoader('');
      this.textLoader.data = swfs;
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
  getClass(name: string): any {
    for (const swf of as3values(this.swfs)) {
      return swf.getClass(name);
    }
    return null;
  }
  getObject(name: string): any {
    for (const swf of as3values(this.swfs)) {
      return swf.getObject(name);
    }
    return null;
  }
  bulkCompleted() {
    this.loaded.emit(this);
  }
  fileLoaded(_textLoader: TextLoader) {
    this.textLoader.loaded.clear();
    this.rule = new Rule();
    this.swfs = new Dictionary();
    this.rule.completed.add(this.bulkCompleted);
    for (const url of as3values(this.textLoader.data)) {
      if (url != '') {
        this.rule.set(url);
        const swf = new SwfLoader(url);
        this.swfs.set(url, swf);
        swf.loaded.add(this.swfLoaded);
        swf.progress.add(this.progress.emit);
        swf.load();
      }
    }
  }
  swfLoaded(swf: SwfLoader) {
    swf.loaded.clear();
    swf.progress.clear();
    this.rule.check(swf.getUrl());
  }
}
bindMethods(SwfBulkLoader);
