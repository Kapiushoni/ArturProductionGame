import { ApplicationDomain, Event, Loader, LoaderContext, ProgressEvent, URLRequest } from '@/flash/as3';
import { loadLines } from '@/game/loader/files';

/**
 * The loaded asset libraries (swf). They all share one domain, so a class is found by its name
 * (getClass("assets.X")), whichever library it came from.
 */
export class SwfLibrary {
  /**
   * Loads the libraries: a list of urls, or a text file listing them (one per line).
   * onBytes(n) is called while loading, with the bytes loaded since the last call (for a progress bar).
   */
  static async load(swfs: string | string[], onBytes: (bytes: number) => void = () => {}): Promise<SwfLibrary> {
    const urls = typeof swfs === 'string' ? (await loadLines(swfs)).filter((url) => url != '') : swfs;
    await Promise.all(urls.map((url) => loadSwf(url, onBytes)));
    return new SwfLibrary();
  }
  getClass(name: string): any {
    return ApplicationDomain.currentDomain.getDefinition(name);
  }
  getObject(name: string): any {
    return new (this.getClass(name))();
  }
}

function loadSwf(url: string, onBytes: (bytes: number) => void): Promise<void> {
  return new Promise((resolve) => {
    const loader = new Loader();
    let loadedSoFar = 0;
    loader.contentLoaderInfo.addEventListener(ProgressEvent.PROGRESS, (event: any) => {
      onBytes(event.bytesLoaded - loadedSoFar);
      loadedSoFar = event.bytesLoaded | 0;
    });
    loader.contentLoaderInfo.addEventListener(Event.COMPLETE, () => resolve());
    const context = new LoaderContext();
    context.applicationDomain = ApplicationDomain.currentDomain;
    loader.load(new URLRequest(url), context);
  });
}
