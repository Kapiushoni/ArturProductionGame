import { Event, IOErrorEvent, URLLoader, URLRequest, bindMethods, int } from '@/flash/as3';
import { Signal } from '@/game/cb/signals/Signal';

/** Loads a text file as lines (`data`), from the URL or from packed resources; loaded(this) / ioFailed(this). */
export class TextLoader {
  protected loader: URLLoader;
  protected uri: string;
  /** the lines (subclasses replace it with parsed data) */
  data: any = null;
  loaded: Signal;
  ioFailed: Signal;

  constructor(uri: string) {
    this.loaded = new Signal();
    this.ioFailed = new Signal();
    this.uri = uri;
    this.loader = new URLLoader();
    this.loader.addEventListener(IOErrorEvent.IO_ERROR, this.errorHandler);
    this.loader.addEventListener(Event.COMPLETE, this.loaderCompleteHandler);
  }
  load(packedResources: any = null) {
    if (packedResources) {
      const cls = packedResources.get(this.uri);
      this.data = String(new cls()).split('\n');
      this.removeListeners();
      this.loader = null;
      this.loaded.emit(this);
      return;
    }
    this.loader.load(new URLRequest(this.uri));
  }
  removeListeners() {
    this.loader.removeEventListener(IOErrorEvent.IO_ERROR, this.errorHandler);
    this.loader.removeEventListener(Event.COMPLETE, this.loaderCompleteHandler);
  }
  /** the file arrived: split into lines, each one trimmed at the start */
  loaderCompleteHandler(_event: any) {
    this.removeListeners();
    this.data = String(this.loader.data).split('\n');
    for (let i = int(0); i < this.data.length; i++) {
      this.data[i] = this.data[i].replace(/^([\s|\t|\n]+)?(.*)([\s|\t|\n]+)?$/gm, '$2');
    }
    this.loaded.emit(this);
  }
  errorHandler(_event: any) {
    this.loader.removeEventListener(IOErrorEvent.IO_ERROR, this.errorHandler);
    this.ioFailed.emit(this);
  }
  get url(): string {
    return this.uri;
  }
}
bindMethods(TextLoader);
