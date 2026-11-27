import { Dictionary, __DEFER, bindMethods } from '@/flash/as3';
import { AnimatedScreen } from '@/game/view/screens/AnimatedScreen';
import { main } from '@/game/main';

export class DailyBonusView extends AnimatedScreen {
  message: any = null;
  constructor(dailyBonus, message) {
    super(__DEFER);
    this.__init_AnimatedScreen(main.swfLoader.getClass('assets.Bonus'), new Dictionary());
    this.container = 'bonus';
    this.message = message;
    this.initialize(dailyBonus);
    this.bg.gotoAndStop(0);
  }
  initialize(dailyBonus) {
    this.bg[this.container].title.title.text = this.message;
    var icon = dailyBonus.getIcon();
    var icons = dailyBonus.getFilter().getIcons();
    switch (icons.length) {
      case 3:
        icons[0].addToHolder(this.bg[this.container].holder_1a, dailyBonus.getAction());
        icons[1].addToHolder(this.bg[this.container].holder_1b, dailyBonus.getAction());
        icons[2].addToHolder(this.bg[this.container].holder_1c, dailyBonus.getAction());
        icon.addToHolder(this.bg[this.container].holder_1d);
        break;
      case 1:
        icons[0].addToHolder(this.bg[this.container].holder_2a, dailyBonus.getAction());
        icon.addToHolder(this.bg[this.container].holder_2b);
        break;
      case 0:
        icon.addToHolder(this.bg[this.container].holder_3b);
    }
  }
}
bindMethods(DailyBonusView);
