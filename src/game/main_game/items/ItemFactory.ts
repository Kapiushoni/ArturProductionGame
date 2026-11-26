// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { Category } from '@/game/main_game/items/Category';
import { Item } from '@/game/main_game/items/Item';
import { MixItem } from '@/game/main_game/items/MixItem';
import { SaveError } from '@/game/persistence/SaveError';
import { ConsumableView } from '@/game/view/items/ConsumableView';
import { EquipmentView } from '@/game/view/items/EquipmentView';
import { NullShieldModifier } from '@/game/view/items/modifiers/NullShieldModifier';
import { NullSwordModifier } from '@/game/view/items/modifiers/NullSwordModifier';
import { ShieldModifier } from '@/game/view/items/modifiers/ShieldModifier';
import { SwordModifier } from '@/game/view/items/modifiers/SwordModifier';
import { ShieldView } from '@/game/view/items/ShieldView';
import { WeaponView } from '@/game/view/items/WeaponView';

export class ItemFactory {
  static instance = null;
  static config = null;
  constructor(singletonLock) {
         
         if(!singletonLock)
         {
            throw new Error("Static Class");
         }
      }
  static getInstance() {
         if(ItemFactory.instance == null)
         {
            ItemFactory.instance = new ItemFactory(new SingletonLock());
         }
         return ItemFactory.instance;
      }
  static setConfig(dict) {
         ItemFactory.config = dict;
      }
  getItem(text) {
         return new Item(text,ItemFactory.config.get(text));
      }
  getCustomItem(text, obj) {
         return new MixItem(text,obj);
      }
  getConfigOfItem(text) {
         return ItemFactory.config.get(text);
      }
  itemFromObject(obj) {
         if(obj.hasOwnProperty("id"))
         {
            return this.getItem(obj.id);
         }
         if(obj.hasOwnProperty("mix"))
         {
            return this.getCustomItem(obj.mix.id,obj.mix);
         }
         throw new SaveError("ItemCorrupted");
      }
  getView(item) {
         var itemView = null;
         switch(item.getCategory().type)
         {
            case Category.EQUIPABLE_CATEGORY:
               itemView = new EquipmentView(item);
               break;
            case Category.CONSUMABLE_CATEGORY:
               itemView = new ConsumableView(item);
               break;
            case Category.WEAPON_CATEGORY:
               itemView = new WeaponView(item);
               break;
            case Category.SHIELD_CATEGORY:
               itemView = new ShieldView(item);
               break;
            default:
               throw new Error("Unknown type");
         }
         return itemView;
      }
  getShieldModifier(item) {
         if(item == null)
         {
            return new NullShieldModifier();
         }
         return new ShieldModifier(item.getMcName(),item.getSecondaryModifier().toObject().Category);
      }
  getSwordModifier(item) {
         if(item == null)
         {
            return new NullSwordModifier();
         }
         return new SwordModifier(item.getMcName(),item.getSecondaryModifier().toObject().Category);
      }
}
bindMethods(ItemFactory);

class SingletonLock {
  constructor() {
      
   }
}
bindMethods(SingletonLock);
