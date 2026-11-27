import { bindMethods } from '@/flash/as3';
import { BaseState } from '@/game/bonus/states/BaseState';
import { WaitingForEndArrayStringDefinition } from '@/game/bonus/states/WaitingForEndArrayStringDefinition';

/** A quoted string in an array. */
export class ArrayStringDefinition extends BaseState {
  private startSymbol: string;

  constructor(startSymbol: string, name: string, parent: BaseState = null) {
    super(name, '', parent);
    this.startSymbol = startSymbol;
  }
  onMisc(char: string): BaseState {
    if (char == this.startSymbol) {
      return new WaitingForEndArrayStringDefinition(this.name, this.value, this.parent);
    }
    return this.addToValue(char);
  }
  onLetter(char: string): BaseState {
    return this.addToValue(char);
  }
  onDigit(char: string): BaseState {
    return this.addToValue(char);
  }
  onSpace(char: string): BaseState {
    return this.addToValue(char);
  }
}
bindMethods(ArrayStringDefinition);
