import { Dictionary, bindMethods, uint } from '@/flash/as3';
import { AnimatedScreen } from '@/game/view/screens/AnimatedScreen';
import { Functor } from '@/game/cb/actions/Functor';
import { ButtonGroup } from '@/game/cb/data/ButtonGroup';
import { SmartMC } from '@/game/cb/display/SmartMC';
import { Signal } from '@/game/cb/signals/Signal';
import { EndCurrentLabel } from '@/game/conditions/EndCurrentLabel';
import { app } from '@/game/app';
import { Buttons } from '@/game/util/Buttons';
import { Util } from '@/game/util/Util';
import { ArrowView } from '@/game/view/screens/main_game/map/ArrowView';

export class ComicWindow extends AnimatedScreen {
  onNext: any = null;
  onBack: any = null;
  nextArrow: any = null;
  actualPage = 0;
  totalPages = 0;
  constructor(cls: any, totalPages: number) {
    super();
    this.totalPages = uint(totalPages);
    this.initAnimatedScreen(cls, this.getButtonInfo(), 'pic_1', 'end_pic_' + totalPages);
    totalPages = uint(totalPages);
    this.onNext = new Signal();
    this.onBack = new Signal();
    this.initializeText();
    this.nextArrow = new ArrowView(Util.getSprite(this.bg, 'arrow_right'), this.nextPage);
    app.soundManager.updateSoundButton(this.bg.sound);
    this.actualPage = 1;
    this.bg.gotoAndStop(1);
  }
  initializeText() {
    throw new Error('Abstract Class');
  }
  get music(): string {
    throw new Error('Abstract Class');
  }
  enter(callback: Function = null) {
    super.enter(callback);
    this.nextArrow.show();
    app.soundManager.playMusic(this.music);
    Buttons.setButtons(this.bg, ['sound', 'ok', 'back'], true);
  }
  getButtonInfo() {
    const dict = new Dictionary();
    dict.set('ok', ButtonGroup.get('gui').createButton(this.next, 'mouseOver', 'mouseOut'));
    dict.set('back', ButtonGroup.get('gui').createButton(this.toMainMenu, 'mouseOver', 'mouseOut'));
    dict.set('sound', ButtonGroup.get('sound_gui').createButton(null, 'mouseOver', 'mouseOut'));
    return dict;
  }
  nextPage() {
    this.nextArrow.hide();
    this.bg.gotoAndPlay('end_pic_' + this.actualPage);
    new SmartMC(this.bg).trigger(new EndCurrentLabel(this.bg), Functor.wrap(this.endPageTransition));
  }
  endPageTransition() {
    this.actualPage = uint(this.actualPage + 1);
    if (this.actualPage != this.totalPages) {
      this.nextArrow.show();
    }
  }
  next(event: any) {
    Buttons.setButtons(this.bg, ['sound', 'ok', 'back'], false);
    this.onNext.emit();
  }
  toMainMenu(event: any) {
    Buttons.setButtons(this.bg, ['sound', 'ok', 'back'], false);
    this.onBack.emit();
  }
  exit() {
    this.removeEvents();
    this.pop();
  }
  clear() {
    super.clear();
    this.onNext.clear();
    this.onBack.clear();
  }
}
bindMethods(ComicWindow);
