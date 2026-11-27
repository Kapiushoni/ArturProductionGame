import { as3as, bindMethods } from '@/flash/as3';
import { Tween } from '@/game/cb/utils/Tween';
import { main } from '@/game/main';
import { HealthStat } from '@/game/main_game/character/stats/HealthStat';
import { StatType } from '@/game/main_game/character/stats/StatType';
import { BarView } from '@/game/view/screens/main_game/BarView';

export class HudView {
  stats: any = null;
  mc: any = null;
  bar: any = null;
  setter: any = null;
  constructor(cls, setter) {
    this.mc = new cls();
    this.setter = setter;
  }
  changeFighter(fighter) {
    if (this.stats != null) {
      this.stats.onChange.remove(this.refresh);
    }
    if (fighter != null) {
      this.stats = fighter.stats;
      this.stats.onChange.add(this.refresh);
      this.setter.setNameAndLevel(this.mc, fighter);
    } else {
      this.stats = null;
    }
    this.refresh();
  }
  initialize(displayObjectContainer) {
    this.mc.x = 0;
    this.mc.y = 0;
    displayObjectContainer.addChild(this.mc);
    this.bar = new BarView(this.mc.bar, main.locale, 'health_status');
    this.refresh();
  }
  refresh() {
    var health = null;
    Tween.killTweensOf(this.bar);
    if (this.stats != null) {
      health = this.getHealth();
      this.bar.total = health.getUpperBound().getValue();
      Tween.to(this.bar, 300, { current: health.getValue() }, () => {
        this.bar.current = health.getValue();
      });
    } else {
      this.bar.total = 100;
      this.bar.current = 0;
    }
    this.setter.setHud(this.mc, this.stats);
  }
  clear() {
    Tween.killTweensOf(this.bar);
    if (this.stats != null) {
      this.stats.onChange.remove(this.refresh);
    }
    this.stats = null;
    this.mc = null;
    this.bar.clear();
  }
  getHealth() {
    return as3as(this.stats.getStat(StatType.HEALTH), HealthStat);
  }
}
bindMethods(HudView);
