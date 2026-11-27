import { as3as, bindMethods, int } from '@/flash/as3';
import { Liver } from '@/game/main_game/character/Liver';
import { StatType } from '@/game/main_game/character/stats/StatType';
import { Consumable } from '@/game/main_game/items/Consumable';
import { PotionEffect } from '@/game/view/effect/PotionEffect';
import { LeftSlotView } from '@/game/view/screens/main_game/slot/LeftSlotView';

export class LiverView {
  bg: any = null;
  stats: any = null;
  slot: any = null;
  showing = false;
  constructor(stats) {
    this.stats = stats;
  }
  initialize(liver, bg) {
    this.bg = bg;
    this.showing = false;
    bg.gotoAndStop('stop');
    this.bg.potion_mask.mouseEnabled = false;
    this.bg.potion_mask.mouseChildren = false;
    this.slot = new LeftSlotView(liver);
    this.slot.initialize(bg.modifiers_slot_3);
    liver.onLock.add(this.animate);
    liver.onChange.add(this.refresh);
    this.trueRefresh(liver);
  }
  animate(flag) {
    var text = null;
    if (flag == this.showing) {
      this.showing = !flag;
      text = flag ? 'out' : 'in';
      this.bg.gotoAndPlay(text);
    }
  }
  refresh(slotChange) {
    var liver = as3as(slotChange.getSlot(), Liver);
    this.trueRefresh(liver);
    if (slotChange.getOldItem() != null) {
      this.removeConsumable(slotChange.getOldItem());
    }
  }
  refreshGlow(liver) {
    var cbArray = liver.activeBuffs();
    this.stats.glowAttack(cbArray.indexOf(StatType.ATTACK) >= 0);
    this.stats.glowDefense(cbArray.indexOf(StatType.DEFENSE) >= 0);
    this.stats.glowLuck(cbArray.indexOf(StatType.LUCK) >= 0);
  }
  trueRefresh(liver) {
    var potionEffect = null;
    var consumable = null;
    this.refreshGlow(liver);
    if (!liver.isEmpty()) {
      this.slot.blockSelection();
      potionEffect = new PotionEffect(liver.getContent(), this.bg);
      potionEffect.y += this.bg.modifiers_slot_3.slot.height / 2;
      consumable = as3as(liver.getContent().getCategory(), Consumable);
      consumable.onChange.add(this.refreshMask);
    } else {
      this.removeMask();
    }
  }
  refreshMask(num) {
    num = int(num);
    this.bg.potion_mask.gotoAndStop(100 - num);
  }
  removeConsumable(item) {
    var consumable = as3as(item.getCategory(), Consumable);
    consumable.onChange.remove(this.refreshMask);
    consumable.atEndEffect.remove(this.removeConsumable);
    this.removeMask();
  }
  removeMask() {
    this.slot.unblockSelection();
    this.bg.potion_mask.gotoAndStop(0);
  }
  clear() {
    this.removeMask();
    this.slot.clear();
    this.slot = null;
    this.bg = null;
    this.stats = null;
  }
}
bindMethods(LiverView);
