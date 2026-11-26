// @ts-nocheck
import { Dictionary, __DEFER, bindMethods } from '@/flash/as3';
import { AnimatedScreen } from '@/game/view/screens/AnimatedScreen';
import { ButtonGroup } from '@/game/cb/data/ButtonGroup';
import { main } from '@/game/main';
import { Buttons } from '@/game/util/Buttons';
import { Sepializer } from '@/game/util/Sepializer';
import { Util } from '@/game/util/Util';

export class ConfirmationPopUp extends AnimatedScreen {
  declare background: any;
  declare onAccept: any;
  declare onCancel: any;
  constructor(background, onAccept, onCancel, text) {super(__DEFER); const __self = this; 
          this.__init_AnimatedScreen(main.swfLoader.getClass("assets.NewGamePopup"),this.getButtonInfo());
         this.onAccept = onAccept;
         this.onCancel = onCancel;
         this.background = background;
         this.bg.addEventListener("blackIn",this.sepialize);
         this.bg.addEventListener("blackOut",this.unsepialize);
         Buttons.setButtons(__self.bg,["accept","cancel"],true);
         this.bg.container.text.title.text = text;
      }
  getButtonInfo() {
         var dict = new Dictionary();
         var buttonGroup = ButtonGroup.get("gui");
         dict.set("accept", buttonGroup.createButton(this.accept,"mouseOver","mouseOut"));
         dict.set("cancel", buttonGroup.createButton(this.cancel,"mouseOver","mouseOut"));
         return dict;
      }
  sepialize(event) {
         Sepializer.getInstance().sepialize(this.background);
      }
  unsepialize(event) {
         Sepializer.getInstance().unsepialize(this.background);
      }
  accept(event) { const __self = this;
         Buttons.setButtons(__self.bg,["accept","cancel"],false);
         this.onAccept();
         __self.pop();
      }
  cancel(event) { const __self = this;
         Buttons.setButtons(__self.bg,["accept","cancel"],false);
         __self.leave(Util.concatenate(this.onCancel,__self.pop));
      }
  clear() {
         this.bg.removeEventListener("blackIn",this.sepialize);
         this.bg.removeEventListener("blackOut",this.unsepialize);
         this.onAccept = null;
         this.background = null;
      }
}
ConfirmationPopUp.prototype.background = null;
ConfirmationPopUp.prototype.onAccept = null;
ConfirmationPopUp.prototype.onCancel = null;
bindMethods(ConfirmationPopUp);
