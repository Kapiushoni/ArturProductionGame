import { MovieClip, as3as, bindMethods, int } from '@/flash/as3';
import { ButtonGroup } from '@/game/cb/data/ButtonGroup';
import { cbSoundMixer } from '@/game/cb/media/cbSoundMixer';
import { cbArray } from '@/game/cb/utils/cbArray';
import { app } from '@/game/app';
import { GameSounds } from '@/game/sound/GameSounds';
import { MusicRequest } from '@/game/sound/MusicRequest';

/**
 * The game's sound (app.soundManager): effects, and a stack of musics (the last requested plays;
 * stopping it brings back the previous one). Also the sounds of the button groups and the mute button.
 */
export class SoundManager {
  private soundMixer: cbSoundMixer = null;
  private musicList: cbArray;

  constructor() {
    this.musicList = new cbArray();
  }
  addSound(soundLoader: any) {
    this.soundMixer.addSoundLoader(soundLoader);
  }
  /** with the first loaded sounds */
  start(soundLoader: any) {
    this.soundMixer = new cbSoundMixer(soundLoader);
    this.initializeSound();
  }
  ready(): boolean {
    return this.soundMixer != null;
  }
  initializeSound() {
    ButtonGroup.get('gui')
      .setSoundMixer(this.soundMixer)
      .setClickSound(GameSounds.BUTTON_CLICK)
      .setOverSound(GameSounds.MOUSE_OVER);
    ButtonGroup.get('gui_mix')
      .setSoundMixer(this.soundMixer)
      .setClickSound(GameSounds.MIX_CLICK)
      .setOverSound(GameSounds.MOUSE_OVER);
    ButtonGroup.get('sound_gui')
      .setSoundMixer(this.soundMixer)
      .setClickSound(GameSounds.BUTTON_CLICK)
      .setOverSound(GameSounds.MOUSE_OVER)
      .addClick(this.onSoundClick);
    if (app.saveSystem.isSoundMuted()) {
      this.soundMixer.mute();
    }
  }
  /** the mute button: toggles, saves, and restarts the music when unmuting */
  onSoundClick(event: any) {
    if (this.soundMixer.isMuted()) {
      this.soundMixer.unmute();
      const music = this.actualMusic;
      if (music != null) {
        this.playRequest(music);
      }
    } else {
      this.soundMixer.mute();
    }
    app.saveSystem.saveMuteState(this.soundMixer.isMuted());
    this.updateSoundButton(as3as(event.currentTarget, MovieClip));
  }
  updateSoundButton(button: any) {
    const icon = as3as(button.getChildByName('icon'), MovieClip);
    const frame = as3as(button.getChildByName('frame'), MovieClip);
    if (!icon) {
      return;
    }
    const label = this.soundMixer.isMuted() ? 'off' : 'on';
    icon.gotoAndStop(label);
    frame.gotoAndStop(label);
  }
  /** plays a music on top of the stack (nothing if it is already the current one) */
  playMusic(name: string, start = 0, volume = -1): any {
    const request = new MusicRequest(name, Number(start), Number(volume));
    if (this.musicList.length != 0) {
      const current = this.actualMusic;
      if (current.equal(request)) {
        return null;
      }
      this.stopMusic(current.getName());
    }
    this.musicList.push(request);
    return this.playRequest(request);
  }
  /** removes a music from the stack (default: the current one); stopping the current one resumes the previous */
  stopMusic(name = '') {
    if (name == '' && this.actualMusic != null) {
      name = this.actualMusic.getName();
    }
    if (this.musicList.length == 0) {
      return;
    }
    if (this.actualMusic.getName() != name) {
      for (let i = int(this.musicList.length - 2); i >= 0; i--) {
        const music = this.musicList[i];
        if (music.getName() == name) {
          this.musicList.remove(music);
          break;
        }
      }
    } else {
      this.musicList.pop();
      this.soundMixer.stop(name);
      const previous = this.actualMusic;
      if (previous != null) {
        this.playRequest(previous);
      }
    }
  }
  get actualMusic(): MusicRequest | null {
    if (this.musicList.length == 0) {
      return null;
    }
    return this.musicList[this.musicList.length - 1];
  }
  playFx(name: string, start = 0, volume = -1): any {
    return this.soundMixer.play(name, Number(start), false, Number(volume));
  }
  stopFx(name: string) {
    this.soundMixer.stop(name);
  }
  playRequest(request: MusicRequest): any {
    return this.soundMixer.play(request.getName(), request.startTime, true, request.volume);
  }
  resumeSound(name: string) {
    this.soundMixer.resumeSound(name);
  }
  pauseSound(name: string) {
    this.soundMixer.pauseSound(name);
  }
  isPlaying(name: string): boolean {
    return this.soundMixer.isPlaying(name);
  }
}
bindMethods(SoundManager);
