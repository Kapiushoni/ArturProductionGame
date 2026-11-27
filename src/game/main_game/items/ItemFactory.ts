import { bindMethods } from '@/flash/as3';
import { Item } from '@/game/main_game/items/Item';
import { MixItem } from '@/game/main_game/items/MixItem';
import { SaveError } from '@/game/persistence/SaveError';

/** Creates items from their config (items.csv: id -> row) and from saved items. Singleton. (Views: see ItemViews.) */
export class ItemFactory {
  static instance: ItemFactory = null;
  /** Dictionary: item id -> config row */
  static config: any = null;
  constructor(singletonLock: SingletonLock) {
    if (!singletonLock) {
      throw new Error('Static Class');
    }
  }
  static getInstance(): ItemFactory {
    if (ItemFactory.instance == null) {
      ItemFactory.instance = new ItemFactory(new SingletonLock());
    }
    return ItemFactory.instance;
  }
  static setConfig(dict: any) {
    ItemFactory.config = dict;
  }
  getItem(id: string): Item {
    return new Item(id, ItemFactory.config.get(id));
  }
  /** an item that is not in items.csv (a mix), from its full config */
  getCustomItem(id: string, config: any): MixItem {
    return new MixItem(id, config);
  }
  getConfigOfItem(id: string): any {
    return ItemFactory.config.get(id);
  }
  /** an item from its saved form: { id } or { mix: config } (see Item.toObject) */
  itemFromObject(obj: any): Item {
    if (obj.hasOwnProperty('id')) {
      return this.getItem(obj.id);
    }
    if (obj.hasOwnProperty('mix')) {
      return this.getCustomItem(obj.mix.id, obj.mix);
    }
    throw new SaveError('ItemCorrupted');
  }
}
bindMethods(ItemFactory);

class SingletonLock {}
bindMethods(SingletonLock);
