import { bindMethods, int } from '@/flash/as3';
import { services } from '@/game/services';
import { Item } from '@/game/main_game/items/Item';
import { StatType } from '@/game/main_game/character/stats/StatType';

/** An item made in the mixer: its whole config is saved, since it is not in items.csv. */
export class MixItem extends Item {
  getNameToShow(): string {
    let category = int(this.secondaryModifier.getCategory());
    if (category == StatType.NULL) {
      category = int(this.primaryModifier.getCategory());
    }
    return services.texts.get('mix' + StatType.stringOfStat(category), [super.getNameToShow()]);
  }
  toObject(): any {
    return {
      mix: {
        id: this.id,
        NameString: this.name,
        Category: this.category.type,
        MovieClip: this.mc_name,
        FirstModifier: this.primaryModifier.toObject(),
        SecondModifier: this.secondaryModifier.toObject(),
        Element: this.element.type,
        MixTime: this.mix_time,
        MaxMod: this.maxMod,
        Duration: this.duration,
      },
    };
  }
}
bindMethods(MixItem);
