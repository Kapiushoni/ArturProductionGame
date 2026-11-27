import { bindMethods, int } from '@/flash/as3';
import { BaseState } from '@/game/bonus/states/BaseState';
import { LexicalParser } from '@/game/bonus/LexicalParser';
import { ArrayDefinition } from '@/game/bonus/states/ArrayDefinition';
import { ArrayClassConstantDefinition } from '@/game/bonus/states/ArrayClassConstantDefinition';
import { ArrayFloatConstantDefinition } from '@/game/bonus/states/ArrayFloatConstantDefinition';
import { PossibleComment } from '@/game/bonus/states/PossibleComment';

/** An integer element of an array (or the start of a float). */
export class ArrayConstantDefinition extends BaseState {
  constructor(name: string, parent: BaseState = null) {
    super(name, '', parent);
  }
  onDigit(char: string): BaseState {
    return this.addToValue(char);
  }
  onSpace(_char: string): BaseState {
    return this;
  }
  onLetter(_char: string): BaseState {
    this.stream.ungetc();
    return new ArrayClassConstantDefinition(this.name);
  }
  onMisc(char: string): BaseState {
    if (char == '}') {
      this.stream.ungetc();
      this.constantDefinition(LexicalParser.ARRAY, int(this.value));
      return new ArrayDefinition(this.name, this.parent);
    }
    if (char == '.') {
      this.value += char;
      return new ArrayFloatConstantDefinition(this.name, this.value, this.parent);
    }
    if (char == ',') {
      this.constantDefinition(LexicalParser.ARRAY, int(this.value));
      return new ArrayDefinition(this.name, this.parent);
    }
    if (char == '-') {
      return this.onDigit(char);
    }
    if (char == '/') {
      return new PossibleComment(this);
    }
    return null;
  }
}
bindMethods(ArrayConstantDefinition);
