// @ts-nocheck
import { bindMethods } from '@/flash/as3';

export class MixResult {
  declare _item: any;
  declare _recipe: any;
  constructor(item, recipe = null) {
         
         this._item = item;
         this._recipe = recipe;
      }
  get recipe() {
         return this._recipe;
      }
  get item() {
         return this._item;
      }
}
MixResult.prototype._item = null;
MixResult.prototype._recipe = null;
bindMethods(MixResult);
