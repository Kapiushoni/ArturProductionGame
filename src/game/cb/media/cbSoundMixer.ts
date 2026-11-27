import { Dictionary, SoundTransform, as3keys, as3values, bindMethods } from '@/flash/as3';
import type { cbSound } from '@/game/cb/media/cbSound';
import type { SoundMixable } from '@/game/cb/media/SoundMixable';

/** Plays the loaded sounds by name: one channel per sound, mute, pause / resume all, loops. */
export class cbSoundMixer implements SoundMixable {
  private _mute = false;
  /** Dictionary: name -> cbSound */
  private sounds: any = null;
  /** Dictionary: name -> SoundChannel */
  private channels: any = null;
  /** Dictionary: name -> channel, the sounds paused by pause() */
  private toResume: any = null;

  constructor(soundLoader: any) {
    this.sounds = soundLoader.data;
    this.channels = new Dictionary();
  }
  addSoundLoader(soundLoader: any) {
    for (const name of as3keys(soundLoader.data)) {
      this.sounds.set(name, soundLoader.data[name]);
    }
  }
  /** stops everything; nothing plays until unmute() */
  mute() {
    for (const sound of as3values(this.sounds)) {
      sound.stop();
    }
    for (const channel of as3values(this.channels)) {
      if (channel) {
        channel.stop();
      }
    }
    this._mute = true;
  }
  pause() {
    this.toResume = new Dictionary();
    for (const name of as3keys(this.channels)) {
      if (this.channels.get(name) != undefined && this.sounds.get(name).playing()) {
        this.toResume.set(name, this.channels.get(name));
        this.pauseSound(name);
      }
    }
  }
  pauseSound(name: string) {
    if (this.channels.get(name) == undefined) {
      return;
    }
    this.sounds.get(name).pause(this.channels.get(name).position);
    this.channels.get(name).stop();
  }
  resumeSound(name: string) {
    if (this._mute) {
      return;
    }
    this.channels.set(name, this.sounds.get(name).resume());
  }
  resume() {
    for (const name of as3keys(this.toResume)) {
      this.resumeSound(name);
    }
  }
  unmute() {
    this._mute = false;
  }
  isMuted(): boolean {
    return this._mute;
  }
  loopSound(name: string) {
    this.play(name, 0, true);
  }
  /** volume -1: the sound's own; a sound that is not loaded is skipped */
  play(name: string, start = 0, loop = false, volume = -1): cbSound {
    if (!this.sounds.get(name)) return null;
    start = Number(start);
    volume = Number(volume);
    if (this._mute) {
      return null;
    }
    if (loop) {
      this.sounds.get(name).onFinish(this.loopSound);
    }
    const transform = volume > -1 ? new SoundTransform(volume) : null;
    this.channels.set(name, this.sounds.get(name).play(start, 0, transform));
    return this.sounds.get(name);
  }
  stop(name: string) {
    if (this.channels.get(name) == undefined) {
      return;
    }
    this.channels.get(name).stop();
    this.channels.delete(name);
    if (this.toResume) {
      this.toResume.delete(name);
    }
    this.sounds.get(name).stop();
  }
  isPlaying(name: string): boolean {
    if (this.sounds.get(name) == undefined) {
      return false;
    }
    return this.sounds.get(name).playing();
  }
}
bindMethods(cbSoundMixer);
