// @ts-nocheck
import { Dictionary, __DEFER, bindMethods, uint } from '@/flash/as3';
import { AnimatedScreen } from '@/game/view/screens/AnimatedScreen';
import { Functor } from '@/game/cb/actions/Functor';
import { ButtonGroup } from '@/game/cb/data/ButtonGroup';
import { SmartMC } from '@/game/cb/display/SmartMC';
import { Signal } from '@/game/cb/signals/Signal';
import { EndCurrentLabel } from '@/game/conditions/EndCurrentLabel';
import { main } from '@/game/main';
import { Buttons } from '@/game/util/Buttons';
import { Util } from '@/game/util/Util';
import { ArrowView } from '@/game/view/screens/main_game/map/ArrowView';

export class ComicWindow extends AnimatedScreen {
  declare onNext: any;
  declare onBack: any;
  declare nextArrow: any;
  declare actualPage: any;
  declare totalPages: any;
  constructor(cls, totalPages) {super(__DEFER); const __self = this; 
         this.totalPages = uint(totalPages);
          this.__init_AnimatedScreen(cls,this.getButtonInfo(),"pic_1","end_pic_" + totalPages); totalPages = uint(totalPages);
         this.onNext = new Signal();
         this.onBack = new Signal();
         this.initializeText();
         this.nextArrow = new ArrowView((Util.getSprite(__self.bg,"arrow_right")),this.nextPage);
         main.soundManager.updateSoundButton(__self.bg.sound);
         this.actualPage = uint(1);
         __self.bg.gotoAndStop(1);
      }
  initializeText() {
         throw new Error("Abstract Class");
      }
  get music() {
         throw new Error("Abstract Class");
      }
  enter(callback = null) { const __self = this;
         super.enter(callback);
         this.nextArrow.show();
         main.soundManager.playMusic(this.music);
         Buttons.setButtons(__self.bg,["sound","ok","back"],true);
      }
  getButtonInfo() {
         var dict = new Dictionary();
         dict.set("ok", ButtonGroup.get("gui").createButton(this.next,"mouseOver","mouseOut"));
         dict.set("back", ButtonGroup.get("gui").createButton(this.toMainMenu,"mouseOver","mouseOut"));
         dict.set("sound", ButtonGroup.get("sound_gui").createButton(null,"mouseOver","mouseOut"));
         return dict;
      }
  nextPage() { const __self = this;
         this.nextArrow.hide();
         __self.bg.gotoAndPlay("end_pic_" + this.actualPage);
         new SmartMC(__self.bg).trigger(new EndCurrentLabel(__self.bg),Functor.wrap(this.endPageTransition));
      }
  endPageTransition() {
         this.actualPage = uint(this.actualPage + (1));
         if(this.actualPage != this.totalPages)
         {
            this.nextArrow.show();
         }
      }
  next(event) { const __self = this;
         Buttons.setButtons(__self.bg,["sound","ok","back"],false);
         this.onNext.emit();
      }
  toMainMenu(event) { const __self = this;
         Buttons.setButtons(__self.bg,["sound","ok","back"],false);
         this.onBack.emit();
      }
  exit() { const __self = this;
         __self.removeEvents();
         __self.pop();
      }
  clear() {
         super.clear();
         this.onNext.clear();
         this.onBack.clear();
      }
}
ComicWindow.prototype.onNext = null;
ComicWindow.prototype.onBack = null;
ComicWindow.prototype.nextArrow = null;
ComicWindow.prototype.actualPage = 0;
ComicWindow.prototype.totalPages = 0;
bindMethods(ComicWindow);
