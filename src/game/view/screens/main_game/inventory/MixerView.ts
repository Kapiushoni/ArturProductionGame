import { MovieClip, as3as, as3values, bindMethods } from '@/flash/as3';
import { RemoveFromParent } from '@/game/cb/actions/RemoveFromParent';
import { ButtonInfo } from '@/game/cb/data/ButtonInfo';
import { SmartMC } from '@/game/cb/display/SmartMC';
import { EndCurrentLabel } from '@/game/conditions/EndCurrentLabel';
import { main } from '@/game/main';
import { Buttons } from '@/game/util/Buttons';
import { MixerClockView } from '@/game/view/screens/main_game/inventory/MixerClockView';
import { AutoSelectSlotView } from '@/game/view/screens/main_game/slot/AutoSelectSlotView';

export class MixerView {
  bg: any = null;
  slots: any = null;
  clock_view: any = null;
  top = null;
  constructor() {
    this.slots = new Array();
  }
  initialize(bg: any) {
    var slot = null;
    var autoSelectSlotView = null;
    this.bg = bg;
    this.bg.mouseEnabled = false;
    this.bg.mix_button.title.title.text = main.locale.get('mix');
    var mixer = main.game.getMixer();
    this.refreshButton();
    var i = 1;
    while (i <= 3) {
      slot = mixer.getSlot(i);
      slot.onChange.add(this.change);
      autoSelectSlotView = new AutoSelectSlotView(slot);
      this.slots[i - 1] = autoSelectSlotView;
      autoSelectSlotView.initialize(this.bg['mix_slot_' + i]);
      i++;
    }
  }
  disable() {
    if (this.top == null) {
      this.top = as3as(main.swfLoader.getObject('assets.MixTop'), MovieClip);
      this.top.gotoAndStop('idle');
      this.bg.parent.addChild(this.top);
    }
  }
  enable() {
    if (this.top != null) {
      this.top.gotoAndPlay('out');
      new SmartMC(this.top).trigger(new EndCurrentLabel(this.top), new RemoveFromParent());
      this.top = null;
    }
  }
  change(value = null) {
    this.refreshButton();
  }
  mix(event: any) {
    var mixer = main.game.getMixer();
    mixer.startMix();
    this.clock_view = new MixerClockView(mixer.clock);
    this.bg['mix_slot_3'].addChild(this.clock_view);
    this.refreshButton();
  }
  refreshButton() {
    var mixer = main.game.getMixer();
    Buttons.setButtons(this.bg, ['mix_button'], mixer.canMix());
    if (mixer.canMix()) {
      this.bg['mix_button'].gotoAndStop('idle');
    } else {
      this.bg['mix_button'].gotoAndStop('locked');
    }
  }
  mixButtonOut(event: any) {
    if (!main.game.getMixer().canMix()) {
      event.stopPropagation();
      this.bg['mix_button'].gotoAndStop('locked');
    } else {
      ButtonInfo.defaultGoto('mouseOut', true)(event);
    }
  }
  clear() {
    var slot = null;
    for (slot of as3values(this.slots)) {
      slot.clear();
    }
    this.slots = null;
  }
}
bindMethods(MixerView);
