import { bindMethods } from '@/flash/as3';
import { BaseState } from '@/game/bonus/states/BaseState';
import { ClassDefinitionError } from '@/game/bonus/errors/ClassDefinitionError';
import { WaitingForConstant } from '@/game/bonus/states/WaitingForConstant';

/** An attribute name, then "=". */
export class AttributeDefinition extends BaseState {
  constructor() {
    super('');
  }
  onLetter(char: string): BaseState {
    return this.addToName(char);
  }
  onSpace(_char: string): BaseState {
    return this;
  }
  onMisc(char: string): BaseState {
    if (char == '=') {
      return new WaitingForConstant(this.name);
    }
    if (char == '_') {
      return this.addToName(char);
    }
    throw new ClassDefinitionError(
      "Variable names can't contain [" + char + '] character',
      this.stream.getLineNumber(),
    );
  }
  onDigit(char: string): BaseState {
    if (this.name == '') {
      throw new ClassDefinitionError('Variable names start with letters', this.stream.getLineNumber());
    }
    return this.addToName(char);
  }
}
bindMethods(AttributeDefinition);
