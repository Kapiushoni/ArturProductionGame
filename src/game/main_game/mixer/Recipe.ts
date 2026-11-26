// @ts-nocheck
import { bindMethods, int } from '@/flash/as3';
import { MixStrategy } from '@/game/main_game/mixer/MixStrategy';

export class Recipe {
  declare id: any;
  declare i1: any;
  declare i2: any;
  declare res: any;
  declare show: any;
  constructor(id, i1, i2, res, show) { id = int(id);
         
         this.id = int(id);
         this.i1 = i1;
         this.i2 = i2;
         this.res = res;
         this.show = show;
      }
  getId() {
         return int(this.id);
      }
  get mustShow() {
         return this.show;
      }
  areIngredients(item, item2, flag = false) {
         var text = MixStrategy.removeMix(item.getID());
         var text2 = MixStrategy.removeMix(item2.getID());
         return text == this.i1 && text2 == this.i2 || !flag && text2 == this.i1 && text == this.i2;
      }
  isResult(item) {
         return item.getID() == this.res;
      }
  get primary() {
         return this.i1;
      }
  get secondary() {
         return this.i2;
      }
  get result() {
         return this.res;
      }
}
Recipe.prototype.id = 0;
Recipe.prototype.i1 = null;
Recipe.prototype.i2 = null;
Recipe.prototype.res = null;
Recipe.prototype.show = false;
bindMethods(Recipe);
