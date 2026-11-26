// @ts-nocheck
import { AudioTimer, ProgressEvent, Sound, SoundTransform, TimerEvent, as3values, bindMethods, int } from '@/flash/as3';
import { Signal } from '@/game/cb/signals/Signal';

export class cbSound {
  volume = Number(1);
  originalVolume = Number(1);
  startMilliseconds = Number(0);
  endMilliseconds = Number(0);
  declare endTimer: any;
  declare qSound: any;
  isPlaying = false;
  paused = false;
  declare atFinish: any;
  declare name: any;
  currentSndTr = null;
  declare sound: any;
  declare positionToResume: any;
  saveAtFinish = false;
  declare progress: any;
  declare loadedSoFar: any;
  constructor(name, urlRequest = null) {
         
         this.atFinish = new Array();
         this.progress = new Signal();
         this.name = name;
         if(urlRequest == null)
         {
            return;
         }
         this.sound = new Sound(urlRequest);
         this.sound.addEventListener(ProgressEvent.PROGRESS,this.progressListener,false,0,true);
      }
  progressListener(event) {
         this.progress.emit(event.bytesLoaded - this.loadedSoFar);
         this.loadedSoFar = int(event.bytesLoaded);
         if(event.bytesLoaded == event.bytesTotal)
         {
            this.progress.clear();
         }
      }
  setSound(sound) {
         this.sound = sound;
      }
  playing() {
         return this.isPlaying;
      }
  play(num = 0, num2 = 0, soundTransform = null) { num = Number(num); num2 = int(num2);
         this.isPlaying = true;
         this.paused = false;
         this.endTimer = new AudioTimer(this.sound.length - this.startMilliseconds - this.endMilliseconds,1);
         this.endTimer.addEventListener(TimerEvent.TIMER,this.soundComplete,false,0,true);
         this.endTimer.start();
         var num3 = Number(num == 0 ? this.startMilliseconds : 0);
         var soundTransform2 = this.setCurrentTransform(soundTransform);
         if(num3 == 0 && num != 0)
         {
            num3 = Number(num);
         }
         return this.sound.play(num3,num2,soundTransform2);
      }
  stop() {
         this.isPlaying = false;
         if(this.endTimer)
         {
            this.endTimer.stop();
            this.endTimer.reset();
         }
         if(this.saveAtFinish)
         {
            this.saveAtFinish = false;
         }
         else
         {
            this.atFinish = new Array();
         }
         this.currentSndTr = null;
      }
  isPaused() {
         return this.paused;
      }
  pause(positionToResume) { positionToResume = Number(positionToResume);
         this.isPlaying = false;
         this.paused = true;
         if(this.endTimer)
         {
            this.endTimer.stop();
         }
         this.saveAtFinish = true;
         this.positionToResume = Number(positionToResume);
      }
  setCurrentTransform(soundTransform) {
         var currentSndTr = null;
         if(soundTransform == null)
         {
            if(this.currentSndTr)
            {
               currentSndTr = this.currentSndTr;
            }
            else
            {
               currentSndTr = new SoundTransform(this.volume);
               this.currentSndTr = currentSndTr;
            }
         }
         else
         {
            currentSndTr = soundTransform;
            this.currentSndTr = currentSndTr;
         }
         return currentSndTr;
      }
  resume() {
         var num = int(0);
         this.isPlaying = true;
         this.paused = false;
         if(this.endTimer)
         {
            num = int(this.sound.length - this.positionToResume - this.endMilliseconds);
            if(num < 0)
            {
               num = int(1);
            }
            this.endTimer.delay = num;
            if(!this.endTimer.hasEventListener(TimerEvent.TIMER))
            {
               this.endTimer.addEventListener(TimerEvent.TIMER,this.soundComplete);
            }
            this.endTimer.start();
         }
         var soundTransform = this.setCurrentTransform(this.currentSndTr);
         return this.sound.play(this.positionToResume,0,soundTransform);
      }
  onFinish(callback) {
         this.atFinish.push(callback);
      }
  soundComplete(event) {
         var loc2_Item = null;
         this.isPlaying = false;
         this.endTimer.removeEventListener(TimerEvent.TIMER,this.soundComplete);
         var list = new Array();
         for (loc2_Item of as3values(this.atFinish))
         {
            list.push(loc2_Item);
         }
         this.atFinish = new Array();
         for (loc2_Item of as3values(list))
         {
            loc2_Item(this.name);
         }
      }
  addEventListener(text, callback, flag = false, num = 0, flag2 = false) { num = int(num);
         this.sound.addEventListener(text,callback,flag,num,flag2);
      }
  dispatchEvent(event) {
         return this.sound.dispatchEvent(event);
      }
  hasEventListener(text) {
         return this.sound.hasEventListener(text);
      }
  removeEventListener(text, callback, flag = false) {
         this.sound.removeEventListener(text,callback,flag);
      }
  willTrigger(text) {
         return this.sound.willTrigger(text);
      }
}
cbSound.prototype.endTimer = null;
cbSound.prototype.qSound = null;
cbSound.prototype.atFinish = null;
cbSound.prototype.name = null;
cbSound.prototype.sound = null;
cbSound.prototype.positionToResume = NaN;
cbSound.prototype.progress = null;
cbSound.prototype.loadedSoFar = 0;
bindMethods(cbSound);
