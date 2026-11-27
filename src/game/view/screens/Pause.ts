import { Dictionary, bindMethods, uint } from '@/flash/as3';
import { AnimatedScreen } from '@/game/view/screens/AnimatedScreen';
import { ButtonGroup } from '@/game/cb/data/ButtonGroup';
import { Signal } from '@/game/cb/signals/Signal';
import { Random } from '@/game/cb/utils/Random';
import { app } from '@/game/app';
import { GameSounds } from '@/game/sound/GameSounds';
import { Buttons } from '@/game/util/Buttons';
import { Util } from '@/game/util/Util';
import { ConfirmationPopUp } from '@/game/view/screens/ConfirmationPopUp';
import type { Level } from '@/game/main_game/map/Level';

export class Pause extends AnimatedScreen {
  static BUTTONS = ['cancel', 'help', 'level_select', 'replay', 'sound'];
  onLevelSelect: any = null;
  onReplay: any = null;
  onCancel: any = null;
  level: any = null;
  constructor(level: Level) {
    super();
    this.level = level;
    this.initAnimatedScreen(app.swfLoader.getClass('assets.Pause'), this.getButtonInfo());
    this.initializeSignals();
    this.initialize();
  }
  getButtonInfo() {
    const dict = new Dictionary();
    const buttonGroup = ButtonGroup.get('gui');
    dict.set('cancel', buttonGroup.createButton(this.cancel, 'mouseOver', 'mouseOut'));
    dict.set('help', buttonGroup.createButton(this.help, 'mouseOver', 'mouseOut'));
    dict.set('level_select', buttonGroup.createButton(this.levelSelect, 'mouseOver', 'mouseOut'));
    dict.set('replay', buttonGroup.createButton(this.replay, 'mouseOver', 'mouseOut'));
    dict.set('sound', ButtonGroup.get('sound_gui').createButton(null, 'mouseOver', 'mouseOut'));
    return dict;
  }
  initializeSignals() {
    this.onCancel = new Signal();
    this.onLevelSelect = new Signal();
    this.onReplay = new Signal();
  }
  initialize() {
    this.bg.container.dungeon.title.text = this.level.getName();
    Buttons.setButtons(this.bg, Pause.BUTTONS, true);
    app.soundManager.updateSoundButton(this.bg['sound']);
    app.soundManager.playMusic(GameSounds.MAP_MUSIC);
    this.putAdvice(this.bg.tips.tip_text.title);
  }
  putAdvice(textField: any) {
    let num = 1;
    if (!app.theTutorial.isMixKnown()) {
      num = uint(app.config.get('InitialConfig').mixAdvices + 1);
    }
    const text = app.locale.get('advice' + Random.nextRange(num, app.config.get('InitialConfig').advices).toString());
    textField.text = text;
  }
  enter(callback: Function = null) {
    app.game.onPause.emit(true);
    super.enter(callback);
  }
  leave(callback: Function = null) {
    app.game.onPause.emit(false);
    Buttons.setButtons(this.bg, Pause.BUTTONS, false);
    super.leave(callback);
  }
  clear() {
    super.clear();
    this.onCancel.clear();
    this.onLevelSelect.clear();
    this.onReplay.clear();
  }
  replay(event: any = null) {
    this.showConfirmation(Util.l(this.emitAndLeave, this.onReplay), Util.pass);
  }
  levelSelect(event: any = null) {
    this.showConfirmation(Util.l(this.emitAndLeave, this.onLevelSelect), Util.pass);
  }
  emitAndLeave(signal2: Signal) {
    const signal = signal2;
    signal.emit();
    this.leave(() => {
      this.pop();
    });
  }
  showConfirmation(callback: Function, callback2: Function) {
    const text = app.locale.get('leave_dungeonConfirmation');
    const confirmationPopUp = new ConfirmationPopUp(this.bg, callback, callback2, text);
    app.tutorialHolder.addChild(confirmationPopUp);
    confirmationPopUp.enter();
  }
  help(event: any = null) {}
  cancel(event: any = null) {
    this.leave(() => {
      this.onCancel.emit();
      this.pop();
    });
  }
}
bindMethods(Pause);
