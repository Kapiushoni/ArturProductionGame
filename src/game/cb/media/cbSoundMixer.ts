import { Dictionary, SoundTransform, as3keys, as3values, bindMethods, uint } from '@/flash/as3';
import { Tween } from '@/game/cb/utils/Tween';
import type { cbSound } from '@/game/cb/media/cbSound';
import type { SoundMixable } from '@/game/cb/media/SoundMixable';

/** Plays the loaded sounds by name: one channel per sound, mute, pause / resume all, loops, queues, fades. */
export class cbSoundMixer implements SoundMixable {
  private _mute = false;
  private paused = false;
  /** Dictionary: name -> cbSound */
  private sounds: any = null;
  /** Dictionary: name -> SoundChannel */
  private channels: any = null;
  private toPause: any[] = null;
  /** Dictionary: waiting cbSound -> { snd: sound to play after it, loop } */
  private queueDic: any = null;
  /** Dictionary: name -> channel, the sounds paused by pause() */
  private toResume: any = null;
  /** Dictionary: channel -> tweened { volume } */
  private fades: any = null;

  constructor(soundLoader: any) {
    this.sounds = soundLoader.data;
    this.channels = new Dictionary();
    this.toPause = [];
    this.queueDic = new Dictionary();
    this.fades = new Dictionary();
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
    this.paused = true;
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
  isSongPaused(name: string): boolean {
    return this.sounds.get(name).isPaused();
  }
  isPaused(): boolean {
    return this.paused;
  }
  resume() {
    this.paused = false;
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
  /** plays `name` when `after` finishes */
  queue(name: string, after: cbSound, loop = false): cbSound {
    if (this._mute) {
      return null;
    }
    after.onFinish(this.soundFinish);
    this.queueDic.set(after, { snd: name, loop });
    return this.sounds.get(name);
  }
  soundFinish(name: string) {
    const sound = this.sounds.get(name);
    if (this._mute) {
      this.queueDic.delete(sound);
      return;
    }
    this.play(this.queueDic.get(sound).snd, 0, this.queueDic.get(sound).loop);
    this.queueDic.delete(sound);
  }
  loopSound(name: string) {
    this.play(name, 0, true);
  }
  changeVolume(name: string, volume: number) {
    volume = Number(volume);
    this.sounds.get(name).volume = volume;
    this.channels.get(name).soundTransform = new SoundTransform(volume);
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
  fadeIn(name: string, time: number): cbSound {
    return this.fade(name, time, 0, this.sounds.get(name)?.originalVolume, true);
  }
  fadeOut(name: string, time: number): cbSound {
    return this.fade(name, time, this.sounds.get(name)?.volume, 0, false);
  }
  /** tweens the volume of the playing sound from -> to */
  private fade(name: string, time: number, from: number, to: number, startSilent: boolean): cbSound {
    time = uint(time);
    const channel = this.channels.get(name);
    if (!channel) {
      return null;
    }
    if (this.fades.get(channel)) {
      Tween.killTweensOf(this.fades.get(channel));
    }
    const fade = { volume: from };
    this.fades.set(channel, fade);
    if (startSilent) {
      channel.soundTransform = new SoundTransform(0);
    }
    Tween.to(
      fade,
      time,
      { volume: to },
      () => {
        this.changeVolume(name, fade.volume);
        this.sounds.get(name).setCurrentTransform(new SoundTransform(fade.volume));
        this.fades.delete(channel);
      },
      () => {
        this.changeVolume(name, fade.volume);
      },
    );
    return this.sounds.get(name);
  }
}
bindMethods(cbSoundMixer);
