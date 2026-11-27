import { bindMethods } from '@/flash/as3';
import { app } from '@/game/app';

export class EmptyInnerView {
  _soundTrack: string = null;
  constructor(soundTrack: string) {
    this._soundTrack = soundTrack;
  }
  resume() {}
  pause() {}
  clear() {}
  playMusic() {
    app.soundManager.playMusic(this._soundTrack);
  }
  stopMusic() {
    app.soundManager.stopMusic(this._soundTrack);
  }
}
bindMethods(EmptyInnerView);
