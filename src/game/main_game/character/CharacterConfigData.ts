import type { Element } from '@/game/main_game/element/Element';

/** Base values of a character (a row of characters.csv, see CharacterConfigParser). */
export interface CharacterConfigData {
  get baseHP(): number;
  get baseAttack(): number;
  get baseDefense(): number;
  get baseLuck(): number;
  get baseXP(): number;
  get element(): Element;
  get nameString(): string;
}
