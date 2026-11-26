// @ts-nocheck
import { MovieClip, as3as, bindMethods, int } from '@/flash/as3';
import { ButtonGroup } from '@/game/cb/data/ButtonGroup';
import { cbSoundMixer } from '@/game/cb/media/cbSoundMixer';
import { cbArray } from '@/game/cb/utils/cbArray';
import { main } from '@/game/main';
import { GameSounds } from '@/game/sound/GameSounds';
import { MusicRequest } from '@/game/sound/MusicRequest';

export class SoundManager {
  declare soundMixer: any;
  declare musicList: any;
  constructor() {
         
         this.musicList = new cbArray();
      }
  addSound(soundLoader) {
         this.soundMixer.addSoundLoader(soundLoader);
      }
  start(soundLoader) {
         this.soundMixer = new cbSoundMixer(soundLoader);
         this.initializeSound();
      }
  ready() {
         return this.soundMixer != null;
      }
  initializeSound() {
         ButtonGroup.get("gui").setSoundMixer(this.soundMixer).setClickSound(GameSounds.BUTTON_CLICK).setOverSound(GameSounds.MOUSE_OVER);
         ButtonGroup.get("gui_mix").setSoundMixer(this.soundMixer).setClickSound(GameSounds.MIX_CLICK).setOverSound(GameSounds.MOUSE_OVER);
         ButtonGroup.get("sound_gui").setSoundMixer(this.soundMixer).setClickSound(GameSounds.BUTTON_CLICK).setOverSound(GameSounds.MOUSE_OVER).addClick(this.onSoundClick);
         if(main.saveSystem.isSoundMuted())
         {
            this.soundMixer.mute();
         }
      }
  onSoundClick(event) {
         var actualMusic = null;
         if(this.soundMixer.isMuted())
         {
            this.soundMixer.unmute();
            actualMusic = this.actualMusic;
            if(actualMusic != null)
            {
               this.playRequest(actualMusic);
            }
         }
         else
         {
            this.soundMixer.mute();
         }
         main.saveSystem.saveMuteState(this.soundMixer.isMuted());
         this.updateSoundButton(as3as(event.currentTarget, MovieClip));
      }
  updateSoundButton(clip) {
         var clip2 = as3as(clip.getChildByName("icon"), MovieClip);
         var clip3 = as3as(clip.getChildByName("frame"), MovieClip);
         if(!clip2)
         {
            return;
         }
         if(this.soundMixer.isMuted())
         {
            clip2.gotoAndStop("off");
            clip3.gotoAndStop("off");
         }
         else
         {
            clip2.gotoAndStop("on");
            clip3.gotoAndStop("on");
         }
      }
  playMusic(text, num = 0, num2 = -1) { num = Number(num); num2 = Number(num2);
         var actualMusic = null;
         var musicRequest = new MusicRequest(text,num,num2);
         if(this.musicList.length != 0)
         {
            actualMusic = this.actualMusic;
            if(actualMusic.equal(musicRequest))
            {
               return null;
            }
            this.stopMusic(actualMusic.getName());
         }
         this.musicList.push(musicRequest);
         return this.playRequest(musicRequest);
      }
  stopMusic(text = "") {
         var value = 0;
         if(text == "" && this.actualMusic != null)
         {
            text = this.actualMusic.getName();
         }
         if(this.musicList.length == 0)
         {
            return;
         }
         var actualMusic = this.actualMusic;
         if(actualMusic.getName() != text)
         {
            value = int(this.musicList.length - 2);
            while(value >= 0)
            {
               actualMusic = this.musicList[value];
               if(actualMusic.getName() == text)
               {
                  this.musicList.remove(actualMusic);
                  break;
               }
               value--;
            }
         }
         else
         {
            this.musicList.pop();
            this.soundMixer.stop(text);
            actualMusic = this.actualMusic;
            if(actualMusic != null)
            {
               this.playRequest(actualMusic);
            }
         }
      }
  get actualMusic() {
         if(this.musicList.length == 0)
         {
            return null;
         }
         return this.musicList[this.musicList.length - 1];
      }
  playFx(text, num = 0, num2 = -1) { num = Number(num); num2 = Number(num2);
         return this.soundMixer.play(text,num,false,num2);
      }
  stopFx(text) {
         this.soundMixer.stop(text);
      }
  playRequest(musicRequest) {
         return this.soundMixer.play(musicRequest.getName(),musicRequest.getStartTime(),true,musicRequest.getVolume());
      }
  resumeSound(text) {
         this.soundMixer.resumeSound(text);
      }
  pauseSound(text) {
         this.soundMixer.pauseSound(text);
      }
  isPlaying(text) {
         return this.soundMixer.isPlaying(text);
      }
}
SoundManager.prototype.soundMixer = null;
SoundManager.prototype.musicList = null;
bindMethods(SoundManager);
