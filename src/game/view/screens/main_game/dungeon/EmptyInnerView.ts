// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { main } from '@/game/main';

export class EmptyInnerView {
  declare _soundTrack: any;
  constructor(soundTrack) {
         
         this._soundTrack = soundTrack;
      }
  resume() {
      }
  pause() {
      }
  clear() {
      }
  playMusic() {
         main.soundManager.playMusic(this._soundTrack);
      }
  stopMusic() {
         main.soundManager.stopMusic(this._soundTrack);
      }
}
EmptyInnerView.prototype._soundTrack = null;
bindMethods(EmptyInnerView);
