import { as3values, bindMethods } from '@/flash/as3';
import { main } from '@/game/main';
import { ProbabilisticSet } from '@/game/util/ProbabilisticSet';

export class BackgroundSet {
  types: any = null;
  constructor(backgrounds: any[]) {
    var background = null;

    this.types = new ProbabilisticSet();
    for (background of as3values(backgrounds)) {
      this.types.add(background, 1);
    }
  }
  getBackground() {
    var element = this.types.getElement();
    var cls = main.swfLoader.getClass('assets.' + element);
    return new cls();
  }
}
bindMethods(BackgroundSet);
