// @ts-nocheck
import { bindMethods } from '@/flash/as3';

export class MusicRequest {
  declare soundName: any;
  declare startTime: any;
  declare volume: any;
  constructor(soundName, startTime, volume) { startTime = Number(startTime); volume = Number(volume);
         
         this.soundName = soundName;
         this.startTime = Number(startTime);
         this.volume = Number(volume);
      }
  equal(musicRequest) {
         return this.soundName == musicRequest.getName() && this.startTime == musicRequest.getStartTime() && this.volume == musicRequest.getVolume();
      }
  getName() {
         return this.soundName;
      }
  getVolume() {
         return Number(this.volume);
      }
  getStartTime() {
         return Number(this.startTime);
      }
}
MusicRequest.prototype.soundName = null;
MusicRequest.prototype.startTime = NaN;
MusicRequest.prototype.volume = NaN;
bindMethods(MusicRequest);
