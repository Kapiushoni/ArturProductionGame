import { bindMethods, uint } from '@/flash/as3';
import { main } from '@/game/main';

export class BarView {
  mc: any = null;
  currentVal = NaN;
  totalVal = NaN;
  locale: any = null;
  localeText: any = null;
  constructor(mc, locale = null, localeText = '', currentVal = 0, totalVal = 100) {
    currentVal = Number(currentVal);
    totalVal = Number(totalVal);

    this.mc = mc;
    this.currentVal = Number(currentVal);
    this.totalVal = Number(totalVal);
    this.locale = locale;
    this.localeText = localeText;
    this.current = this.currentVal;
    this.total = this.totalVal;
  }
  get current() {
    return Number(this.currentVal);
  }
  get total() {
    return Number(this.totalVal);
  }
  set current(value) {
    value = Number(value);
    this.currentVal = Math.round(value);
    if (this.locale != null && this.localeText != '') {
      this.mc.title.title.text = main.locale.get(this.localeText, [this.current.toString(), this.total.toString()]);
    }
    var num = uint(Math.ceil((this.current * 100) / this.total));
    if (this.current != this.total) {
      num = uint(Math.min(99, num));
    }
    this.mc.gotoAndStop(num);
  }
  set total(value) {
    value = Number(value);
    this.totalVal = Math.ceil(value);
    if (this.locale != null && this.localeText != '') {
      this.mc.title.text = main.locale.get(this.localeText, [this.current.toString(), this.total.toString()]);
    }
    this.mc.gotoAndStop(Math.ceil((this.current * 100) / this.total));
  }
  clear() {
    this.mc = null;
    this.locale = null;
  }
}
bindMethods(BarView);
