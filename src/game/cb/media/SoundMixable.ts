// @ts-nocheck

export interface SoundMixable {
  mute(): any;
  unmute(): any;
  isMuted(): any;
  queue(param1, param2, param3 = false): any;
  play(param1, param2 = 0, param3 = false, param4 = -1): any;
  stop(param1): any;
}
