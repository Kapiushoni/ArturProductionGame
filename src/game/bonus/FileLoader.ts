import { Event, EventDispatcher, IOErrorEvent, URLLoader, URLRequest, bindMethods } from '@/flash/as3';

/** Loads a text file (or takes it from packed resources); Event.COMPLETE when `data` is ready. */
export class FileLoader extends EventDispatcher {
  private loader: URLLoader;
  private uri: string;
  data: any = null;
  name: string;

  constructor(uri: string) {
    super();
    this.uri = uri;
    this.name = uri;
    this.loader = new URLLoader();
    this.loader.addEventListener(IOErrorEvent.IO_ERROR, this.errorHandler);
    this.loader.addEventListener(Event.COMPLETE, this.loaderCompleteHandler);
  }
  load(packedResources: any = null) {
    if (packedResources) {
      const cls = packedResources.get(this.uri);
      this.data = new cls();
      this.removeListeners();
      this.loader = null;
      this.dispatchEvent(new Event(Event.COMPLETE));
      return;
    }
    this.loader.load(new URLRequest(this.uri));
  }
  removeListeners() {
    this.loader.removeEventListener(IOErrorEvent.IO_ERROR, this.errorHandler);
    this.loader.removeEventListener(Event.COMPLETE, this.loaderCompleteHandler);
  }
  loaderCompleteHandler(event: any) {
    this.data = this.loader.data;
    this.dispatchEvent(event);
    this.removeListeners();
  }
  errorHandler(event: any) {
    throw new Error(event);
  }
}
bindMethods(FileLoader);
