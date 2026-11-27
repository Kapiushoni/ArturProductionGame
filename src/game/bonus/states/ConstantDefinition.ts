import { bindMethods, int } from '@/flash/as3';
import { BaseState } from '@/game/bonus/states/BaseState';
import { ConstantDefinitionError } from '@/game/bonus/errors/ConstantDefinitionError';
import { LexicalParser } from '@/game/bonus/LexicalParser';
import { FloatConstantDefinition } from '@/game/bonus/states/FloatConstantDefinition';
import { WaitingForAttribute } from '@/game/bonus/states/WaitingForAttribute';

/** An integer (or the start of a float). */
export class ConstantDefinition extends BaseState {
  constructor(name: string) {
    super(name, '');
  }
  onDigit(char: string): BaseState {
    return this.addToValue(char);
  }
  onSpace(_char: string): BaseState {
    this.constantDefinition(LexicalParser.INTEGER, int(this.value));
    return new WaitingForAttribute();
  }
  onMisc(char: string): BaseState {
    if (char == '}') {
      this.stream.ungetc();
      this.constantDefinition(LexicalParser.INTEGER, int(this.value));
      return new WaitingForAttribute();
    }
    if (char == '.') {
      this.value += char;
      return new FloatConstantDefinition(this.name, this.value);
    }
    if (char == '-' && this.value == '') {
      this.value += char;
      return this;
    }
    throw new ConstantDefinitionError('Expected a digit. got [' + char + ']', this.stream.getLineNumber());
  }
}
bindMethods(ConstantDefinition);
