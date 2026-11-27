import { bindMethods } from '@/flash/as3';
import { main } from '@/game/main';

export class EmptyInnerView {
  _soundTrack: any = null;
  constructor(soundTrack) {
    this._soundTrack = soundTrack;
  }
  resume() {}
  pause() {}
  clear() {}
  playMusic() {
    main.soundManager.playMusic(this._soundTrack);
  }
  stopMusic() {
    main.soundManager.stopMusic(this._soundTrack);
  }
}
bindMethods(EmptyInnerView);
