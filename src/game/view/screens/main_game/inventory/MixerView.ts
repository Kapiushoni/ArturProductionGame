import { MovieClip, as3as, as3values, bindMethods } from '@/flash/as3';
import { RemoveFromParent } from '@/game/cb/actions/RemoveFromParent';
import { ButtonInfo } from '@/game/cb/data/ButtonInfo';
import { SmartMC } from '@/game/cb/display/SmartMC';
import { EndCurrentLabel } from '@/game/conditions/EndCurrentLabel';
import { app } from '@/game/app';
import { Buttons } from '@/game/util/Buttons';
import { MixerClockView } from '@/game/view/screens/main_game/inventory/MixerClockView';
import { AutoSelectSlotView } from '@/game/view/screens/main_game/slot/AutoSelectSlotView';
import type { MouseEvent } from '@/flash/as3';

export class MixerView {
  bg: MovieClip = null;
  slots: any = null;
  clock_view: MixerClockView = null;
  top = null;
  constructor() {
    this.slots = new Array();
  }
  initialize(bg: MovieClip) {
    let slot = null;
    let autoSelectSlotView = null;
    this.bg = bg;
    this.bg.mouseEnabled = false;
    this.bg.mix_button.title.title.text = app.locale.get('mix');
    const mixer = app.game.getMixer();
    this.refreshButton();
    let i = 1;
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
      this.top = as3as(app.swfLoader.getObject('assets.MixTop'), MovieClip);
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
  mix(event: MouseEvent) {
    const mixer = app.game.getMixer();
    mixer.startMix();
    this.clock_view = new MixerClockView(mixer.clock);
    this.bg['mix_slot_3'].addChild(this.clock_view);
    this.refreshButton();
  }
  refreshButton() {
    const mixer = app.game.getMixer();
    Buttons.setButtons(this.bg, ['mix_button'], mixer.canMix());
    if (mixer.canMix()) {
      this.bg['mix_button'].gotoAndStop('idle');
    } else {
      this.bg['mix_button'].gotoAndStop('locked');
    }
  }
  mixButtonOut(event: MouseEvent) {
    if (!app.game.getMixer().canMix()) {
      event.stopPropagation();
      this.bg['mix_button'].gotoAndStop('locked');
    } else {
      ButtonInfo.defaultGoto('mouseOut', true)(event);
    }
  }
  clear() {
    for (const slot of as3values(this.slots)) {
      slot.clear();
    }
    this.slots = null;
  }
}
bindMethods(MixerView, ['disable', 'enable', 'change', 'mix', 'mixButtonOut', 'clear']);
