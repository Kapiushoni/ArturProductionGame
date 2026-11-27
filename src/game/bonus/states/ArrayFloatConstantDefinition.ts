import { bindMethods } from '@/flash/as3';
import { BaseState } from '@/game/bonus/states/BaseState';
import { LexicalParser } from '@/game/bonus/LexicalParser';
import { ArrayDefinition } from '@/game/bonus/states/ArrayDefinition';
import { PossibleComment } from '@/game/bonus/states/PossibleComment';

/** The decimals of a number in an array. */
export class ArrayFloatConstantDefinition extends BaseState {
  constructor(name: string, value: string, parent: BaseState = null) {
    super(name, value, parent);
  }
  onDigit(char: string): BaseState {
    return this.addToValue(char);
  }
  onMisc(char: string): BaseState {
    if (char == '}') {
      this.stream.ungetc();
      this.constantDefinition(LexicalParser.ARRAY, Number(this.value));
      return new ArrayDefinition(this.name, this.parent);
    }
    if (char == ',') {
      this.constantDefinition(LexicalParser.ARRAY, Number(this.value));
      return new ArrayDefinition(this.name, this.parent);
    }
    if (char == '/') {
      return new PossibleComment(this);
    }
    return null;
  }
  onSpace(_char: string): BaseState {
    return this;
  }
}
bindMethods(ArrayFloatConstantDefinition);
