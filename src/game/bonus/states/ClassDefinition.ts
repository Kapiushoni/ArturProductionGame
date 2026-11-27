import { bindMethods } from '@/flash/as3';
import { BaseState } from '@/game/bonus/states/BaseState';
import { ClassDefinitionError } from '@/game/bonus/errors/ClassDefinitionError';
import { WaitingForAttribute } from '@/game/bonus/states/WaitingForAttribute';
import { WaitingForEndClass } from '@/game/bonus/states/WaitingForEndClass';

/** A block name (letters, digits, _), then "{". */
export class ClassDefinition extends BaseState {
  constructor() {
    super('');
  }
  onLetter(char: string): BaseState {
    return this.addToName(char);
  }
  onDigit(char: string): BaseState {
    if (this.name == '') {
      throw new ClassDefinitionError('Class names start with letters', this.stream.getLineNumber());
    }
    return this.addToName(char);
  }
  onSpace(_char: string): BaseState {
    this.classNameDefinition(this.name);
    return new WaitingForEndClass();
  }
  onMisc(char: string): BaseState {
    if (char == '{') {
      this.classNameDefinition(this.name);
      return new WaitingForAttribute();
    }
    if (char == '_') {
      return this.onLetter(char);
    }
    throw new ClassDefinitionError("Class names can't contain [" + char + '] character', this.stream.getLineNumber());
  }
}
bindMethods(ClassDefinition);
