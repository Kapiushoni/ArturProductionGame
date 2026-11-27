import { as3values } from '@/flash/as3';
import { app } from '@/game/app';
import { ProbabilisticSet } from '@/game/util/ProbabilisticSet';

export class BackgroundSet {
  types: ProbabilisticSet = null;
  constructor(backgrounds: any[]) {
    this.types = new ProbabilisticSet();
    for (const background of as3values(backgrounds)) {
      this.types.add(background, 1);
    }
  }
  getBackground() {
    const element = this.types.getElement();
    const cls = app.swfLoader.getClass('assets.' + element);
    return new cls();
  }
}
