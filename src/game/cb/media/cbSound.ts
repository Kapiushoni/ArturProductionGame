import { AudioTimer, ProgressEvent, Sound, SoundTransform, TimerEvent, as3values, bindMethods, int } from '@/flash/as3';
import { Signal } from '@/game/cb/signals/Signal';

/**
 * One sound (a Flash Sound) with its volume and trimmed start / end. Knows when it finishes
 * (a timer on the audio clock), can pause / resume, and calls the onFinish callbacks with its name.
 */
export class cbSound {
  volume: any = 1;
  originalVolume: any = 1;
  /** ms skipped at the start / end */
  startMilliseconds: any = 0;
  endMilliseconds: any = 0;
  private endTimer: any = null;
  qSound: any = null;
  isPlaying = false;
  paused = false;
  /** callbacks(name) for the end of the current play */
  private atFinish: Function[];
  name: string;
  private currentSndTr: SoundTransform = null;
  private sound: any = null;
  private positionToResume = NaN;
  private saveAtFinish = false;
  /** progress(bytes) while loading */
  progress: Signal;
  private loadedSoFar = 0;

  constructor(name: string, request: any = null) {
    this.atFinish = [];
    this.progress = new Signal();
    this.name = name;
    if (request == null) {
      return;
    }
    this.sound = new Sound(request);
    this.sound.addEventListener(ProgressEvent.PROGRESS, this.progressListener, false, 0, true);
  }
  progressListener(event: any) {
    this.progress.emit(event.bytesLoaded - this.loadedSoFar);
    this.loadedSoFar = int(event.bytesLoaded);
    if (event.bytesLoaded == event.bytesTotal) {
      this.progress.clear();
    }
  }
  setSound(sound: any) {
    this.sound = sound;
  }
  playing(): boolean {
    return this.isPlaying;
  }
  /** plays from `start` ms (default: the trimmed start); returns the SoundChannel */
  play(start = 0, loops = 0, transform: SoundTransform = null): any {
    start = Number(start);
    loops = int(loops);
    this.isPlaying = true;
    this.paused = false;
    this.endTimer = new AudioTimer(this.sound.length - this.startMilliseconds - this.endMilliseconds, 1);
    this.endTimer.addEventListener(TimerEvent.TIMER, this.soundComplete, false, 0, true);
    this.endTimer.start();
    let position = Number(start == 0 ? this.startMilliseconds : 0);
    const soundTransform = this.setCurrentTransform(transform);
    if (position == 0 && start != 0) {
      position = start;
    }
    return this.sound.play(position, loops, soundTransform);
  }
  stop() {
    this.isPlaying = false;
    if (this.endTimer) {
      this.endTimer.stop();
      this.endTimer.reset();
    }
    // after a pause the finish callbacks are kept for the resume
    if (this.saveAtFinish) {
      this.saveAtFinish = false;
    } else {
      this.atFinish = [];
    }
    this.currentSndTr = null;
  }
  isPaused(): boolean {
    return this.paused;
  }
  pause(positionToResume: number) {
    this.isPlaying = false;
    this.paused = true;
    if (this.endTimer) {
      this.endTimer.stop();
    }
    this.saveAtFinish = true;
    this.positionToResume = Number(positionToResume);
  }
  /** the transform to play with: the given one, else the current one, else one with `volume` */
  setCurrentTransform(transform: SoundTransform): SoundTransform {
    if (transform == null) {
      if (!this.currentSndTr) {
        this.currentSndTr = new SoundTransform(this.volume);
      }
      return this.currentSndTr;
    }
    this.currentSndTr = transform;
    return transform;
  }
  resume(): any {
    this.isPlaying = true;
    this.paused = false;
    if (this.endTimer) {
      let remaining = int(this.sound.length - this.positionToResume - this.endMilliseconds);
      if (remaining < 0) {
        remaining = 1;
      }
      this.endTimer.delay = remaining;
      if (!this.endTimer.hasEventListener(TimerEvent.TIMER)) {
        this.endTimer.addEventListener(TimerEvent.TIMER, this.soundComplete);
      }
      this.endTimer.start();
    }
    const soundTransform = this.setCurrentTransform(this.currentSndTr);
    return this.sound.play(this.positionToResume, 0, soundTransform);
  }
  onFinish(callback: Function) {
    this.atFinish.push(callback);
  }
  soundComplete(_event: any) {
    this.isPlaying = false;
    this.endTimer.removeEventListener(TimerEvent.TIMER, this.soundComplete);
    const callbacks = [...this.atFinish];
    this.atFinish = [];
    for (const callback of as3values(callbacks)) {
      callback(this.name);
    }
  }
  // ---- events of the underlying Sound
  addEventListener(type: string, listener: Function, useCapture = false, priority = 0, weak = false) {
    this.sound.addEventListener(type, listener, useCapture, int(priority), weak);
  }
  dispatchEvent(event: any): boolean {
    return this.sound.dispatchEvent(event);
  }
  hasEventListener(type: string): boolean {
    return this.sound.hasEventListener(type);
  }
  removeEventListener(type: string, listener: Function, useCapture = false) {
    this.sound.removeEventListener(type, listener, useCapture);
  }
  willTrigger(type: string): boolean {
    return this.sound.willTrigger(type);
  }
}
bindMethods(cbSound);
