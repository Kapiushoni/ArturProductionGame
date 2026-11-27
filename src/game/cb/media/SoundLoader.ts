import { Dictionary, Event, IOErrorEvent, URLRequest, bindMethods } from '@/flash/as3';
import { cbSound } from '@/game/cb/media/cbSound';
import { Signal } from '@/game/cb/signals/Signal';
import { loadLines } from '@/game/loader/files';

/**
 * Loads the sounds listed in a text file (one "path,volume,startMs,endMs" per line); `data` maps
 * the file name (without folder and extension) to its cbSound. loaded(this) when all have loaded.
 */
export class SoundLoader {
  /** Dictionary: name -> cbSound */
  data = new Dictionary();
  readonly loaded = new Signal();
  /** progress(bytes) */
  readonly progress = new Signal();
  private bulk = 0;
  private total = 0;

  constructor(private listFile: string) {}

  async load() {
    const lines = (await loadLines(this.listFile)).filter((line) => line != '');
    this.total = lines.length;
    for (const line of lines) this.loadSound(line);
  }
  /** line: "path,volume,startMs,endMs" */
  private loadSound(line: string) {
    const name = line.slice(line.lastIndexOf('/') + 1, line.indexOf('.', line.lastIndexOf('/')));
    const parts: any[] = line.split(',');
    const sound = new cbSound(name, new URLRequest(parts[0]));
    this.data.set(name, sound);
    sound.progress.add(this.progress.emit);
    const onComplete = () => {
      sound.removeEventListener(IOErrorEvent.IO_ERROR, this.ioError);
      sound.removeEventListener(Event.COMPLETE, onComplete);
      if (++this.bulk == this.total) this.loaded.emit(this);
    };
    sound.volume = parts[1] ? parts[1] : 1;
    sound.originalVolume = parts[1] ? parts[1] : 1;
    sound.startMilliseconds = parts[2] ? parts[2] : 0;
    sound.endMilliseconds = parts[3] ? parts[3] : 0;
    sound.addEventListener(IOErrorEvent.IO_ERROR, this.ioError);
    sound.addEventListener(Event.COMPLETE, onComplete);
  }
  ioError(event: any) {
    throw new Error('error loading file: ' + event.text);
  }
}
bindMethods(SoundLoader, ['load', 'ioError']);
