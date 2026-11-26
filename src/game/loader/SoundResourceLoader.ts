// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { SoundLoader } from '@/game/cb/media/SoundLoader';
import { Util } from '@/game/util/Util';

export class SoundResourceLoader {
  declare soundManager: any;
  constructor(soundManager) {
         
         this.soundManager = soundManager;
      }
  load(text, callback) {
         var soundLoader = new SoundLoader(text);
         soundLoader.loaded.add(Util.l(this.soundLoaded,callback));
         soundLoader.load();
      }
  soundLoaded(soundLoader, callback) {
         this.soundManager.addSound(soundLoader);
         callback();
      }
}
SoundResourceLoader.prototype.soundManager = null;
bindMethods(SoundResourceLoader);
