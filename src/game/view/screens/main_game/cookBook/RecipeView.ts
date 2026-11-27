import { bindMethods } from '@/flash/as3';
import { NullSlot } from '@/game/main_game/item_containers/NullSlot';
import { ItemFactory } from '@/game/main_game/items/ItemFactory';
import { SlotView } from '@/game/view/screens/main_game/slot/SlotView';
import type { ISlot } from '@/game/main_game/item_containers/ISlot';
import type { Recipe } from '@/game/main_game/mixer/Recipe';
import type { MovieClip } from '@/flash/as3';

export class RecipeView {
  primarySlot: ISlot = null;
  secondarySlot: ISlot = null;
  resultSlot: ISlot = null;
  primaryView: SlotView = null;
  secondaryView: SlotView = null;
  resultView: SlotView = null;
  bg: MovieClip = null;
  constructor(bg: MovieClip, recipe: Recipe = null) {
    this.bg = bg;
    this.initializeSlots(recipe);
    this.initializeViews();
  }
  initializeSlots(recipe: Recipe) {
    let instance = null;
    this.primarySlot = new NullSlot();
    this.secondarySlot = new NullSlot();
    this.resultSlot = new NullSlot();
    if (recipe != null) {
      instance = ItemFactory.getInstance();
      this.primarySlot.add(instance.getItem(recipe.primary));
      this.secondarySlot.add(instance.getItem(recipe.secondary));
      this.resultSlot.add(instance.getItem(recipe.result));
    }
  }
  initializeViews() {
    this.primaryView = new SlotView(this.primarySlot);
    this.secondaryView = new SlotView(this.secondarySlot);
    this.resultView = new SlotView(this.resultSlot);
    this.primaryView.initialize(this.bg.slot_1);
    this.secondaryView.initialize(this.bg.slot_2);
    this.resultView.initialize(this.bg.slot_3);
    this.bg.slot_1.mouseEnabled = false;
    this.bg.slot_1.mouseChildren = false;
    this.bg.slot_2.mouseEnabled = false;
    this.bg.slot_2.mouseChildren = false;
    this.bg.slot_3.mouseEnabled = false;
    this.bg.slot_3.mouseChildren = false;
  }
  clear() {
    this.clearViews();
    this.clearSlots();
  }
  clearViews() {
    this.primaryView.clear();
    this.secondaryView.clear();
    this.resultView.clear();
  }
  clearSlots() {
    this.clearSlot(this.primarySlot);
    this.clearSlot(this.secondarySlot);
    this.clearSlot(this.resultSlot);
    this.primarySlot = null;
    this.secondarySlot = null;
    this.resultSlot = null;
  }
  clearSlot(slot: ISlot) {
    const content = slot.getContent();
    if (content != null) {
      content.clear();
    }
    slot.clear();
  }
}
bindMethods(RecipeView, ['clear']);
