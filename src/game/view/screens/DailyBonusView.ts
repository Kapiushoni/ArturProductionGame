import { Dictionary, bindMethods } from '@/flash/as3';
import { AnimatedScreen } from '@/game/view/screens/AnimatedScreen';
import { app } from '@/game/app';
import type { BonusIcon } from '@/game/bonus/filter/BonusIcon';
import type { IDailyBonus } from '@/game/bonus/IDailyBonus';

export class DailyBonusView extends AnimatedScreen {
  message: any = null;
  constructor(dailyBonus: IDailyBonus, message: string) {
    super();
    this.initAnimatedScreen(app.swfLoader.getClass('assets.Bonus'), new Dictionary());
    this.container = 'bonus';
    this.message = message;
    this.initialize(dailyBonus);
    this.bg.gotoAndStop(0);
  }
  /** adds the icon's clip ("assets.<prefix><type>" on frame label) to the holder */
  addIcon(icon: BonusIcon, holder: any, prefix = '') {
    const cls = app.swfLoader.getClass('assets.' + prefix + icon.type);
    const clip = new cls();
    if (icon.title != null) {
      clip.title.title.text = icon.title;
    }
    clip.gotoAndStop(icon.label);
    holder.addChild(clip);
  }
  initialize(dailyBonus: IDailyBonus) {
    this.bg[this.container].title.title.text = this.message;
    const icon = dailyBonus.getIcon();
    const icons = dailyBonus.getFilter().getIcons();
    switch (icons.length) {
      case 3:
        this.addIcon(icons[0], this.bg[this.container].holder_1a, dailyBonus.getAction());
        this.addIcon(icons[1], this.bg[this.container].holder_1b, dailyBonus.getAction());
        this.addIcon(icons[2], this.bg[this.container].holder_1c, dailyBonus.getAction());
        this.addIcon(icon, this.bg[this.container].holder_1d);
        break;
      case 1:
        this.addIcon(icons[0], this.bg[this.container].holder_2a, dailyBonus.getAction());
        this.addIcon(icon, this.bg[this.container].holder_2b);
        break;
      case 0:
        this.addIcon(icon, this.bg[this.container].holder_3b);
    }
  }
}
bindMethods(DailyBonusView);
