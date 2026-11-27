import { MovieClip, as3as, bindMethods, int, uint } from '@/flash/as3';
import { Tween } from '@/game/cb/utils/Tween';
import { DragListener } from '@/game/drag_and_drop/DragListener';
import { main } from '@/game/main';
import { Experience } from '@/game/main_game/character/stats/Experience';
import { HealthStat } from '@/game/main_game/character/stats/HealthStat';
import { PersistentExperience } from '@/game/main_game/character/stats/PersistentExperience';
import { StatType } from '@/game/main_game/character/stats/StatType';
import { Util } from '@/game/util/Util';
import { BarView } from '@/game/view/screens/main_game/BarView';
import { LiverView } from '@/game/view/screens/main_game/inventory/LiverView';
import { LeftSlotView } from '@/game/view/screens/main_game/slot/LeftSlotView';

export class StatsView {
  bg: any = null;
  drag_listener: any = null;
  weapon_slot: any = null;
  shield_slot: any = null;
  equip_slot_1: any = null;
  equip_slot_2: any = null;
  liver: any = null;
  lastLevel = 0;
  experience: any = null;
  constructor() {
    this.liver = new LiverView(this);
  }
  initialize(bg: any) {
    this.bg = bg;
    this.drag_listener = new DragListener(bg, main.game.getJinn().liver);
    var stats = main.game.getJinn().stats;
    var experience = as3as(stats.getStat(StatType.EXPERIENCE), Experience);
    this.experience = new BarView(
      as3as(this.bg.xp, MovieClip),
      main.locale,
      'experience_status',
      experience.getValue(),
      experience.getUpperBound(),
    );
    this.initializeStats();
    this.initializeSlots();
    this.liver.initialize(main.game.getJinn().liver, this.bg.potion);
  }
  initializeStats() {
    main.game.getJinn().stats.onChange.add(this.refresh);
    var stats = main.game.getJinn().stats;
    this.bg.health.title.title.text = as3as(stats.getStat(StatType.HEALTH), HealthStat).getUpperBound().getValue();
    this.bg.defence.title.title.text = stats.getDefense();
    this.bg.weapon.title.title.text = stats.getAttack();
    this.bg.luck.title.title.text = stats.getLuck();
    this.lastLevel = uint(stats.getLevel());
    this.refresh();
  }
  refresh() {
    var stats = main.game.getJinn().stats;
    this.updateLevelAndXp(stats.getLevel(), as3as(stats.getStat(StatType.EXPERIENCE), PersistentExperience));
    this.updateHealth(as3as(stats.getStat(StatType.HEALTH), HealthStat).getUpperBound().getValue());
    this.updateDefense(stats.getDefense());
    this.updateAttack(stats.getAttack());
    this.updateLuck(stats.getLuck());
  }
  initializeSlots() {
    var gear = main.game.getJinn().gear;
    this.weapon_slot = new LeftSlotView(gear.weapon);
    this.shield_slot = new LeftSlotView(gear.shield);
    this.equip_slot_1 = new LeftSlotView(gear.equipment_1);
    this.equip_slot_2 = new LeftSlotView(gear.equipment_2);
    this.equip_slot_1.initialize(this.bg.modifiers_slot_1);
    this.equip_slot_2.initialize(this.bg.modifiers_slot_2);
    this.weapon_slot.initialize(this.bg.weapon_slot_2);
    this.shield_slot.initialize(this.bg.weapon_slot_1);
  }
  updateLevelAndXp(lastLevel: number, persistentExperience: PersistentExperience) {
    lastLevel = uint(lastLevel);
    this.bg['level'].title_1.text = main.locale.get('level', [lastLevel]);
    if (lastLevel != this.lastLevel) {
      this.experience.current = 0;
      this.experience.total = persistentExperience.getUpperBound();
    }
    this.updateBar(this.experience, persistentExperience.getValue(), persistentExperience.getUpperBound());
    this.lastLevel = uint(lastLevel);
  }
  updateBar(barView: BarView, current: number, total: number) {
    current = Number(current);
    total = Number(total);
    Tween.killTweensOf(barView);
    Tween.to(barView, 300, {
      current: current,
      total: total,
    });
  }
  makeGlow(flag: boolean, textField: any) {
    if (flag) {
      textField.textColor = 16776960;
    } else {
      textField.textColor = 14605481;
    }
  }
  glowDefense(flag: boolean) {
    this.makeGlow(flag, this.bg.defence.title.title);
  }
  glowAttack(flag: boolean) {
    this.makeGlow(flag, this.bg.weapon.title.title);
  }
  glowLuck(flag: boolean) {
    this.makeGlow(flag, this.bg.luck.title.title);
  }
  updateHealth(num: number) {
    num = int(num);
    this.updateText(this.bg.health.title.title, num);
  }
  updateDefense(num: number) {
    num = int(num);
    this.updateText(this.bg.defence.title.title, num);
  }
  updateAttack(num: number) {
    num = int(num);
    this.updateText(this.bg.weapon.title.title, num);
  }
  updateLuck(num: number) {
    num = int(num);
    this.updateText(this.bg.luck.title.title, num);
  }
  updateText(textField: any, num: number) {
    num = Number(num);
    Tween.killTweensOf(textField);
    Tween.to(textField, 300, { text: num }, null, Util.l(this.interize, textField));
  }
  interize(textField: any) {
    var text = textField.text;
    textField.text = text.split('.')[0];
  }
  killTweens() {
    Tween.killTweensOf(this.experience);
    Tween.killTweensOf(this.bg.health.title.title);
    Tween.killTweensOf(this.bg.defence.title.title);
    Tween.killTweensOf(this.bg.weapon.title.title);
    Tween.killTweensOf(this.bg.luck.title.title);
  }
  clear() {
    this.killTweens();
    this.drag_listener.clear();
    this.equip_slot_1.clear();
    this.equip_slot_2.clear();
    this.weapon_slot.clear();
    this.shield_slot.clear();
    this.liver.clear();
    this.experience.clear();
  }
}
bindMethods(StatsView);
