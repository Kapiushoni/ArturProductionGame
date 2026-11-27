import { as3values, bindMethods } from '@/flash/as3';
import { ButtonInfo } from '@/game/cb/data/ButtonInfo';

/**
 * Buttons that share sounds and extra handlers (ButtonGroup.get("gui")): every button made with
 * createButton() also runs the group's click / over / out handlers and plays its sounds.
 */
export class ButtonGroup {
  static groups: any = [];
  private soundMixer: any = null;
  private clickSound: string = null;
  private overSound: string = null;
  private mouseOutFuncs: Function[];
  private mouseOverFuncs: Function[];
  private clickFuncs: Function[];

  constructor() {
    this.mouseOutFuncs = [];
    this.mouseOverFuncs = [];
    this.clickFuncs = [];
  }
  static get(name: string): ButtonGroup {
    if (ButtonGroup.groups[name] == undefined) {
      ButtonGroup.groups[name] = new ButtonGroup();
    }
    return ButtonGroup.groups[name];
  }
  setSoundMixer(soundMixer: any): ButtonGroup {
    this.soundMixer = soundMixer;
    return this;
  }
  setClickSound(sound: string): ButtonGroup {
    this.clickSound = sound;
    return this;
  }
  setOverSound(sound: string): ButtonGroup {
    this.overSound = sound;
    return this;
  }
  /** over / out: a handler or a frame label */
  createButton(
    click: Function,
    over: any = null,
    out: any = null,
    playLabels = true,
    hitBox: string = null,
  ): ButtonInfo {
    if (typeof over === 'string') {
      over = ButtonInfo.defaultGoto(over, playLabels, hitBox);
    }
    if (typeof out === 'string') {
      out = ButtonInfo.defaultGoto(out, playLabels, hitBox);
    }
    const onClick = this.createFunc(click, this.clickSound, this.clickFuncs);
    const onOver = this.createFunc(over, this.overSound, this.mouseOverFuncs);
    const onOut = this.createFunc(out, null, this.mouseOutFuncs);
    return new ButtonInfo(onClick, onOver, onOut, playLabels, hitBox);
  }
  addClick(handler: Function): ButtonGroup {
    this.clickFuncs.push(handler);
    return this;
  }
  /** one handler running: the group's handlers (as they are now), then callback, then the sound */
  createFunc(callback: Function, sound: string, groupHandlers: Function[]): (event: any) => void {
    const handlers = [];
    if (callback != null) {
      handlers.push(callback);
    }
    if (sound) {
      handlers.push((_event: any) => {
        this.soundMixer.play(sound);
      });
    }
    const all = groupHandlers.concat(handlers);
    return (event: any) => {
      for (const handler of as3values(all)) {
        handler(event);
      }
    };
  }
}
bindMethods(ButtonGroup);
