import { bindMethods } from '@/flash/as3';
import { BaseState } from '@/game/bonus/states/BaseState';
import { ConstantDefinitionError } from '@/game/bonus/errors/ConstantDefinitionError';
import { LexicalParser } from '@/game/bonus/LexicalParser';
import { WaitingForAttribute } from '@/game/bonus/states/WaitingForAttribute';

/** The decimals of a number. */
export class FloatConstantDefinition extends BaseState {
  constructor(name: string, value: string) {
    super(name, value);
  }
  onDigit(char: string): BaseState {
    return this.addToValue(char);
  }
  onSpace(_char: string): BaseState {
    this.constantDefinition(LexicalParser.FLOAT, Number(this.value));
    return new WaitingForAttribute();
  }
  onMisc(char: string): BaseState {
    if (char == '}') {
      this.stream.ungetc();
      this.constantDefinition(LexicalParser.FLOAT, Number(this.value));
      return new WaitingForAttribute();
    }
    throw new ConstantDefinitionError('Expected a digit. got [' + char + ']', this.stream.getLineNumber());
  }
}
bindMethods(FloatConstantDefinition);
