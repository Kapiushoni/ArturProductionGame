// @ts-nocheck
import { Dictionary, __DEFER, bindMethods, int, uint } from '@/flash/as3';
import { AnimatedScreen } from '@/game/view/screens/AnimatedScreen';
import { Functor } from '@/game/cb/actions/Functor';
import { ButtonGroup } from '@/game/cb/data/ButtonGroup';
import { SmartMC } from '@/game/cb/display/SmartMC';
import { EndCurrentLabel } from '@/game/conditions/EndCurrentLabel';
import { main } from '@/game/main';
import { Buttons } from '@/game/util/Buttons';
import { Util } from '@/game/util/Util';
import { CookBookPage } from '@/game/view/screens/main_game/cookBook/CookBookPage';
import { ArrowView } from '@/game/view/screens/main_game/map/ArrowView';

export class CookBook extends AnimatedScreen {
  readonly NEXT_ANIMATION = "toLeft";
  readonly PREVIOUS_ANIMATION = "toRight";
  declare actualPage: any;
  declare nextPage: any;
  declare nextButton: any;
  declare previousButton: any;
  declare actualIndex: any;
  constructor(callback) {super(__DEFER); 
          this.__init_AnimatedScreen(main.swfLoader.getClass("assets.Recipes"),this.getButtonInfo(callback));
         this.container = "container";
         this.initialize();
         this.initializeArrows();
         this.refreshArrows();
      }
  get recipes() {
         return main.saveSystem.recipes;
      }
  get initPageContainer() {
         return this.pagesContainer.recipesInit;
      }
  get nextPageContainer() {
         return this.pagesContainer.recipes_6_all;
      }
  get pagesContainer() { const __self = this;
         return __self.bg.container;
      }
  getButtonInfo(callback) {
         var dict = new Dictionary();
         dict.set("cancel", ButtonGroup.get("gui").createButton(callback,"mouseOver","mouseOut"));
         return dict;
      }
  initialize() { const __self = this;
         Buttons.setButtons(__self.bg.container,["cancel"],false);
         this.gotoIdle();
         this.actualIndex = uint(0);
         this.actualPage = this.makePage(this.actualIndex);
         this.initPageContainer.addChild(this.actualPage.getMc());
      }
  makePage(num) { num = uint(num);
         var list = new Array();
         var i = int(num * 6);
         while(i < this.recipes.length && i < (num + 1) * 6)
         {
            list.push(this.recipes[i]);
            i++;
         }
         return new CookBookPage(list);
      }
  initializeArrows() { const __self = this;
         this.nextButton = new ArrowView(__self.bg.container.arrow_right,this.toNextPage);
         this.previousButton = new ArrowView(__self.bg.container.arrow_left,this.toPreviousPage);
      }
  refreshArrows() {
         if(this.actualIndex > 0)
         {
            this.previousButton.show();
         }
         else
         {
            this.previousButton.hide();
         }
         if(this.recipes.length >= (this.actualIndex + 1) * 6)
         {
            this.nextButton.show();
         }
         else
         {
            this.nextButton.hide();
         }
      }
  toNextPage() {
         this.actualIndex = uint(this.actualIndex + (1));
         this.toActualPage(this.NEXT_ANIMATION);
      }
  toPreviousPage() {
         --this.actualIndex;
         this.toActualPage(this.PREVIOUS_ANIMATION);
      }
  toActualPage(text) {
         this.nextPage = this.makePage(this.actualIndex);
         this.nextPageContainer.addChild(this.nextPage.getMc());
         this.pagesContainer.gotoAndPlay(text);
         new SmartMC(this.pagesContainer).trigger(new EndCurrentLabel(this.pagesContainer),Functor.wrap(this.updatePage));
         this.previousButton.hide();
         this.nextButton.hide();
      }
  updatePage() {
         this.actualPage.pop();
         this.actualPage = this.nextPage;
         this.nextPage = null;
         this.nextPageContainer.removeChild(this.actualPage.getMc());
         this.initPageContainer.addChild(this.actualPage.getMc());
         this.gotoIdle();
         this.refreshArrows();
      }
  enter(callback = null) { const __self = this;
         super.enter(Util.concatenate(callback,Util.l(Buttons.setButtons,__self.bg.container,["cancel"],true)));
      }
  leave(callback = null) { const __self = this;
         Buttons.setButtons(__self.bg.container,["cancel"],false);
         this.pagesContainer.stop();
         super.leave(callback);
      }
  gotoIdle() {
         this.pagesContainer.gotoAndStop(this.NEXT_ANIMATION);
      }
  clear() {
         this.pagesContainer.stop();
         super.clear();
         this.actualPage.clear();
         this.actualPage = null;
         if(this.nextPage != null)
         {
            this.nextPage.clear();
         }
         this.nextPage = null;
         this.nextButton.clear();
         this.previousButton.clear();
      }
}
CookBook.prototype.actualPage = null;
CookBook.prototype.nextPage = null;
CookBook.prototype.nextButton = null;
CookBook.prototype.previousButton = null;
CookBook.prototype.actualIndex = 0;
bindMethods(CookBook);
