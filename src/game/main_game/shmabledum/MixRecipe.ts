// @ts-nocheck
import { as3as, bindMethods } from '@/flash/as3';

export class MixRecipe {
  declare item1Id: any;
  declare item2Id: any;
  declare resultId: any;
  constructor(item1Id, item2Id, resultId) {
         
         this.item1Id = item1Id;
         this.item2Id = item2Id;
         this.resultId = resultId;
      }
  equals(obj) {
         var mixRecipe = as3as(obj, MixRecipe);
         if(mixRecipe == null)
         {
            return false;
         }
         return this.result == mixRecipe.result && (mixRecipe.item1.getID() == this.item1.getID() && mixRecipe.item2.getID() == this.item2.getID() || mixRecipe.item2.getID() == this.item1.getID() && mixRecipe.item1.getID() == this.item2.getID());
      }
  get item1() {
         return this.item1Id;
      }
  get item2() {
         return this.item2Id;
      }
  get result() {
         return this.resultId;
      }
}
MixRecipe.prototype.item1Id = null;
MixRecipe.prototype.item2Id = null;
MixRecipe.prototype.resultId = null;
bindMethods(MixRecipe);
