import {
  ApplicationDomain,
  Event,
  Loader,
  LoaderContext,
  ProgressEvent,
  URLRequest,
  bindMethods,
  int,
} from '@/flash/as3';
import { Signal } from '@/game/cb/signals/Signal';

/** Loads one asset library (swf) into the shared domain; its classes are then found by name. */
export class SwfLoader {
  loaded: Signal;
  /** progress(bytes) */
  progress: Signal;
  private loader: Loader;
  private url: string;
  private loadedSoFar = 0;

  constructor(url: string) {
    this.loaded = new Signal();
    this.progress = new Signal();
    this.loader = new Loader();
    this.url = url;
  }
  load() {
    const context = new LoaderContext();
    context.applicationDomain = ApplicationDomain.currentDomain;
    this.loader.contentLoaderInfo.addEventListener(Event.COMPLETE, this.loadSwfComplete);
    this.loader.contentLoaderInfo.addEventListener(ProgressEvent.PROGRESS, this.progressListener);
    this.loader.load(new URLRequest(this.url), context);
  }
  progressListener(event: any) {
    this.progress.emit(event.bytesLoaded - this.loadedSoFar);
    this.loadedSoFar = int(event.bytesLoaded);
  }
  loadSwfComplete(event: any) {
    event.currentTarget.removeEventListener(Event.COMPLETE, this.loadSwfComplete);
    this.loaded.emit(this);
  }
  unload() {
    this.loader.unload();
    this.loaded.clear();
    this.loaded = null;
    this.progress.clear();
    this.progress = null;
  }
  getClass(name: string): any {
    return ApplicationDomain.currentDomain.getDefinition(name);
  }
  getObject(name: string): any {
    return new (this.getClass(name))();
  }
  getUrl(): string {
    return this.url;
  }
}
bindMethods(SwfLoader);
