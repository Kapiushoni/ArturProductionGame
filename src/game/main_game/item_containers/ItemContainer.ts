/** Something that can hold items: says which kinds of items it accepts (see Category.canBeContained). */
export interface ItemContainer {
  canContainEquipment(): boolean;
  canContainWeapon(): boolean;
  canContainConsumable(): boolean;
  canContainShield(): boolean;
}
