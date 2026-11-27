import { Dictionary, bindMethods } from '@/flash/as3';
import { Functor } from '@/game/cb/actions/Functor';
import { ButtonGroup } from '@/game/cb/data/ButtonGroup';
import { Screen } from '@/game/cb/display/Screen';
import { SmartMC } from '@/game/cb/display/SmartMC';
import { Signal } from '@/game/cb/signals/Signal';
import { EndCurrentLabel } from '@/game/conditions/EndCurrentLabel';
import { main } from '@/game/main';
import { GameSounds } from '@/game/sound/GameSounds';
import { Buttons } from '@/game/util/Buttons';
import { Util } from '@/game/util/Util';
import { SlotView } from '@/game/view/screens/main_game/slot/SlotView';
import type { BubbleGumTip } from '@/game/main_game/shmabledum/BubbleGumTip';

export class ShmabledumPopUp {
  screen: any = null;
  showing = false;
  principalSlot: any = null;
  secondarySlot: any = null;
  onCancelSignal: any = null;
  constructor() {
    this.screen = new Screen(main.swfLoader.getClass('assets.PrincessPopUp'), this.getButtonInfo());
    this.showing = false;
    this.onCancelSignal = new Signal();
    this.mc.gotoAndStop('in');
    this.mc.visible = false;
  }
  get onCancel() {
    return this.onCancelSignal;
  }
  getButtonInfo() {
    var dict = new Dictionary();
    dict.set('container.cancel', ButtonGroup.get('gui').createButton(this.cancel, 'mouseOver', 'mouseOut'));
    return dict;
  }
  cancel(event: any) {
    this.onCancel.emit();
  }
  get mc() {
    return this.screen.getBg();
  }
  addIn(displayObjectContainer: any) {
    displayObjectContainer.addChild(this.screen);
  }
  hide(callback: Function = null) {
    if (this.showing) {
      Buttons.setButtons(this.screen.getBg(), ['container.cancel'], false);
      this.mc.gotoAndPlay('out');
      this.showing = false;
      new SmartMC(this.mc).trigger(new EndCurrentLabel(this.mc), Functor.wrap(Util.l(this.trueHide, callback)));
    } else if (callback != null) {
      callback();
    }
  }
  trueHide(callback: Function = null) {
    this.clearSlots();
    this.mc.visible = false;
    if (callback != null) {
      callback();
    }
  }
  show(callback: Function = null) {
    this.mc.visible = true;
    Buttons.setButtons(this.screen.getBg(), ['container.cancel'], true);
    if (!this.showing) {
      this.mc.gotoAndPlay('in');
      if (callback != null) {
        new SmartMC(this.mc).trigger(new EndCurrentLabel(this.mc), Functor.wrap(callback));
      }
      this.showing = true;
      main.soundManager.playFx(GameSounds.POP_UP);
    } else if (callback != null) {
      callback();
    }
  }
  get container() {
    return this.mc.container;
  }
  clearSlots() {
    if (this.principalSlot != null) {
      this.principalSlot.clear();
      this.principalSlot = null;
    }
    if (this.secondarySlot != null) {
      this.secondarySlot.clear();
      this.secondarySlot = null;
    }
  }
  refreshTip(bubbleGumTip: BubbleGumTip) {
    this.clearSlots();
    if (!bubbleGumTip.principalSlot.isEmpty() && !bubbleGumTip.secondarySlot.isEmpty()) {
      this.container.gotoAndStop('item_2');
    } else if (!bubbleGumTip.principalSlot.isEmpty() || !bubbleGumTip.secondarySlot.isEmpty()) {
      this.container.gotoAndStop('item');
    } else {
      this.container.gotoAndStop('basic');
    }
    this.principalSlot = new SlotView(bubbleGumTip.principalSlot);
    this.principalSlot.initialize(this.container.slot_1);
    this.secondarySlot = new SlotView(bubbleGumTip.secondarySlot);
    this.secondarySlot.initialize(this.container.slot_2);
    this.container.slot_1.mouseEnabled = false;
    this.container.slot_1.mouseChildren = false;
    this.container.slot_2.mouseEnabled = false;
    this.container.slot_2.mouseChildren = false;
    this.container.title.text = bubbleGumTip.tipText;
    if (bubbleGumTip.secondarySlot.isEmpty()) {
      this.container.slot_2.visible = false;
    } else {
      this.container.slot_2.visible = true;
    }
  }
  clear() {
    this.onCancelSignal.clear();
    this.onCancelSignal = null;
    this.screen.clear();
    this.screen = null;
    this.clearSlots();
  }
}
bindMethods(ShmabledumPopUp);
