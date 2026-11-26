// @ts-nocheck
import { Dictionary, SoundTransform, as3keys, as3values, bindMethods, uint } from '@/flash/as3';
import { Tween } from '@/game/cb/utils/Tween';

export class cbSoundMixer {
  declare _mute: any;
  declare paused: any;
  declare sounds: any;
  declare channels: any;
  declare toPause: any;
  declare queueDic: any;
  declare toResume: any;
  declare fades: any;
  constructor(soundLoader) {
         
         this.sounds = soundLoader.data;
         this.channels = new Dictionary();
         this.toPause = new Array();
         this.queueDic = new Dictionary();
         this.fades = new Dictionary();
         this.paused = false;
         this._mute = false;
      }
  addSoundLoader(soundLoader) {
         var key = null;
         for (key of as3keys(soundLoader.data))
         {
            this.sounds.set(key, soundLoader.data[key]);
         }
      }
  mute() {
         var sound = null;
         var channel = null;
         for (sound of as3values(this.sounds))
         {
            sound.stop();
         }
         for (channel of as3values(this.channels))
         {
            if(channel)
            {
               channel.stop();
            }
         }
         this._mute = true;
      }
  pause() {
         var key = null;
         this.paused = true;
         this.toResume = new Dictionary();
         for (key of as3keys(this.channels))
         {
            if(this.channels.get(key) != undefined)
            {
               if(this.sounds.get(key).playing())
               {
                  this.toResume.set(key, this.channels.get(key));
                  this.pauseSound(key);
               }
            }
         }
      }
  pauseSound(text) {
         if(this.channels.get(text) == undefined)
         {
            return;
         }
         this.sounds.get(text).pause(this.channels.get(text).position);
         this.channels.get(text).stop();
      }
  resumeSound(text) {
         if(this._mute)
         {
            return;
         }
         this.channels.set(text, this.sounds.get(text).resume());
      }
  isSongPaused(text) {
         return this.sounds.get(text).isPaused();
      }
  isPaused() {
         return this.paused;
      }
  resume() {
         var key = null;
         this.paused = false;
         for (key of as3keys(this.toResume))
         {
            this.resumeSound(key);
         }
      }
  unmute() {
         this._mute = false;
      }
  isMuted() {
         return this._mute;
      }
  queue(text, cbSound, flag = false) {
         if(this._mute)
         {
            return null;
         }
         cbSound.onFinish(this.soundFinish);
         this.queueDic.set(cbSound, {
            "snd":text,
            "loop":flag
         });
         return this.sounds.get(text);
      }
  soundFinish(text) {
         var cbSound = null;
         if(this._mute)
         {
            this.queueDic.delete(cbSound);
            return;
         }
         cbSound = this.sounds.get(text);
         this.play(this.queueDic.get(cbSound).snd,0,this.queueDic.get(cbSound).loop);
         this.queueDic.delete(cbSound);
      }
  loopSound(text) {
         this.play(text,0,true);
      }
  changeVolume(text, num) { num = Number(num);
         this.sounds.get(text).volume = num;
         this.channels.get(text).soundTransform = new SoundTransform(num);
      }
  play(text, num = 0, flag = false, num2 = -1) { if (!this.sounds.get(text)) return null; num = Number(num); num2 = Number(num2);
         if(this._mute)
         {
            return null;
         }
         if(flag)
         {
            this.sounds.get(text).onFinish(this.loopSound);
         }
         var soundTransform = null;
         if(num2 > -1)
         {
            soundTransform = new SoundTransform(num2);
         }
         this.channels.set(text, this.sounds.get(text).play(num,0,soundTransform));
         return this.sounds.get(text);
      }
  stop(text) {
         if(this.channels.get(text) == undefined)
         {
            return;
         }
         this.channels.get(text).stop();
         this.channels.delete(text);
         if(this.toResume)
         {
            this.toResume.delete(text);
         }
         this.sounds.get(text).stop();
      }
  isPlaying(text) {
         if(this.sounds.get(text) == undefined)
         {
            return false;
         }
         return this.sounds.get(text).playing();
      }
  fadeIn(text, num) { num = uint(num); const __self = this;
         var channel = null;
         var obj = null;
         var sound = text;
         var time = uint(num);
         channel = this.channels.get(sound);
         if(!channel)
         {
            return null;
         }
         if(this.fades.get(channel))
         {
            Tween.killTweensOf(this.fades.get(channel));
         }
         obj = {"volume":0};
         this.fades.set(channel, obj);
         channel.soundTransform = new SoundTransform(0);
         Tween.to(obj,time,{"volume":this.sounds.get(sound).originalVolume},function()
         {
            __self.changeVolume(sound,obj.volume);
            __self.sounds.get(sound).setCurrentTransform(new SoundTransform(obj.volume));
            __self.fades.delete(channel);
         },function()
         {
            __self.changeVolume(sound,obj.volume);
         });
         return this.sounds.get(sound);
      }
  fadeOut(text, num) { num = uint(num); const __self = this;
         var channel = null;
         var obj = null;
         var sound = text;
         var time = uint(num);
         channel = this.channels.get(sound);
         if(!channel)
         {
            return null;
         }
         if(this.fades.get(channel))
         {
            Tween.killTweensOf(this.fades.get(channel));
         }
         obj = {"volume":this.sounds.get(sound).volume};
         this.fades.set(channel, obj);
         Tween.to(obj,time,{"volume":0},function()
         {
            __self.changeVolume(sound,obj.volume);
            __self.sounds.get(sound).setCurrentTransform(new SoundTransform(obj.volume));
            __self.fades.delete(channel);
         },function()
         {
            __self.changeVolume(sound,obj.volume);
         });
         return this.sounds.get(sound);
      }
}
cbSoundMixer.prototype._mute = false;
cbSoundMixer.prototype.paused = false;
cbSoundMixer.prototype.sounds = null;
cbSoundMixer.prototype.channels = null;
cbSoundMixer.prototype.toPause = null;
cbSoundMixer.prototype.queueDic = null;
cbSoundMixer.prototype.toResume = null;
cbSoundMixer.prototype.fades = null;
bindMethods(cbSoundMixer);
