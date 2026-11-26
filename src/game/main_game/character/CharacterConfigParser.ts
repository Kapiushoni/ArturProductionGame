// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { Element } from '@/game/main_game/element/Element';

export class CharacterConfigParser {
  declare theBaseHP: any;
  declare theBaseAttack: any;
  declare theBaseDefense: any;
  declare theBaseLuck: any;
  declare theBaseXP: any;
  declare theElement: any;
  declare theNameString: any;
  constructor(obj) {
         
         this.theBaseHP = Number(obj["BaseHP"]);
         this.theBaseAttack = Number(obj["BaseAttack"]);
         this.theBaseDefense = Number(obj["BaseDefense"]);
         this.theBaseLuck = Number(obj["BaseLuck"]);
         this.theBaseXP = Number(obj["BaseXP"]);
         this.theElement = Element.parseElement(obj["Element"]);
         this.theNameString = obj["NameString"];
      }
  get baseHP() {
         return Number(this.theBaseHP);
      }
  get baseAttack() {
         return Number(this.theBaseAttack);
      }
  get baseDefense() {
         return Number(this.theBaseDefense);
      }
  get baseLuck() {
         return Number(this.theBaseLuck);
      }
  get baseXP() {
         return Number(this.theBaseXP);
      }
  get element() {
         return this.theElement;
      }
  get nameString() {
         return this.theNameString;
      }
}
CharacterConfigParser.prototype.theBaseHP = NaN;
CharacterConfigParser.prototype.theBaseAttack = NaN;
CharacterConfigParser.prototype.theBaseDefense = NaN;
CharacterConfigParser.prototype.theBaseLuck = NaN;
CharacterConfigParser.prototype.theBaseXP = NaN;
CharacterConfigParser.prototype.theElement = null;
CharacterConfigParser.prototype.theNameString = null;
bindMethods(CharacterConfigParser);
