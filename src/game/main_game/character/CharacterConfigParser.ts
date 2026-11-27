import { Element } from '@/game/main_game/element/Element';
import type { CharacterConfigData } from '@/game/main_game/character/CharacterConfigData';

/** A row of characters.csv: { BaseHP, BaseAttack, BaseDefense, BaseLuck, BaseXP, Element, NameString }. */
export class CharacterConfigParser implements CharacterConfigData {
  private theBaseHP: number;
  private theBaseAttack: number;
  private theBaseDefense: number;
  private theBaseLuck: number;
  private theBaseXP: number;
  private theElement: Element;
  private theNameString: string;

  constructor(row: any) {
    this.theBaseHP = Number(row['BaseHP']);
    this.theBaseAttack = Number(row['BaseAttack']);
    this.theBaseDefense = Number(row['BaseDefense']);
    this.theBaseLuck = Number(row['BaseLuck']);
    this.theBaseXP = Number(row['BaseXP']);
    this.theElement = Element.parseElement(row['Element']);
    this.theNameString = row['NameString'];
  }
  get baseHP(): number {
    return this.theBaseHP;
  }
  get baseAttack(): number {
    return this.theBaseAttack;
  }
  get baseDefense(): number {
    return this.theBaseDefense;
  }
  get baseLuck(): number {
    return this.theBaseLuck;
  }
  get baseXP(): number {
    return this.theBaseXP;
  }
  get element(): Element {
    return this.theElement;
  }
  get nameString(): string {
    return this.theNameString;
  }
}
