// @ts-nocheck
import { Dictionary, __DEFER, bindMethods } from '@/flash/as3';
import { AnimatedScreen } from '@/game/view/screens/AnimatedScreen';
import { main } from '@/game/main';

export class DailyBonusView extends AnimatedScreen {
  declare message: any;
  constructor(dailyBonus, message) {super(__DEFER); const __self = this; 
          this.__init_AnimatedScreen(main.swfLoader.getClass("assets.Bonus"),new Dictionary());
         __self.container = "bonus";
         this.message = message;
         this.initialize(dailyBonus);
         __self.bg.gotoAndStop(0);
      }
  initialize(dailyBonus) { const __self = this;
         __self.bg[__self.container].title.title.text = this.message;
         var icon = dailyBonus.getIcon();
         var icons = dailyBonus.getFilter().getIcons();
         switch(icons.length)
         {
            case 3:
               icons[0].addToHolder(__self.bg[__self.container].holder_1a,dailyBonus.getAction());
               icons[1].addToHolder(__self.bg[__self.container].holder_1b,dailyBonus.getAction());
               icons[2].addToHolder(__self.bg[__self.container].holder_1c,dailyBonus.getAction());
               icon.addToHolder(__self.bg[__self.container].holder_1d);
               break;
            case 1:
               icons[0].addToHolder(__self.bg[__self.container].holder_2a,dailyBonus.getAction());
               icon.addToHolder(__self.bg[__self.container].holder_2b);
               break;
            case 0:
               icon.addToHolder(__self.bg[__self.container].holder_3b);
         }
      }
}
DailyBonusView.prototype.message = null;
bindMethods(DailyBonusView);
