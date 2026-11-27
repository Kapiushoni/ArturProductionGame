import { bindMethods } from '@/flash/as3';
import { SoundLoader } from '@/game/cb/media/SoundLoader';
import { Util } from '@/game/util/Util';
import type { ResourceLoader } from '@/game/loader/ResourceLoader';

/** Loads a sound list (.snd) for the PostLoader and adds the sounds to the sound manager. */
export class SoundResourceLoader implements ResourceLoader {
  private soundManager: any;

  constructor(soundManager: any) {
    this.soundManager = soundManager;
  }
  load(listFile: string, callback: Function) {
    const loader = new SoundLoader(listFile);
    loader.loaded.add(Util.l(this.soundLoaded, callback));
    loader.load();
  }
  soundLoaded(loader: SoundLoader, callback: Function) {
    this.soundManager.addSound(loader);
    callback();
  }
}
bindMethods(SoundResourceLoader);
