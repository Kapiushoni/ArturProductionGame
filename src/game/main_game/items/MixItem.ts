// @ts-nocheck
import { bindMethods, int } from '@/flash/as3';
import { Item } from '@/game/main_game/items/Item';
import { main } from '@/game/main';
import { StatType } from '@/game/main_game/character/stats/StatType';

export class MixItem extends Item {
  constructor(text, obj) {
          super(text,obj);
      }
  getNameToShow() {
         var category = int(this.secondaryModifier.getCategory());
         if(category == StatType.NULL)
         {
            category = int(this.primaryModifier.getCategory());
         }
         return main.locale.get("mix" + StatType.stringOfStat(category),[super.getNameToShow()]);
      }
  toObject() { const __self = this;
         var value = {
            "id":this.id,
            "NameString":this.name,
            "Category":this.category.type,
            "MovieClip":this.mc_name,
            "FirstModifier":__self.primaryModifier.toObject(),
            "SecondModifier":__self.secondaryModifier.toObject(),
            "Element":this.element.type,
            "MixTime":this.mix_time,
            "MaxMod":this.maxMod,
            "Duration":this.duration
         };
         return {"mix":value};
      }
}
bindMethods(MixItem);
