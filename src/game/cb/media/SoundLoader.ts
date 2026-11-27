import { Dictionary, Event, IOErrorEvent, URLRequest, as3values, bindMethods } from '@/flash/as3';
import { TextLoader } from '@/game/cb/data/TextLoader';
import { cbSound } from '@/game/cb/media/cbSound';
import { Signal } from '@/game/cb/signals/Signal';

/**
 * Loads the sounds listed in a text file (one "path,volume,startMs,endMs" per line); `data` maps
 * the file name (without folder and extension) to its cbSound. loaded(this) when all have loaded.
 */
export class SoundLoader {
  s: any = null;
  private bulk = 0;
  private total = 0;
  /** Dictionary: name -> cbSound */
  data: any;
  private textLoader: TextLoader = null;
  totalBytesLoaded = 0;
  private textToLoad: string;
  private resource: any = null;
  private mediaUrl: string;
  loaded: Signal;
  /** progress(bytes) */
  progress: Signal;
  loadedSoFar = 0;

  constructor(listFile: string, mediaUrl: string = null) {
    this.data = new Dictionary();
    this.loaded = new Signal();
    this.progress = new Signal();
    this.textToLoad = listFile;
    this.mediaUrl = mediaUrl == null ? '' : mediaUrl;
  }
  load(resource: any = null) {
    this.resource = resource;
    this.textLoader = new TextLoader(this.mediaUrl + this.textToLoad);
    this.textLoader.loaded.add(this.textLoaded);
    this.textLoader.load(resource);
  }
  textLoaded(textLoader: TextLoader) {
    this.textLoader.loaded.clear();
    for (const line of as3values(textLoader.data)) {
      if (line != '') {
        ++this.total;
      }
    }
    for (const line of as3values(textLoader.data)) {
      if (line != '') {
        this.loadSound(this.mediaUrl + line);
      }
    }
  }
  /** line: "path,volume,startMs,endMs"; settings: [_, volume, startMs, endMs] for a single sound */
  loadSound(line: string, settings: any[] = null) {
    const name = line.slice(line.lastIndexOf('/') + 1, line.indexOf('.', line.lastIndexOf('/')));
    let parts: any[] = line.split(',');
    if (this.resource) {
      const cls = this.resource.get(parts[0]);
      this.data.set(name, new cbSound(name));
      this.data.get(name).setSound(new cls());
    } else {
      this.data.set(name, new cbSound(name, new URLRequest(parts[0])));
      this.data.get(name).progress.add(this.progress.emit);
    }
    const single = settings != null;
    if (single) {
      parts = settings;
    }
    const sound = this.data.get(name);
    const onComplete = (_event: any = null) => {
      sound.removeEventListener(IOErrorEvent.IO_ERROR, this.ioError);
      sound.removeEventListener(Event.COMPLETE, onComplete);
      if (single) {
        this.loaded.emit(this);
      } else {
        this.soundLoaded();
      }
    };
    sound.volume = parts[1] ? parts[1] : 1;
    sound.originalVolume = parts[1] ? parts[1] : 1;
    sound.startMilliseconds = parts[2] ? parts[2] : 0;
    sound.endMilliseconds = parts[3] ? parts[3] : 0;
    sound.addEventListener(IOErrorEvent.IO_ERROR, this.ioError);
    sound.addEventListener(Event.COMPLETE, onComplete);
    if (this.resource) {
      onComplete();
    }
  }
  ioError(event: any) {
    throw new Error('error loading file: ' + event.text);
  }
  /** one sound of the list is loaded */
  private soundLoaded() {
    ++this.bulk;
    if (this.bulk == this.total) {
      this.loaded.emit(this);
    }
  }
  loadOne(path: string, volume: number, startMs: number, endMs: number) {
    this.loadSound(path, [0, Number(volume), Number(startMs), Number(endMs)]);
  }
}
bindMethods(SoundLoader);
